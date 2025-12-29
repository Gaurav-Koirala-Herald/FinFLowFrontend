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

  async getPostInteractionCounts(postId: number): Promise<{
    likes: number;
    shares: number;
    comments: number;
    bookmarks: number;
  }> {
    const response = await api.get(`interactions/post/${postId}/counts`);
    return response.data;
  },

  async hasUserLiked(postId: number, userId: string): Promise<boolean> {
    const response = await api.get<boolean>(`interactions/post/${postId}/user/${userId}/liked`);
    return response.data;
  },

  async hasUserShared(postId: number, userId: string): Promise<boolean> {
    const response = await api.get<boolean>(`interactions/post/${postId}/user/${userId}/shared`);
    return response.data;
  },

  async getPostInteractions(postId: number): Promise<PostInteractionDTO[]> {
    const response = await api.get<PostInteractionDTO[]>(`interactions/post/${postId}`);
    return response.data;
  },

  async getUserInteractions(userId: string): Promise<PostInteractionDTO[]> {
    const response = await api.get<PostInteractionDTO[]>(`interactions/user/${userId}`);
    return response.data;
  },
};