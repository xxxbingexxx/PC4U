
import { user, userReady } from './login-common.js'
import { supabase } from './supabase-client.js';

// DOM Elements
const createPostContainer = document.getElementById('create-post-container');
const loginPrompt = document.getElementById('login-prompt');
const loginLink = document.getElementById('login-link');
const createPostForm = document.getElementById('create-post-form');

// Initialize
async function init() {
    await userReady;
    if (user) {
        showLoggedInState();
    } else {
        showLoggedOutState();
    }
    setupEventListeners();
}

function showLoggedInState() {
    if (createPostContainer) createPostContainer.style.display = 'block';
    if (loginPrompt) loginPrompt.style.display = 'none';
}

function showLoggedOutState() {
    if (createPostContainer) createPostContainer.style.display = 'none';
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

    if (createPostForm) {
        createPostForm.addEventListener('submit', handleCreatePost);
    }
}

async function handleCreatePost(e) {
    e.preventDefault();
    if (!user) return;

    const titleInput = document.getElementById('post-title');
    const contentInput = document.getElementById('post-content');
    const imageInput = document.getElementById('post-image');
    const submitBtn = createPostForm.querySelector('.submit-btn');

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const imageFile = imageInput.files[0];

    if (!title || !content) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Publishing...';

    try {
        let imageUrl = null;

        // Upload image if exists
        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('post-images')
                .upload(filePath, imageFile);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('post-images')
                .getPublicUrl(filePath);

            imageUrl = publicUrl;
        }

        // Insert post
        const { data, error } = await supabase
            .from('posts')
            .insert([
                {
                    title,
                    content,
                    author_name: user.name || user.email || 'Anonymous',
                    author_email: user.email,
                    image_url: imageUrl
                }
            ])
            .select();

        if (error) throw error;

        // Redirect to discussion board
        window.location.href = 'discussion.html';

    } catch (err) {
        console.error("Error creating post:", err);
        alert("Failed to create post. Please try again. " + (err.message || ''));
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Publish Post';
    }
}

init();
