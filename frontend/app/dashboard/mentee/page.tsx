"use client"

import DashboardLayout from "@/components/dashboard-layout"
import HorizontalScrollCards from "@/components/horizontal-scroll-cards"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, Star } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function MenteeDashboard() {
  const [dashboard, setDashboard] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [mentorFeedback, setMentorFeedback] = useState<any>(null)
  const [myFeedback, setMyFeedback] = useState<any>(null)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [text, setText] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true)
      setError("")
      try {
        const res = await fetch("http://localhost:5000/api/dashboard/mentee", {
          credentials: "include",
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.message || "Failed to fetch dashboard")
          setLoading(false)
          return
        }
        setDashboard(data)
      } catch (err) {
        setError("Failed to fetch dashboard")
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  useEffect(() => {
    if (dashboard && dashboard.roadmap_id && dashboard.progress === 100) {
      // Mentor's feedback about you (mentee)
      fetch(
        `http://localhost:5000/api/roadmaps/${dashboard.roadmap_id}/feedback/mentee`,
        { credentials: "include" }
      )
        .then((res) => res.json())
        .then((data) => setMentorFeedback(data.feedback))

      // Your feedback about the mentor
      fetch(
        `http://localhost:5000/api/roadmaps/${dashboard.roadmap_id}/feedback/mentor`,
        { credentials: "include" }
      )
        .then((res) => res.json())
        .then((data) => setMyFeedback(data.feedback))
    }
  }, [dashboard])

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-500">{error}</div>
  if (!dashboard) return null

  return (
    <DashboardLayout
      userRole="mentee"
      userName={dashboard.user?.name || ""}
      userEmail={dashboard.user?.email || ""}
    >
      <div className="space-y-6">
        {/* User Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {dashboard.user?.name}
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              {dashboard.user?.email}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Mentor Card */}
        <div className="col-span-3">
          <HorizontalScrollCards
            title="Your Mentor"
            people={
              dashboard.mentor
                ? [
                    {
                      id: dashboard.mentor.id,
                      name: dashboard.mentor.name,
                      role: "Mentor",
                      avatar: "/placeholder.svg",
                      matchScore: 100,
                    },
                  ]
                : []
            }
            onCardClick={(id) => console.log(`Clicked mentor ${id}`)}
            emptyMessage="You don't have any mentors yet"
            type="mentors"
          />
        </div>

        {/* Roadmap Progress */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Roadmap Progress</CardTitle>
              <CardDescription>{dashboard.roadmap_title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{dashboard.progress}%</span>
                </div>
                <Progress value={dashboard.progress} />
              </div>
            </CardContent>
            <CardFooter>
              {dashboard.roadmap_id ? (
                <Link
                  href={`/roadmap?id=${dashboard.roadmap_id}`}
                  className="w-full"
                >
                  <Button variant="outline" className="w-full">
                    View Full Roadmap
                  </Button>
                </Link>
              ) : (
                <div className="text-xs text-gray-500 w-full text-center py-2">
                  Roadmap not created yet. Go to chat to discuss and create.
                </div>
              )}
            </CardFooter>
          </Card>

          {/* Meeting Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Next Meeting</CardTitle>
              <CardDescription>Upcoming session with your mentor</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard.upcoming_meeting ? (
                <div className="space-y-2">
                  <p className="font-medium">
                    {dashboard.upcoming_meeting.title}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="mr-1 h-4 w-4" />
                    <span>{dashboard.upcoming_meeting.date}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="mr-1 h-4 w-4" />
                    <span>{dashboard.upcoming_meeting.time}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No upcoming meetings
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Link href="/schedule" className="w-full">
                <Button variant="outline" className="w-full">
                  View All Meetings
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        {/* Recent Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Messages</CardTitle>
            <CardDescription>Stay in touch with your mentor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.last_message ? (
                <div className="flex items-start space-x-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {dashboard.mentor?.name?.charAt(0) || "M"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-sm">
                        {dashboard.mentor?.name || "Mentor"}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {dashboard.last_message.time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {dashboard.last_message.content}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/chat" className="w-full">
              <Button variant="outline" className="w-full">
                Open Chat
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Feedback Section - Shown only when roadmap is complete */}
        {dashboard.progress === 100 && dashboard.roadmap_id && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Feedback</CardTitle>
              <CardDescription>
                Feedback between you and your mentor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-4 space-y-2">
                {/* Show feedback from mentor */}
                {mentorFeedback ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="font-semibold text-green-800 mb-1">
                      Mentor's Feedback for You:
                    </div>
                    <div className="flex items-center mb-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i <= mentorFeedback.rating
                              ? "text-yellow-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-green-900 whitespace-pre-line">
                      {mentorFeedback.text}
                    </div>
                  </div>
                ) : (
                  <div className="text-blue-700 text-sm">
                    Mentor has not given feedback yet. Please remind your mentor to
                    submit feedback!
                  </div>
                )}

                {/* Give feedback about mentor */}
                {myFeedback ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="font-semibold text-blue-800 mb-1">
                      Your Feedback for Mentor:
                    </div>
                    <div className="flex items-center mb-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i <= myFeedback.rating ? "text-yellow-500" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-blue-900 whitespace-pre-line">
                      {myFeedback.text}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-blue-700 text-sm mb-2">
                      You have not given feedback for your mentor yet.
                    </div>
                    {!showFeedbackForm ? (
                      <Button onClick={() => setShowFeedbackForm(true)} size="sm">
                        Give Feedback to Mentor
                      </Button>
                    ) : (
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault()
                          setSubmitting(true)
                          await fetch(
                            `http://localhost:5000/api/roadmaps/${dashboard.roadmap_id}/feedback/mentor`,
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              credentials: "include",
                              body: JSON.stringify({ rating, text }),
                            }
                          )
                          setSubmitting(false)
                          setShowFeedbackForm(false)
                          setMyFeedback({ rating, text })
                        }}
                        className="space-y-2 mt-2"
                      >
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <button
                              type="button"
                              key={i}
                              onClick={() => setRating(i)}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`h-6 w-6 ${
                                  i <= rating ? "text-yellow-500" : "text-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                          <span className="ml-2 text-sm">
                            {rating ? `${rating} Star${rating > 1 ? "s" : ""}` : ""}
                          </span>
                        </div>
                        <textarea
                          className="w-full border rounded p-2"
                          rows={3}
                          placeholder="Write your feedback..."
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          required
                        />
                        <Button
                          type="submit"
                          size="sm"
                          disabled={submitting || !rating || !text}
                        >
                          {submitting ? "Submitting..." : "Submit Feedback"}
                        </Button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
