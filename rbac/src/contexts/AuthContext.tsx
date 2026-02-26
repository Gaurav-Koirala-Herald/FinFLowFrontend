"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { authService } from "../services/authService"
import { useNavigate } from "react-router-dom"

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
  verifyOtp: (email: string, otp: string) => Promise<void>
  logout: () => void
  hasPrivilege: (privilege: string) => boolean
  hasFunction: (functionCode: string) => boolean
  hasRole: (role: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token")
      if (token) {
        try {
          const userData = await authService.getCurrentUser()
          setUser(userData)
        } catch {
          localStorage.removeItem("token")
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (username: string, password: string) => {
    const response = await authService.login(username, password)

    navigate("/verify-otp", {
      state: {
        email: response.email,
      },
    })
  }
  const verifyOtp = async (email: string, otp: string) => {
    const response = await authService.verifyOtp({ email, otp })

    if (response.code === "OK") {
      localStorage.setItem("token", response.token)

      const userData = await authService.getCurrentUser()
      setUser(userData)

      navigate("/dashboard")
    } else {
      throw new Error(response.message || "OTP verification failed")
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
    navigate("/login")
  }

  const hasPrivilege = (privilege: string) =>
    user?.privileges.includes(privilege) ?? false

  const hasFunction = (functionCode: string) =>
    user?.functions.includes(functionCode) ?? false

  const hasRole = (role: string) =>
    user?.roles.includes(role) ?? false

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        verifyOtp,
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
