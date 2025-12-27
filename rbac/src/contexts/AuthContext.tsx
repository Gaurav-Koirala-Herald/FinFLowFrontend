"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { authService } from "../services/authService"

interface User {
  userId: number
  username: string
  roles: string[]
  functions: string[]
  privileges: string[]
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  hasPrivilege: (privilege: string) => boolean
  hasFunction: (functionCode: string) => boolean
  hasRole: (role: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token")
      if (token) {
        try {
          const userData = await authService.getCurrentUser()
          setUser(userData)
        } catch (error) {
          localStorage.removeItem("token")
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (username: string, password: string) => {
    const response = await authService.login(username, password)
    localStorage.setItem("token", response.token)
    const userData = await authService.getCurrentUser()
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
  }

  const hasPrivilege = (privilege: string) => {
    return user?.privileges.includes(privilege) ?? false
  }

  const hasFunction = (functionCode: string) => {
    return user?.functions.includes(functionCode) ?? false
  }

  const hasRole = (role: string) => {
    return user?.roles.includes(role) ?? false
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        hasPrivilege,
        hasFunction,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
