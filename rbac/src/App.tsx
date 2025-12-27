"use client"

import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./contexts/AuthContext"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Layout from "./components/Layout"
import ProtectedRoute from "./components/ProtectedRoute"
import ProfilePage from "./pages/Profile"
import Transactions from "./pages/Transactions"
import { NepseDashboard } from "./pages/NepseDashboard"

export default function App() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />

      <Route element={<Layout />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/users"
          element={
            <ProtectedRoute requiredPrivilege="VIEW_STAFF_LIST">
              <Users />
            </ProtectedRoute>
          }
        /> */}
        {/* <Route
          path="/roles"
          element={
            <ProtectedRoute requiredPrivilege="VIEW_ROLES">
              <Roles />
            </ProtectedRoute>
          }
        /> */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
         <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          }
        />
         <Route
          path="/nepse"
          element={
            <ProtectedRoute>
              <NepseDashboard />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
      
    </Routes>
  )
}
