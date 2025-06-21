"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function MatchPage() {
  const [loading, setLoading] = useState(true)
  const [match, setMatch] = useState<null | {
    mentor: string
    name: string
    reason: string
    username: string
  }>(null)
  const [error, setError] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchMatch = async () => {
      setLoading(true)
      setError("")
      setMatch(null)
      try {
        const response = await fetch("http://localhost:5000/api/ai/match", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include"
        })
        const data = await response.json()
        if (!response.ok) {
          setError(data.message || "Failed to match with a mentor.")
          setLoading(false)
          return
        }
        setTimeout(() => {
          setMatch(data.matches)
          setLoading(false)
          setTimeout(() => setShowSuccess(true), 700) // Graceful transition
        }, 1800) // Simulate loading for effect
      } catch (err) {
        setError("An error occurred while matching.")
        setLoading(false)
      }
    }
    fetchMatch()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Finding Your Mentor...</CardTitle>
          <CardDescription className="text-center">
            We’re searching for the best mentor match for you!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading Animation */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="relative flex items-center justify-center mb-4">
                {/* Cool animated loader */}
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
                <Loader2 className="absolute h-8 w-8 text-purple-700 animate-pulse" />
              </div>
              <p className="text-lg font-medium text-purple-700 animate-pulse">Matching you with a mentor...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few moments.</p>
            </div>
          )}

          {/* Success Animation and Mentor Details */}
          {!loading && match && (
            <div className={`flex flex-col items-center justify-center py-8 transition-all duration-700 ${showSuccess ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
              <CheckCircle className="h-16 w-16 text-green-500 mb-2 animate-bounce" />
              <h2 className="text-xl font-bold text-green-700 mb-2">Mentor Matched!</h2>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 w-full mb-2">
                <div className="text-lg font-semibold text-purple-700">{match.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">@{match.username}</div>
                <div className="mt-2 text-gray-700 dark:text-gray-200">
                  <span className="font-medium">Why this mentor?</span>
                  <br />
                  <span>{match.reason}</span>
                </div>
              </div>
              <Button
                className="mt-4"
                onClick={() => router.push("/dashboard/mentee")}
                variant="default"
              >
                Go to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}