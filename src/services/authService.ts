import { api } from "./api"


export const authService = {
  async login(username: string, password: string) {
    const response = await api.post("/Auth/login", { username, password })

    return response.data
  },

  async register(data: {
    username: string
    email: string
    password: string
    fullName: string
    roleIds: number[]
  }) {
    const response = await api.post("/Auth/register", data)
    return response.data
  },

  async getCurrentUser() {
    const response = await api.get("/Auth/me")
    return response.data
  },
}
