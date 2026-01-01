import { api } from "./api"

export interface CommentDTO {
    id: number
    content: string
    userId: string
    postId: number
    createdAt: Date
}

export const commentService = {
    async getCommentsByPostId(postId: number): Promise<CommentDTO[]> {
        const response = await api.get<CommentDTO[]>(`posts/${postId}/comments`)
        return response.data
    }
}

