
/* Mod by Zhibin Wang, 01/31/26 */
import { user, userReady } from './login-common.js'
import { escapeHtml, fetchPosts } from './posts-common.js';

// DOM Elements
const createPostBtn = document.getElementById('create-post-btn');
const loginPrompt = document.getElementById('login-prompt');
const loginLink = document.getElementById('login-link');
const postsContainer = document.getElementById('posts-container');
/*[Begin] Author: Zhibin Wang, 02/07/26*/
const searchInput = document.getElementById('post-search-input');
const searchBtn = document.getElementById('post-search-btn');
const sortSelect = document.getElementById('post-sort-select');

let draftQuery = '';
let appliedQuery = '';
/* Mod by Zhibin Wang, 02/07/26 */
let sortFilter = 'created_at';
/*[End] Author: Zhibin Wang, 02/07/26*/

/*[Begin] Author: Pengyu Wang, 02/07/26*/
const backBtn = document.getElementById('post-search-back-btn');
/*[End] Author: Pengyu Wang, 02/07/26*/

// Initialize
async function init() {
    await userReady;
    if (user) {
        showLoggedInState();
    } else {
        showLoggedOutState();
    }
    await loadPosts();
    setupEventListeners();
    updateBackButtonState();
}

function showLoggedInState() {
    if (createPostBtn) createPostBtn.style.display = 'inline-block';
    if (loginPrompt) loginPrompt.style.display = 'none';
}

function showLoggedOutState() {
    if (createPostBtn) createPostBtn.style.display = 'none';
    if (loginPrompt) loginPrompt.style.display = 'block';
}

/*[Begin] Author: Pengyu Wang, 02/07/26*/
function updateBackButtonState() {
    if (!backBtn) return;

    // enabled only when there is an active applied query
    const hasActiveQuery =
        appliedQuery !== null &&
        appliedQuery !== undefined &&
        appliedQuery !== '';

    backBtn.disabled = !hasActiveQuery;
}
/*[End] Author: Pengyu Wang, 02/07/26*/


/*[Begin] Author: Zhibin Wang, 02/07/26*/
async function handleSearch() {
    const posts = await fetchPosts({ searchQuery: appliedQuery, sortFilter: sortFilter});
    renderPosts(posts);
}
/*[End] Author: Zhibin Wang, 02/07/26*/

function setupEventListeners() {
    /*[Begin] Author: Zhibin Wang, 02/07/26*/
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            appliedQuery = draftQuery?.trim() || null;
            updateBackButtonState();
            handleSearch();
        });

        searchInput.addEventListener('input', () => {
            draftQuery = searchInput.value.trim();
            searchBtn.disabled = (draftQuery === '');
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            sortFilter = sortSelect.value;
            updateBackButtonState();
            handleSearch();
        });
    }
    /*[End] Author: Zhibin Wang, 02/07/26*/

    /*[Begin] Author: Pengyu Wang, 02/07/26*/
    if (backBtn) {
        backBtn.addEventListener('click', async () => {
            // reset queries
            draftQuery = '';
            appliedQuery = null;

            // clear input + disable search
            if (searchInput) searchInput.value = '';
            if (searchBtn) searchBtn.disabled = true;

            // reset sort to Latest
            sortFilter = 'created_at';
            if (sortSelect) sortSelect.value = 'created_at';

            // reload all posts (fresh)
            await loadPosts();

            updateBackButtonState();
        });
    }
    /*[End] Author: Pengyu Wang, 02/07/26*/

    if (loginLink) {
        loginLink.addEventListener('click', async (e) => {
            e.preventDefault();
            await auth0Client.loginWithRedirect({
                appState: { targetUrl: window.location.pathname }
            });
        });
    }
}


/*[Begin] Author: Pengyu Wang, 02/07/26*/
async function loadPosts() {
    postsContainer.innerHTML = '<div class="loading-posts">Loading discussions...</div>';

    try {
        // respect current sortFilter (Latest = created_at)
        const posts = await fetchPosts({ sortFilter: sortFilter });
        renderPosts(posts);
    } catch (err) {
        console.error("Error loading posts:", err);
        postsContainer.innerHTML = '<div class="loading-posts">Failed to load discussions. Please try again later.</div>';
    }
}
/*[End] Author: Pengyu Wang, 02/07/26*/


function renderPosts(posts) {
    postsContainer.innerHTML = '';

    const query = searchInput.value.trim().toLowerCase();

    // If search is active AND original post list exists AND filter returns nothing
    if (query !== '' && posts.length === 0) {
        const message = document.createElement('div');
        message.className = 'no-search-results';
        message.textContent =
            'No discussions match your search. Try changing or clearing your filter.';
        postsContainer.appendChild(message);
        return;
    }

    posts.forEach(post => {
        const postElement = createPostListItem(post);
        postsContainer.appendChild(postElement);
    });
}



/*[Begin] Author: Zhibin Wang, 02/07/26*/
function getSnippetAroundMatch(text, query, snippetLength = 100) {
    if (!text || !query) return '';

    const normalizedText = text.toLowerCase();
    const normalizedQuery = query.toLowerCase();
    const index = normalizedText.indexOf(normalizedQuery);

    if (index === -1) {
        return '';
    }

    const start = Math.max(0, index - snippetLength / 2);
    const end = Math.min(text.length, index + snippetLength / 2);

    let snippet = text.slice(start, end);

    /* Mod by Zhibin Wang, 02/07/26 */
    snippet = highlightMatch(snippet, query);
    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';

    return snippet;
}

function highlightMatch(text, query) {
    if (!query) return escapeHtml(text);

    const escapedQuery = query.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');

    return escapeHtml(text).replace(regex, '<mark>$1</mark>');
}
/*[End] Author: Zhibin Wang, 02/07/26*/

function createPostListItem(post) {
    const a = document.createElement('a');
    a.href = `post.html?id=${post.id}`;
    a.className = 'post-list-item';

    const date = new Date(post.created_at).toLocaleDateString();

    /* Mod by Zhibin Wang, 02/07/26 */
    const titleHtml = appliedQuery
        ? highlightMatch(post.title, appliedQuery)
        : escapeHtml(post.title);

    const authorHtml = appliedQuery
        ? highlightMatch(post.author_name, appliedQuery)
        : escapeHtml(post.author_name);

    const snippetHtml = appliedQuery && post.content
        ? getSnippetAroundMatch(post.content, appliedQuery, 100)
        : '';

    a.innerHTML = `
        <h3 class="post-list-title">${titleHtml}</h3>
        <div class="post-list-meta">
            <span>by ${authorHtml} on ${date}</span>
            <span class="reply-count">${post.reply_count} Replies</span>
        </div>
        ${snippetHtml ? `<p>${snippetHtml}</p>` : ''}
        <div class="post-list-stats">
            <span class="likes-count">❤️ ${post.likes_count}</span>
            <span class="dislikes-count">👎 ${post.dislikes_count}</span>
        </div>
    `;

    return a;
}

init();
