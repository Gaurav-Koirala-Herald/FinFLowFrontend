"use client"

import type React from "react"

import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPrivilege?: string
  requiredFunction?: string
  requiredRole?: string
}

export default function ProtectedRoute({
  children,
  requiredPrivilege,
  requiredFunction,
  requiredRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, hasPrivilege, hasFunction, hasRole } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredPrivilege && !hasPrivilege(requiredPrivilege)) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have the required privilege to access this page.</p>
        </div>
      </div>
    )
  }

  if (requiredFunction && !hasFunction(requiredFunction)) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have the required function to access this page.</p>
        </div>
      </div>
    )
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have the required role to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
