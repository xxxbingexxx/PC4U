
import { createAuth0Client } from '@auth0/auth0-spa-js';
import { supabase } from './supabase-client.js';
import { APP_CONFIG } from './app-config.js';

// DOM Elements
const postDetailContainer = document.getElementById('post-detail-container');

let auth0Client;
let user = null;
let currentPostId = null;

// Initialize
async function init() {
    // Get Post ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentPostId = urlParams.get('id');

    if (!currentPostId) {
        postDetailContainer.innerHTML = '<div class="error-message">Post not found.</div>';
        return;
    }

    await initAuth0();
    await loadPostDetail();
}

async function initAuth0() {
    try {
        if (!APP_CONFIG.USE_LOCAL_AUTH)
        {
            const response = await fetch('/auth_config.json');
            const config = await response.json();
        }

        auth0Client = await createAuth0Client({
            domain: APP_CONFIG.USE_LOCAL_AUTH ? import.meta.env.VITE_AUTH0_DOMAIN : config.domain,
            clientId: APP_CONFIG.USE_LOCAL_AUTH ? import.meta.env.VITE_AUTH0_CLIENT_ID : config.clientId,
            cacheLocation: 'localstorage',
            authorizationParams: {
            redirect_uri: APP_CONFIG.USE_LOCAL_AUTH
                ? window.location.origin + "/login/login.html"
                : window.location.origin + "/login/login"
            },
        useRefreshTokens: true,
        });

        const isAuthenticated = await auth0Client.isAuthenticated();
        if (isAuthenticated) {
            user = await auth0Client.getUser();
        }
    } catch (error) {
        console.error("Auth init error:", error);
    }
}

async function loadPostDetail() {
    try {
        // Fetch post
        const { data: post, error: postError } = await supabase
            .from('posts')
            .select('*')
            .eq('id', currentPostId)
            .single();

        if (postError) throw postError;

        // Fetch replies
        const { data: replies, error: replyError } = await supabase
            .from('replies')
            .select('*')
            .eq('post_id', currentPostId)
            .order('created_at', { ascending: true });

        if (replyError) throw replyError;

        renderPostDetail(post, replies || []);

    } catch (err) {
        console.error("Error loading post:", err);
        postDetailContainer.innerHTML = '<div class="error-message">Failed to load post. It may have been deleted.</div>';
    }
}

function renderPostDetail(post, replies) {
    const date = new Date(post.created_at).toLocaleDateString() + ' ' + new Date(post.created_at).toLocaleTimeString();
    const isAuthor = user && user.email === post.author_email;

    let imageHtml = '';
    if (post.image_url) {
        imageHtml = `<div class="post-image"><img src="${escapeHtml(post.image_url)}" alt="Post Image"></div>`;
    }

    let deleteBtnHtml = '';
    if (isAuthor) {
        deleteBtnHtml = `<button class="delete-btn" id="delete-post-btn">Delete Post</button>`;
    }

    let repliesHtml = replies.map(reply => {
        const isReplyAuthor = user && user.email === reply.author_email;
        const replyDeleteBtn = isReplyAuthor ?
            `<button class="delete-reply-btn" data-id="${reply.id}">Delete</button>` : '';

        return `
            <div class="reply" id="reply-${reply.id}">
                <div class="reply-header">
                    <span class="reply-meta">${escapeHtml(reply.author_name)}</span>
                    ${replyDeleteBtn}
                </div>
                <div class="reply-content">${escapeHtml(reply.content)}</div>
            </div>
        `;
    }).join('');

    const replyFormHtml = user ? `
        <form id="reply-form" class="reply-form">
            <input type="text" id="reply-content" placeholder="Write a reply..." required>
            <button type="submit" class="reply-btn">Reply</button>
        </form>
    ` : '<div class="login-prompt-small">Please log in to reply.</div>';

    postDetailContainer.innerHTML = `
        <div class="post-card full-post">
            <div class="post-header">
                <h1 class="post-title-large">${escapeHtml(post.title)}</h1>
                <div class="post-meta-row">
                    <span class="post-meta">by ${escapeHtml(post.author_name)} on ${date}</span>
                    ${deleteBtnHtml}
                </div>
            </div>
            <div class="post-content-large">${escapeHtml(post.content)}</div>
            ${imageHtml}
            
            <div class="replies-section">
                <h3>Replies (${replies.length})</h3>
                <div id="replies-list">
                    ${repliesHtml}
                </div>
                ${replyFormHtml}
            </div>
        </div>
    `;

    // Event Listeners
    if (isAuthor) {
        document.getElementById('delete-post-btn').addEventListener('click', handleDeletePost);
    }

    if (user) {
        document.getElementById('reply-form').addEventListener('submit', handleReplySubmit);

        document.querySelectorAll('.delete-reply-btn').forEach(btn => {
            btn.addEventListener('click', handleDeleteReply);
        });
    }
}

async function handleDeletePost() {
    if (!confirm("Are you sure you want to delete this post? This cannot be undone.")) return;

    try {
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', currentPostId);

        if (error) throw error;

        alert("Post deleted.");
        window.location.href = 'discussion.html';
    } catch (err) {
        console.error("Error deleting post:", err);
        alert("Failed to delete post.");
    }
}

async function handleDeleteReply(e) {
    if (!confirm("Delete this reply?")) return;

    const replyId = e.target.dataset.id;

    try {
        const { error } = await supabase
            .from('replies')
            .delete()
            .eq('id', replyId);

        if (error) throw error;

        // Remove from DOM
        document.getElementById(`reply-${replyId}`).remove();
    } catch (err) {
        console.error("Error deleting reply:", err);
        alert("Failed to delete reply.");
    }
}

async function handleReplySubmit(e) {
    e.preventDefault();
    if (!user) return;

    const input = document.getElementById('reply-content');
    const btn = e.target.querySelector('button');
    const content = input.value.trim();

    if (!content) return;

    btn.disabled = true;
    btn.textContent = '...';

    try {
        const { data, error } = await supabase
            .from('replies')
            .insert([
                {
                    post_id: currentPostId,
                    content,
                    author_name: user.name || user.email || 'Anonymous',
                    author_email: user.email
                }
            ])
            .select(); // Select to get the ID back

        if (error) throw error;

        // Reload to show new reply (simplest way to get correct ID and render)
        await loadPostDetail();

    } catch (err) {
        console.error("Error creating reply:", err);
        alert("Failed to reply.");
    } finally {
        btn.disabled = false;
        btn.textContent = 'Reply';
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

init();
