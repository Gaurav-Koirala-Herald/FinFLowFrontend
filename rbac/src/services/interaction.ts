import { api } from './api';

export interface PostInteractionDTO {
  id: number;
  postId: number;
  userId: string;
}

export const InteractionType = {
  Like: 'Like',
  Share: 'Share',
  Bookmark: 'Bookmark',
  Comment: 'Comment'
} as const;

export type InteractionType = typeof InteractionType[keyof typeof InteractionType];

export const interactionService = {

  async toggleLike(postId: number, userId: string): Promise<void> {
    await api.post('posts/like', null, {
      params: { postId, userId }
    });
  },

  async toggleShare(postId: number, userId: string): Promise<void> {
    await api.post('posts/share', null, {
      params: { postId, userId }
    });
  },

  async hasUserLiked(postId: number, userId: string): Promise<boolean> {
    const response = await api.get<boolean>(`posts/${postId}/user/${userId}/liked`);
    return response.data;
  },

  async hasUserShared(postId: number, userId: string): Promise<boolean> {
    const response = await api.get<boolean>(`posts/${postId}/user/${userId}/shared`);
    return response.data;
  },

  async toggleBookmark(postId: number, userId: string): Promise<void> {
    await api.post('posts/bookmark', null, {
      params: { postId, userId }
    });
  },

  async getPostInteractionCounts(postId: number): Promise<{
    likes: number;
    shares: number;
    comments: number;
    bookmarks: number;
  }> {
    const response = await api.get(`posts/${postId}/interaction-counts`);
    return response.data;
  },

  async getPostInteractions(postId: number): Promise<PostInteractionDTO[]> {
    const response = await api.get<PostInteractionDTO[]>(`posts/${postId}/interactions`);
    return response.data;
  },

  async getUserInteractions(userId: string): Promise<PostInteractionDTO[]> {
    const response = await api.get<PostInteractionDTO[]>(`users/${userId}/interactions`);
    return response.data;
  },

  async getLikesCount(postId: number): Promise<number> {
    const response = await api.get<number>(`posts/${postId}/like-count`);
    return response.data;
  },
};