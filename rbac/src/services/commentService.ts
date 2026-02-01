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
    },

    async createCommentAsync(dto: CommentDTO): Promise<CommentDTO> {
        const response = await api.post<CommentDTO>(`posts/${dto.postId}/comments`, dto)
        return response.data
    },

    async deleteCommentAsync(id: number, postId: number): Promise<boolean> {
        try {
            await api.delete(`posts/${postId}/comments/${id}`)
            return true
        } catch (error) {
            console.error('Error deleting comment:', error)
            return false
        }
    }
}