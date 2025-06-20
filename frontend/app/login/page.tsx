"use client"

import type React from "react"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { GraduationCap, Users } from "lucide-react"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const roleParam = searchParams.get("role")
  const [activeTab, setActiveTab] = useState<string>(roleParam === "mentor" ? "mentor" : "mentee")

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [welcome, setWelcome] = useState("") // Add this state

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    setWelcome("")

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: activeTab
        })
      })

      const data = await response.json()
      console.log("Login response:", response.status, data)

      if (!response.ok) {
        setError(data.message || "Invalid email or password. Please try again.")
        return
      }

      // Show welcome message before redirect
      setWelcome(`Welcome back, ${data.user?.name || "User"}!`)
      setTimeout(() => {
        window.location.href = `/dashboard/${activeTab}`
      }, 1500)
    } catch (err) {
      setError("Invalid email or password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Sign in to your account</CardTitle>
            <CardDescription className="text-center">
              Enter your email and password to access your MentorMatch.ai account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6 -mt-4">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="mentee" className="py-3">
                  <div className="flex flex-col items-center">
                    <Users className="h-4 w-5 mb-1" />
                    <span>Sign in as Mentee</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="mentor" className="py-3">
                  <div className="flex flex-col items-center">
                    <GraduationCap className="h-4 w-5 mb-1" />
                    <span>Sign in as Mentor</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {welcome && (
              <Alert variant="default" className="mb-4 bg-green-100 border-green-400 text-green-800">
                {welcome}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Link
                href={`/signup${activeTab === "mentor" ? "?role=mentor" : ""}`}
                className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>

      <Footer />
    </div>
  )
}
