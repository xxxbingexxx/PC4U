/* [Begin] Author: Zhibin Wang, 01/31/26 */
import { supabase } from './supabase-client.js';

/* Mod by Zhibin Wang, 02/07/26 */
export async function fetchPosts({ postId = null, order = 'desc', searchQuery = '', sortFilter = 'created_at'} = {}) {
    let query = supabase.from('posts_with_stats').select('*');
    if (postId) {
        const { data, error } = await query.eq('id', postId).single();
        if (error) throw error;
        return data;
    }

    if (searchQuery.trim())
    {
        const term = `%${searchQuery.trim()}%`;
        query = query.or(`title.ilike.${term},content.ilike.${term},author_email.ilike.${term}`);
    }

    query = query.order(sortFilter, { ascending: order === 'asc' });
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

/* Mod by Zhibin Wang, 02/14/26*/
export async function fetchPostReplies(postId) {
    const { data, error } = await supabase
        .from('replies')
        .select(`
            id,
            parent_id,
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
/* [End] Author: Zhibin Wang, 01/31/26 */