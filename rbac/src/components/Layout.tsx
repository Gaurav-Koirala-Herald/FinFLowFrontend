"use client"

import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { LayoutDashboard, LogOut, Menu, X, User, DollarSign, Globe, MessageCircle, Goal, BarChart3 } from "lucide-react"
import { useState } from "react"
import Footer from "./Footer"
import { Toaster } from "./ui/sonner"

export default function Layout() {
  const { user, logout, hasPrivilege } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, privilege: null },
    { path: "/transactions", label: "Transactions", icon: DollarSign, privilege: null },
    { path: "/forums", label: "Forums", icon: MessageCircle, privilege: null },
    { path: "/profile", label: "Profile", icon: User, privilege: null },
    { path: "/goals", label: "Goals", icon: Goal, privilege: null },
    { path: "/nepse", label: "Nepse", icon: Globe, privilege: null },
    { path: "/reports", label: "Reports", icon: BarChart3, privilege: null },
  ]

  const filteredNavItems = navItems.filter((item) => !item.privilege || hasPrivilege(item.privilege))

  return (
    <div className="min-h-screen bg-secondary/30 flex">
      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border flex-shrink-0">
          <h1 className="text-xl font-bold text-primary">Fin Flow</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md hover:bg-secondary"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Navigation */}
          <nav className="px-4 py-6 space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              )
            })}
          </nav>


          <div className="px-4 py-4 mt-4">
            <div className="mb-3 px-4 py-2 text-sm text-muted-foreground truncate">
              {user?.username}
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden bg-card border-b border-border sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md hover:bg-secondary"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-primary">Fin Flow</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>

        <Footer />
      </div>

      <Toaster richColors position="top-right" theme="light" expand={true} />
    </div>
  )
}