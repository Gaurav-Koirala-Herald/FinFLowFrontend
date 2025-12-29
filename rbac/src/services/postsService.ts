import { api } from './api';

export interface PostsDTO {
    id: number;
    title: string;
    content: string;
    userId: number;
    commentCount: number;
    shareCount: number;
    likeCount: number;
    createdAt: Date;
}

export interface CreatePostsDTO {
    userId: string;
    title: string;
    content: string;
    createdAt: Date;
}

export const postsService = {
    async getAllPosts(): Promise<PostsDTO[]> {
        const response = await api.get<PostsDTO[]>('posts');
        return response.data;
    },

    async getPostById(id: number): Promise<PostsDTO> {
        const response = await api.get<PostsDTO>(`posts/${id}`);
        return response.data;
    },

    async createPost(data: CreatePostsDTO): Promise<PostsDTO> {
        const response = await api.post<PostsDTO>('posts', data);
        return response.data;
    },

    async updatePost(id: number, data: Partial<CreatePostsDTO>): Promise<PostsDTO> {
        const response = await api.put<PostsDTO>(`posts/${id}`, data);
        return response.data;
    },

    async deletePost(id: number): Promise<void> {
        await api.delete(`posts/${id}`);
    },
    async getPostsByUserId(userId: number): Promise<PostsDTO[]> {
        const response = await api.get<PostsDTO[]>(`posts/user/${userId}`);
        return response.data;
    },
};