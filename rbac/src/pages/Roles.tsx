"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { roleService, type Role, type Module, type RoleFunction } from "../services/roleService"
import { useAuth } from "../contexts/AuthContext"
import { Pencil, Trash2, Plus, X, Shield } from "lucide-react"

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [error, setError] = useState("")
  const { hasRole } = useAuth()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  const [permissionData, setPermissionData] = useState({
    functionIds: [] as number[],
    privilegeIds: [] as number[],
  })


  useEffect(() => {
    loadRoles()
    loadModules()
  }, [])

  const loadRoles = async () => {
    try {
      const data = await roleService.getAllRoles()
      console.log("Fetched roles:", data)
      setRoles(data)
    } catch (err) {
      console.error("Failed to load roles:", err)
    } finally {
      setLoading(false)
    }
  }
  const loadModules = async () => {
    try {
      const data = await roleService.getModules()
      console.log("Fetched modules:", data)
      setModules(data)
    } catch (err) {
      console.error("Failed to load modules:", err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      if (editingRole) {
        await roleService.updateRole(editingRole.id, formData)
      } else {
        await roleService.createRole(formData)
      }
      setShowModal(false)
      resetForm()
      loadRoles()
    } catch (err: any) {
      setError(err.response?.data?.message || "Operation failed")
    }
  }

  const handlePermissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) return

    try {
      await roleService.assignFunctions(selectedRole.id, permissionData.functionIds)
      await roleService.assignPrivileges(selectedRole.id, permissionData.privilegeIds)
      setShowPermissionsModal(false)
      setSelectedRole(null)
      loadRoles()
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update permissions")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this role?")) return

    try {
      await roleService.deleteRole(id)
      loadRoles()
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete role")
    }
  }

  const openEditModal = (role: Role) => {
    setEditingRole(role)
    setFormData({
      name: role.name,
      description: role.description,
    })
    setShowModal(true)
  }

  const openPermissionsModal = (role: Role) => {
    
    setSelectedRole(role)

    console.log(role, "Role in openPermissionsModal")
    setPermissionData({
      functionIds: [...(role.functionIds || [])],
      privilegeIds:[...(role.privilegeIds || [])],
    })
    setShowPermissionsModal(true)
  }
  console.log(permissionData, "Permission Data")
  console.log(roles, "Roles Data")

  console.log(selectedRole, "The selected role")
  const resetForm = () => {
    setFormData({ name: "", description: "" })
    setEditingRole(null)
    setError("")
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Roles</h1>
          <p className="text-muted-foreground mt-1">Manage roles and their permissions</p>
        </div>
        {hasRole("SuperAdmin") && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus size={18} />
            Add Role
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div key={role.id} className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{role.name}</h3>
                  {role.isSystemRole && <span className="text-xs text-muted-foreground">System Role</span>}
                </div>
              </div>
              {!role.isSystemRole && hasRole("SuperAdmin") && (
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(role)}
                    className="p-1.5 text-primary hover:bg-primary/10 rounded-md transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(role.id)}
                    className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-4">{role.description}</p>

            <div className="space-y-3">
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Functions</div>
                <div className="text-sm font-semibold text-foreground">{role.functionIds?.length || 0}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Privileges</div>
                <div className="text-sm font-semibold text-foreground">{role.privilegeIds?.length || 0}</div>
              </div>
            </div>

            {hasRole("SuperAdmin") && (
              <button
                onClick={() => openPermissionsModal(role)}
                className="w-full mt-4 py-2 px-4 border border-border rounded-md text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Manage Permissions
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add/Edit Role Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-foreground">{editingRole ? "Edit Role" : "Add New Role"}</h2>
              <button onClick={closeModal} className="p-1 hover:bg-secondary rounded-md transition-colors">
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Role Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-border rounded-md text-foreground hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  {editingRole ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && selectedRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">Manage Permissions - {selectedRole.name}</h2>
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="p-1 hover:bg-secondary rounded-md transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePermissionSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {modules.map((module) => (
                  <div key={module.id} className="space-y-3">
                    <h3 className="font-semibold text-foreground">{module.name}</h3>

                    {module.functions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Functions</h4>
                        <div className="space-y-2">
                          {module.functions.map((func) => (
                            <label key={func.id} className="flex items-start gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={permissionData.functionIds.includes(func.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setPermissionData({
                                      ...permissionData,
                                      functionIds: [...permissionData.functionIds, func.id],
                                    })
                                  } else {
                                    setPermissionData({
                                      ...permissionData,
                                      functionIds: permissionData.functionIds.filter((id) => id !== func.id),
                                    })
                                  }
                                }}
                                className="mt-0.5 rounded border-border"
                              />
                              <div>
                                <div className="text-sm font-medium text-foreground">{func.name}</div>
                                <div className="text-xs text-muted-foreground">{func.code}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {module.privileges.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Privileges</h4>
                        <div className="space-y-2">
                          {module.privileges.map((priv) => (
                            <label key={priv.id} className="flex items-start gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={permissionData.privilegeIds.includes(priv.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setPermissionData({
                                      ...permissionData,
                                      privilegeIds: [...permissionData.privilegeIds, priv.id],
                                    })
                                  } else {
                                    setPermissionData({
                                      ...permissionData,
                                      privilegeIds: permissionData.privilegeIds.filter((id) => id !== priv.id),
                                    })
                                  }
                                }}
                                className="mt-0.5 rounded border-border"
                              />
                              <div>
                                <div className="text-sm font-medium text-foreground">{priv.name}</div>
                                <div className="text-xs text-muted-foreground">{priv.code}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 p-6 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowPermissionsModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-md text-foreground hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Save Permissions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
