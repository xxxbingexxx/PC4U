/* Mod by Zhibin Wang, 01/31/26 */
import { user, userReady } from './login-common.js'
import { supabase } from './supabase-client.js';
import { escapeHtml, linkifySafe, fetchPosts, fetchUserReaction, fetchPostReplies } from './posts-common.js';


// DOM Elements
const postDetailContainer = document.getElementById('post-detail-container');

let currentPostId = null;
let post = null;
let replies = [];
let userReaction = null;

// Initialize
async function init() {
    await userReady;
    // Get Post ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentPostId = urlParams.get('id');

    if (!currentPostId) {
        postDetailContainer.innerHTML = '<div class="error-message">Post not found.</div>';
        return;
    }
    await loadPostDetail();
}

async function loadPostDetail() {
    try {
        const [postData, repliesData, reaction] = await Promise.all([
            fetchPosts({ postId: currentPostId }),
            fetchPostReplies(currentPostId),
            fetchUserReaction(currentPostId, user?.email)
        ]);

        if (!postData) {
            postDetailContainer.innerHTML = '<div class="error-message">Post not found.</div>';
            return;
        }

        post = postData;
        replies = repliesData || [];
        userReaction = reaction;

        renderPostDetail();

    } catch (err) {
        console.error("Error loading post:", err);
        postDetailContainer.innerHTML =
            '<div class="error-message">Failed to load post. It may have been deleted.</div>';
    }
}



/*[Begin] Author: Zhibin Wang, 02/14/26*/
function renderReply(reply, depth = 0) {
    const isReplyAuthor = user && user.email === reply.author_email;
    const replyDeleteBtn = isReplyAuthor ?
        `<button class="delete-reply-btn" data-id="${reply.id}">Delete</button>` : '';
    
    const replyActionBtn = user ? 
        `<button class="nested-reply-btn" data-id="${reply.id}">Reply</button>` : '';

    const hasChildren = reply.children && reply.children.length > 0;
    const collapseBtnHtml = hasChildren ? 
        `<span class="collapse-btn" data-id="${reply.id}"></span>` : 
        `<span class="collapse-spacer"></span>`;

    const margin = (depth > 10 || depth == 0) ? 0 : 20;

    const childrenHtml = reply.children.map(child => renderReply(child, depth + 1)).join('');

    return `
        <div class="reply-container" id="container-${reply.id}" style="margin-left: ${margin}px">
            <div class="reply" id="reply-${reply.id}">
                <div class="reply-header">
                    ${collapseBtnHtml}
                    <span class="reply-meta">${escapeHtml(reply.author_name)}</span>
                    <div class="reply-actions">${replyActionBtn} ${replyDeleteBtn}</div>
                </div>
                <div class="reply-content">${linkifySafe(escapeHtml(reply.content || ''))}</div>

                <div id="reply-form-container-${reply.id}"></div>
            </div>
            <div class="child-replies">
                ${childrenHtml}
            </div>
        </div>
    `;
}
/*[End] Author: Zhibin Wang, 02/14/26*/

function renderPostDetail() {
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

    const upActive = userReaction === 'like' ? 'active' : '';
    const downActive = userReaction === 'dislike' ? 'active' : '';
    const upIcon = userReaction === 'like' ? '❤️' : '🤍';

    const postVoteHtml = `
        <div class="vote-bar" data-type="post" data-post-id="${post.id}">
            <button type="button" class="vote-btn up ${upActive}" id="like-btn">${upIcon} ${post.likes_count}</button>
            <button type="button" class="vote-btn down ${downActive}" id="dislike-btn">👎 ${post.dislikes_count}</button>
        </div>
    `;

    /* Mod by Zhibin Wang, 02/14/26 */
    const replyTree = buildReplyTree(replies);
    const repliesHtml = replyTree.map(rootReply => renderReply(rootReply)).join('');

    const replyFormHtml = user ? `
        <form id="reply-form" class="reply-form">
            <input type="text" id="reply-content" placeholder="Write a reply..." required>
            <button type="submit" class="reply-btn">Reply</button>
        </form>
    ` : '<div class="login-prompt-small">Please log in to reply.</div>';

    /* Mod by Zhibin Wang, 02/07/26 */
    postDetailContainer.innerHTML = `
        <div class="post-card full-post">
            <div class="post-header">
                <h1 class="post-title-large">${escapeHtml(post.title)}</h1>
                <div class="post-meta-row">
                    <span class="post-meta">by ${escapeHtml(post.author_name)} on ${date} ${deleteBtnHtml}</span>
                </div>
            </div>
            <div class="post-content-large">${linkifySafe(escapeHtml(post.content || ''))}</div>

            ${imageHtml}
            ${postVoteHtml}
            
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

        const likeBtn = document.getElementById("like-btn");
        const dislikeBtn = document.getElementById("dislike-btn");

        if (likeBtn) likeBtn.addEventListener("click", () => handleReaction("like"));
        if (dislikeBtn) dislikeBtn.addEventListener("click", () => handleReaction("dislike"));

        /* Mod by Zhibin Wang, 02/14/26 */
        document.querySelectorAll('.nested-reply-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const parentId = e.target.dataset.id;
                const container = document.getElementById(`reply-form-container-${parentId}`);
                
                if (container.innerHTML !== '') {
                    container.innerHTML = '';
                    return;
                }

                container.innerHTML = `
                    <form class="reply-form" data-parent-id="${parentId}">
                        <input type="text" placeholder="Write a reply..." required>
                        <button type="submit" class="reply-btn">Send</button>
                    </form>
                `;

                container.querySelector('form').addEventListener('submit', (e) => handleReplySubmit(e, parentId));
            });
        });

        document.querySelectorAll('.collapse-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const replyId = e.target.dataset.id;
                const container = document.getElementById(`container-${replyId}`);
                container.classList.toggle('collapsed');
            });
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

        /* Mod by Zhibin Wang, 02/14/26 */
        loadPostDetail();
    } catch (err) {
        console.error("Error deleting reply:", err);
        alert("Failed to delete reply.");
    }
}

/* Mod by Zhibin Wang, 02/14/26 */
async function handleReplySubmit(e, parentId = null) {
    e.preventDefault();
    if (!user) return;

    /* Mod by Zhibin Wang, 02/14/26 */
    const form = e.currentTarget;
    const input = form.querySelector('input');
    const btn = form.querySelector('button');
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
                    /* Mod by Zhibin Wang, 02/14/26 */
                    parent_id: parentId,
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

async function handleReaction(type) {
    if (!user) return; // must be logged in

    try {
        // Check if user already reacted
        const { data: existing, error: fetchError } = await supabase
            .from('post_reactions')
            .select('id,reaction')
            .eq('post_id', currentPostId)
            .eq('user_email', user.email)
            .maybeSingle(); // use maybeSingle so no row doesn't throw

        if (fetchError) throw fetchError;

        if (existing) {
            if (existing.reaction === type) {
                // User clicked the same reaction → delete to revert
                const { error: deleteError } = await supabase
                    .from('post_reactions')
                    .delete()
                    .eq('id', existing.id);
                if (deleteError) throw deleteError;

            } else {
                // User clicked the other reaction → update
                const { error: updateError } = await supabase
                    .from('post_reactions')
                    .update({ reaction: type })
                    .eq('id', existing.id);
                if (updateError) throw updateError;
            }

        } else {
            // No existing reaction → insert new
            const { error: insertError } = await supabase
                .from('post_reactions')
                .insert([
                    {
                        post_id: currentPostId,
                        user_email: user.email,
                        reaction: type
                    }
                ]);
            if (insertError) throw insertError;
        }

        // Reload post reactions to update counts/UI
        await loadPostDetail();

    } catch (err) {
        console.error('Error handling reaction:', err);
        alert('Failed to update reaction.');
    }
}

/*[Begin] Author: Zhibin Wang, 02/14/26*/
function buildReplyTree(flatReplies) {
    const map = {};
    const tree = [];

    flatReplies.forEach(reply => {
        map[reply.id] = { ...reply, children: [] };
    });

    flatReplies.forEach(reply => {
        if (reply.parent_id) {
            if (map[reply.parent_id]) {
                map[reply.parent_id].children.push(map[reply.id]);
            }
        } else {
            tree.push(map[reply.id]);
        }
    });

    return tree;
}
/*[End] Author: Zhibin Wang, 02/14/26*/

init();
