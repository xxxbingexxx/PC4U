
import { user } from './login-common.js'
import { escapeHtml, fetchPosts } from './posts-common.js';

// DOM Elements
const createPostBtn = document.getElementById('create-post-btn');
const loginPrompt = document.getElementById('login-prompt');
const loginLink = document.getElementById('login-link');
const postsContainer = document.getElementById('posts-container');

// Initialize
async function init() {
    if (user) {
        showLoggedInState();
    } else {
        showLoggedOutState();
    }
    await loadPosts();
    setupEventListeners();
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
        const posts = await fetchPosts();
        renderPosts(posts);
    } catch (err) {
        console.error("Error loading posts:", err);
        postsContainer.innerHTML = '<div class="loading-posts">Failed to load discussions. Please try again later.</div>';
    }
}

function renderPosts(posts) {
    postsContainer.innerHTML = '';

    posts.forEach(post => {
        const postElement = createPostListItem(post);
        postsContainer.appendChild(postElement);
    });
}

function createPostListItem(post) {
    const a = document.createElement('a');
    a.href = `post.html?id=${post.id}`;
    a.className = 'post-list-item';

    const date = new Date(post.created_at).toLocaleDateString();

    a.innerHTML = `
        <h3 class="post-list-title">${escapeHtml(post.title)}</h3>
        <div class="post-list-meta">
            <span>by ${escapeHtml(post.author_name)} on ${date}</span>
            <span class="reply-count">${post.reply_count} Replies</span>
        </div>
        <div class="post-list-stats">
            <span class="likes-count">❤️ ${post.likes_count}</span>
            <span class="dislikes-count">👎 ${post.dislikes_count}</span>
        </div>
    `;

    return a;
}

init();
