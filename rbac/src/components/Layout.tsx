"use client"

import { Outlet, Link, useLocation, useNavigate, NavLink } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Users, Shield, LayoutDashboard, LogOut, Menu, X, User, DollarSign, Globe } from "lucide-react"
import { useState } from "react"
import Footer from "./Footer"

export default function Layout() {
  const { user, logout, hasPrivilege } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, privilege: null },
    // { path: "/users", label: "Users", icon: Users, privilege: "VIEW_STAFF_LIST" },
    // { path: "/roles", label: "Roles", icon: Shield, privilege: "VIEW_ROLES" },
    { path: "/transactions", label: "Transactions", icon: DollarSign, privilege: null },
    { path: "/profile", label: "Profile", icon: User, privilege: null },
     { path: "/nepse", label: "Nepse", icon: Globe, privilege: null },
  ]

  const filteredNavItems = navItems.filter((item) => !item.privilege || hasPrivilege(item.privilege))

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-primary">Fin Flow</h1>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex gap-1">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-sm text-muted-foreground">{user?.username}</div>
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md hover:bg-secondary"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border">
            <nav className="px-4 py-2 space-y-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                )
              })}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}