import { api } from "./api"

export interface User {
  id: number
  username: string
  email: string
  fullName: string
  isActive: boolean
  createdAt: string
  roles?: Array<{ id: number; name: string }>
}

export const userService = {
  async getAllUsers() {
    const response = await api.get<User[]>("/Users")
    return response.data
  },

  async getUserById(id: number) {
    const response = await api.get<User>(`/Users/${id}`)
    return response.data
  },

  async createUser(data: {
    username: string
    email: string
    password: string
    fullName: string
    roleIds: number[]
  }) {
    const response = await api.post<User>("/Users", data)
    return response.data
  },

  async updateUser(
    id: number,
    data: {
      username?: string
      email?: string
      fullName?: string
      isActive?: boolean
    },
  ) {
    const response = await api.put<User>(`/Users/${id}`, data)
    return response.data
  },

  async deleteUser(id: number) {
    await api.delete(`/Users/${id}`)
  },

  async assignRoles(userId: number, roleIds: number[]) {
    await api.post(`/Users/${userId}/roles`, roleIds)
  },

  async getUserDetails(id: number) {
    const response = await api.get<User>(`/Users/get-user-details/${id}`)
    return response.data
  },
  async updateUserDetails(
    data: {
      id: number,
      userName?: string
      fullName?: string
      email?: string
    },
  ) {
    const response = await api.put<User>(`/Users/update-user-profile`, data)
    return response.data
  }
}