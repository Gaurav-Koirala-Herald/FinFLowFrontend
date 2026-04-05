"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, Shield } from "lucide-react"
import { authService } from "../services/authService"
import { toast } from "sonner"
import { useAuth } from "../contexts/AuthContext"

export default function AuthPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Login fields
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  // Register fields
  const [regUsername, setRegUsername] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")


  const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const validateLogin = (): boolean => {
    if (!username.trim()) {
      setError("Username is required")
      return false
    }
    if (!password) {
      setError("Password is required")
      return false
    }
    return true
  }

  const validateRegister = (): boolean => {
    if (!regUsername.trim()) {
      setError("Username is required")
      return false
    }
    if (regUsername.trim().length < 3) {
      setError("Username must be at least 3 characters")
      return false
    }

    if (!fullName.trim()) {
      setError("Full name is required")
      return false
    }
    // Fix 3: cleaner digit check — original logic was correct but verbose
    if (/\d/.test(fullName)) {
      setError("Full name cannot contain numbers")
      return false
    }
    if (fullName.trim().length < 2) {
      setError("Full name must be at least 2 characters")
      return false
    }

    // Fix 4: email format was never validated
    if (!email.trim()) {
      setError("Email is required")
      return false
    }
    if (!EMAIL_REGEX.test(email)) {
      setError("Please enter a valid email address")
      return false
    }

    // Fix 1 `payoff`: .test() now actually runs against the regex
    if (!regPassword) {
      setError("Password is required")
      return false
    }
    if (!STRONG_PASSWORD_REGEX.test(regPassword)) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character (@$!%*?&)"
      )
      return false
    }

    if (!confirmPassword) {
      setError("Please confirm your password")
      return false
    }
    if (regPassword !== confirmPassword) {
      setError("Passwords do not match")
      return false
    }

    return true
  }


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateLogin()) return

    setLoading(true)
    try {
      await login(username, password)
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid username or password")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateRegister()) return

    setLoading(true)
    try {
      // Fix 2 cont: was passing `username` (login field) — now correctly uses `regUsername`
      const response = await authService.register({
        username: regUsername,
        email,
        password: regPassword,
        fullName,
      })

      // Fix 5: was `if (response)` immediately followed by `if (!response)` then `else` — logically broken
      if (response) {
        toast.success("Account created! Please verify your email.")
        navigate("/verify-otp", { state: { email, isLogin: false } })
      } else {
        setError("Registration failed. Please try again.")
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleTabSwitch = (tab: "login" | "register") => {
    setActiveTab(tab)
    setError("")
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
              onClick={() => handleTabSwitch("login")}
              className={`flex-1 py-2 text-sm font-medium ${activeTab === "login"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground"
                }`}
            >
              Login
            </button>
            <button
              onClick={() => handleTabSwitch("register")}
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

          {/* Login Form */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary"
                  placeholder="Enter your username"
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary"
                  placeholder="Enter your password"
                  autoComplete="current-password"
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

          {/* Register Form */}
          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4" noValidate>
              <div className="flex gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Username</label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary"
                    placeholder="Choose a username"
                    autoComplete="username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary"
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary"
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary"
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Min 8 chars, uppercase, lowercase, number & special character
                  
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary"
                  placeholder="Repeat your password"
                  autoComplete="new-password"
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