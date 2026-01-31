import { supabase } from './supabase-client.js';

export async function fetchPosts({ postId = null, order = 'desc' } = {}) {
    let query = supabase.from('posts_with_stats').select('*');

    if (postId) query = query.eq('id', postId).single();
    query = query.order('created_at', { ascending: order === 'asc' });

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

export async function fetchUserReaction(postId, userEmail) {
    if (!userEmail) return null;

    const { data, error } = await supabase
        .from('post_reactions')
        .select('reaction')
        .eq('post_id', postId)
        .eq('user_email', userEmail)
        .maybeSingle();

    if (error) throw error;
    return data?.reaction ?? null;
}

export async function fetchPostReplies(postId) {
    const { data, error } = await supabase
        .from('replies')
        .select(`
            id,
            content,
            author_name,
            author_email,
            created_at
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching replies:', error);
        throw error;
    }

    return data;
}

export function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}