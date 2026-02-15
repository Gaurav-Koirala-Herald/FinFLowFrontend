"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Shield } from "lucide-react"
import { authService } from "../services/authService"
import { toast } from "sonner"

export default function AuthPage() {
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const [regUsername, setRegUsername] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await authService.login(username, password)
      console.log(response)
      navigate("/verify-otp", {
        state: { email: response.email } 
      })
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid username or password")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (regPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      const response = await authService.register({
        username: regUsername,
        email,
        password: regPassword,
        fullName,
      })
      if (response)
        navigate("/verify-otp", {
          state: { email }
        })
      else toast.error("Registration failed. Please try again.")
      setActiveTab("login")
    } catch (err: any) {
      setError("Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/20 px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-lg border border-border p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 p-3 rounded-full">
              <Shield className="w-12 h-12 text-primary" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center mb-2">FinFlow</h1>
          <p className="text-center text-muted-foreground mb-6">
            Manage your finances with ease
          </p>

          {/* Tabs */}
          <div className="flex mb-6 border border-border rounded-md overflow-hidden">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-2 text-sm font-medium ${activeTab === "login"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground"
                }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 py-2 text-sm font-medium ${activeTab === "register"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground"
                }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Login */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          )}

          {/* Register */}
          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
