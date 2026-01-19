
import { createAuth0Client } from '@auth0/auth0-spa-js';
import { supabase } from './supabase-client.js';
import { APP_CONFIG } from './app-config';

// DOM Elements
const createPostBtn = document.getElementById('create-post-btn');
const loginPrompt = document.getElementById('login-prompt');
const loginLink = document.getElementById('login-link');
const postsContainer = document.getElementById('posts-container');

let auth0Client;
let user = null;

// Initialize
async function init() {
    await initAuth0();
    await loadPosts();
    setupEventListeners();
}

async function initAuth0() {
    try {
        let config;
        if (!APP_CONFIG.USE_LOCAL_AUTH)
        {
            const response = await fetch('/auth_config.json');
            config = await response.json();
        }

        auth0Client = await createAuth0Client({
            domain: APP_CONFIG.USE_LOCAL_AUTH ? import.meta.env.VITE_AUTH0_DOMAIN : config.domain,
            clientId: APP_CONFIG.USE_LOCAL_AUTH ? import.meta.env.VITE_AUTH0_CLIENT_ID : config.clientId,
            authorizationParams: {
                redirect_uri: APP_CONFIG.USE_LOCAL_AUTH
                    ? window.location.origin + "/login/login.html"
                    : window.location.origin + "/login/login"
            },
            cacheLocation: 'localstorage',
            useRefreshTokens: true,
        });

        const isAuthenticated = await auth0Client.isAuthenticated();

        if (isAuthenticated) {
            user = await auth0Client.getUser();
            showLoggedInState();
        } else {
            showLoggedOutState();
        }

    } catch (error) {
        console.error("Auth init error:", error);
    }
}

function showLoggedInState() {
    if (createPostBtn) createPostBtn.style.display = 'inline-block';
    if (loginPrompt) loginPrompt.style.display = 'none';
}

function showLoggedOutState() {
    if (createPostBtn) createPostBtn.style.display = 'none';
    if (loginPrompt) loginPrompt.style.display = 'block';
}

function setupEventListeners() {
    if (loginLink) {
        loginLink.addEventListener('click', async (e) => {
            e.preventDefault();
            await auth0Client.loginWithRedirect({
                appState: { targetUrl: window.location.pathname }
            });
        });
    }
}

async function loadPosts() {
    postsContainer.innerHTML = '<div class="loading-posts">Loading discussions...</div>';

    try {
        // Fetch posts
        const { data: posts, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!posts || posts.length === 0) {
            postsContainer.innerHTML = '<div class="loading-posts">No posts yet. Be the first to start a discussion!</div>';
            return;
        }

        // Fetch all replies to calculate counts
        // Optimization: In a real app, use a view or a separate count query
        const { data: replies, error: replyError } = await supabase
            .from('replies')
            .select('id, post_id');

        if (replyError) console.error("Error fetching replies:", replyError);

        // Fetch reaction counts for all posts
        const { data: reactions, error: reactionError } = await supabase
            .from('post_reactions')
            .select('post_id, reaction');

        if (reactionError) {
            console.error("Error fetching reactions:", reactionError);
        }

        renderPostsList(posts, replies || [], reactions || []);

    } catch (err) {
        console.error("Error loading posts:", err);
        postsContainer.innerHTML = '<div class="loading-posts">Failed to load discussions. Please try again later.</div>';
    }
}

function renderPostsList(posts, allReplies, allReactions) {
    postsContainer.innerHTML = '';

    posts.forEach(post => {
        const replyCount = allReplies.filter(r => r.post_id === post.id).length;
        const likesCount = allReactions.filter(
            r => r.post_id === post.id && r.reaction === 'like'
        ).length;

        const dislikesCount = allReactions.filter(
            r => r.post_id === post.id && r.reaction === 'dislike'
        ).length;
        const postElement = createPostListItem(post, replyCount, likesCount, dislikesCount);
        postsContainer.appendChild(postElement);
    });
}

function createPostListItem(post, replyCount, likesCount, dislikesCount) {
    const a = document.createElement('a');
    a.href = `post.html?id=${post.id}`;
    a.className = 'post-list-item';

    const date = new Date(post.created_at).toLocaleDateString();

    a.innerHTML = `
        <h3 class="post-list-title">${escapeHtml(post.title)}</h3>
        <div class="post-list-meta">
            <span>by ${escapeHtml(post.author_name)} on ${date}</span>
            <span class="reply-count">${replyCount} Replies</span>
        </div>
        <div class="post-list-stats">
            <span class="likes-count">❤️ ${likesCount}</span>
            <span class="dislikes-count">👎 ${dislikesCount}</span>
        </div>
    `;

    return a;
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
