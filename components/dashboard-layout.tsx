"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ModeToggle } from "@/components/mode-toggle"
import { cn } from "@/lib/utils"
import { BarChart, Calendar, Home, LogOut, Menu, MessageSquare, Settings, User, Video, X, Users } from "lucide-react"
import NotificationDropdown from "@/components/notification-dropdown"

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole: "mentee" | "mentor"
}

export default function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const menteeNavItems = [
    { name: "Dashboard", href: "/dashboard/mentee", icon: <Home className="h-5 w-5" /> },
    { name: "Roadmap", href: "/roadmap", icon: <BarChart className="h-5 w-5" /> },
    { name: "Chat", href: "/chat", icon: <MessageSquare className="h-5 w-5" /> },
    { name: "Schedule", href: "/schedule", icon: <Calendar className="h-5 w-5" /> },
    { name: "Interview", href: "/interview", icon: <Video className="h-5 w-5" /> },
    { name: "Profile", href: "/profile/mentee", icon: <User className="h-5 w-5" /> },
  ]

  const mentorNavItems = [
    { name: "Dashboard", href: "/dashboard/mentor", icon: <Home className="h-5 w-5" /> },
    { name: "Mentees", href: "/mentees", icon: <Users className="h-5 w-5" /> },
    { name: "Chat", href: "/chat", icon: <MessageSquare className="h-5 w-5" /> },
    { name: "Schedule", href: "/schedule", icon: <Calendar className="h-5 w-5" /> },
    { name: "Resources", href: "/resources", icon: <BarChart className="h-5 w-5" /> },
    { name: "Profile", href: "/profile/mentor", icon: <User className="h-5 w-5" /> },
  ]

  const navItems = userRole === "mentee" ? menteeNavItems : mentorNavItems
  const userName = userRole === "mentee" ? "Sarah Kim" : "Dr. Alex Johnson"
  const userEmail = userRole === "mentee" ? "sarah@example.com" : "alex@example.com"

  // Handle logout functionality
  const handleLogout = () => {
    // Clear localStorage (adjust keys based on your app's usage)
    localStorage.removeItem("menteeProfile")
    localStorage.removeItem("mentorProfile")
    // Redirect to login or home page
    router.push("/login") // Adjust to "/" if no login page exists
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-950 transform transition-transform duration-300 ease-in-out md:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-purple-600 dark:text-purple-400">MentorMatch.ai</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium",
                  pathname === item.href
                    ? "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-3">
                <AvatarImage src="/placeholder.svg" alt={userName} />
                <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{userName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-50 md:w-64 md:bg-white md:dark:bg-gray-950 md:border-r md:border-gray-200 md:dark:border-gray-800 md:flex md:flex-col">
        <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-purple-600 dark:text-purple-400">MentorMatch.ai</span>
          </Link>
        </div>
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium",
                  pathname === item.href
                    ? "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
                )}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-3">
                <AvatarImage src="/placeholder.svg" alt={userName} />
                <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{userName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64">
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              type="button"
              className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-1 md:flex md:items-center md:justify-end">
              <div className="flex items-center space-x-4">
                <NotificationDropdown />
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
                <ModeToggle />
              </div>
            </div>
          </div>
        </div>
        <main className="py-6 px-4 sm:px-6 md:px-8">{children}</main>
      </div>
    </div>
  )
}