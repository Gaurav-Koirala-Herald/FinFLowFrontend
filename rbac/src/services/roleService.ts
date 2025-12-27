
import { api } from "./api"

export interface Role {
    id: number
    name: string
    description: string
    isSystemRole: boolean
    createdAt: string
    functionIds?: Array<number>
    privilegeIds?: Array<number>
}

export interface Module {
    id: number
    name: string
    description: string
    icon: string
    functions: Array<{ id: number; name: string; code: string; description: string }>
    privileges: Array<{ id: number; name: string; code: string; description: string }>
}

export interface RoleFunction {
    Id: number,
    Name: string,
    Code: string,
    Description: string,
    ModuleId: number
}

export const roleService = {
    async getAllRoles() {
        const response = await api.get<Role[]>("/Roles")
        return response.data
    },

    async getRoleById(id: number) {
        const response = await api.get<Role>(`/Roles/${id}`)
        return response.data
    },

    async createRole(data: { name: string; description: string }) {
        const response = await api.post<Role>("/Roles", data)
        return response.data
    },

    async updateRole(id: number, data: { name?: string; description?: string }) {
        const response = await api.put<Role>(`/Roles/${id}`, data)
        return response.data
    },

    async deleteRole(id: number) {
        await api.delete(`/Roles/${id}`)
    },


    async assignFunctions(roleId: number, functionIds: number[]) {
        await api.post(`/Roles/${roleId}/functions`, functionIds)
    },

    async assignPrivileges(roleId: number, privilegeIds: number[]) {
        await api.post(`/Roles/${roleId}/privileges`, privilegeIds)
    },

    async getModules() {
        const response = await api.get<Module[]>("/Roles/modules")
        return response.data
    },
    async getFunctionsByRole(roleId: number) {
        const response = await api.get<RoleFunction[]>(`/Roles/${roleId}/role-functions`)
        return response.data
    },
}
