"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Calendar, Clock, MessageSquare, BarChart, ChevronLeft, ChevronRight, Star } from "lucide-react"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"

export default function MentorDashboard() {
  const [dashboard, setDashboard] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true)
      setError("")
      try {
        const res = await fetch("http://localhost:5000/api/dashboard/mentor", {
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

  // Horizontal scroll for mentees
  const menteeScrollRef = useRef<HTMLDivElement>(null)
  const scrollMentees = (dir: "left" | "right") => {
    if (menteeScrollRef.current) {
      const scrollAmount = 320 // px
      menteeScrollRef.current.scrollBy({
        left: dir === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-500">{error}</div>
  if (!dashboard) return null

  return (
    <DashboardLayout
      userRole="mentor"
      userName={dashboard.user?.name || ""}
      userEmail={dashboard.user?.email || ""}
    >
      <div className="space-y-6">
        {/* User Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{dashboard.user?.name}</CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">{dashboard.user?.email}</CardDescription>
          </CardHeader>
        </Card>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
            <p className="text-gray-500 dark:text-gray-400">
              You have {dashboard.mentees.length} active mentees
            </p>
          </div>
        </div>

        {/* Mentees Horizontal Scroll */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex"
            onClick={() => scrollMentees("left")}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div
            ref={menteeScrollRef}
            className="flex overflow-x-auto gap-4 px-8 py-2 scroll-smooth hide-scrollbar"
            style={{ scrollBehavior: "smooth" }}
          >
            {dashboard.mentees.map((mentee: any) => (
              <Card key={mentee.id} className="min-w-[300px] max-w-xs flex-shrink-0">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder.svg" alt={mentee.name} />
                    <AvatarFallback>{mentee.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{mentee.name}</CardTitle>
                    <CardDescription>
                      {mentee.roadmap_title || "No Roadmap"}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Progress</span>
                    <Badge className={mentee.progress < 30 ? "bg-orange-500" : "bg-green-500"}>
                      {mentee.progress}% Complete
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${mentee.progress}%` }}
                    ></div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2">
                  <Link href={`/chat?mentee=${mentee.id}`}>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="mr-2 h-4 w-4" /> Chat with Mentee
                    </Button>
                  </Link>
                  {mentee.roadmap_id ? (
                    <Link href={`/roadmap?id=${mentee.roadmap_id}`}>
                      <Button variant="outline" size="sm">
                        <BarChart className="mr-2 h-4 w-4" /> View Full Roadmap
                      </Button>
                    </Link>
                  ) : (
                    <div className="text-xs text-gray-500 px-2 py-1">
                      Roadmap not created yet. Go to chat to discuss and create.
                    </div>
                  )}
                  <Link
                    href={{
                      pathname: "/schedule",
                      query: {
                        mentees: encodeURIComponent(JSON.stringify(
                          dashboard.mentees.map((m: any) => ({ id: m.id, name: m.name }))
                        )),
                      },
                    }}
                  >
                    <Button variant="outline" size="sm">
                      <Calendar className="mr-2 h-4 w-4" /> Schedule Meet
                    </Button>
                  </Link>
                </CardFooter>

                {/* Feedback Section */}
                <MenteeFeedbackSection mentee={mentee} />
              </Card>
            ))}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex"
            onClick={() => scrollMentees("right")}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Next Meeting & Recent Messages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Next Meeting */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Next Meeting</CardTitle>
              <CardDescription>Upcoming session</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard.mentees.length > 0 && dashboard.mentees[0].upcoming_meeting ? (
                <div className="space-y-2">
                  <p className="font-medium">{dashboard.mentees[0].upcoming_meeting.title}</p>
                  <p className="text-sm">with {dashboard.mentees[0].name}</p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="mr-1 h-4 w-4" />
                    <span>{dashboard.mentees[0].upcoming_meeting.date}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="mr-1 h-4 w-4" />
                    <span>{dashboard.mentees[0].upcoming_meeting.time}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming meetings</p>
              )}
            </CardContent>
            <CardFooter>
              <Link href="/schedule" className="w-full">
                <Button variant="outline" className="w-full">View Schedule</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Recent Messages */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Messages</CardTitle>
              <CardDescription>Stay in touch with your mentees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard.mentees
                  .filter((mentee: any) => mentee.last_message)
                  .map((mentee: any) => (
                    <div key={mentee.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{mentee.name}</p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {mentee.last_message.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
                        {mentee.last_message.content}
                      </p>
                    </div>
                  ))}
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/chat" className="w-full">
                <Button variant="outline" className="w-full">Open Chat</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </DashboardLayout>
  )
}

function MenteeFeedbackSection({ mentee }) {
  const [menteeFeedback, setMenteeFeedback] = useState<any>(null)
  const [myFeedback, setMyFeedback] = useState<any>(null)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [text, setText] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (mentee.roadmap_id && mentee.progress === 100) {
      // Mentee's feedback about you (mentor)
      fetch(
        `http://localhost:5000/api/roadmaps/${mentee.roadmap_id}/feedback/mentor`,
        { credentials: "include" }
      )
        .then((res) => res.json())
        .then((data) => setMenteeFeedback(data.feedback))

      // Your feedback about the mentee
      fetch(
        `http://localhost:5000/api/roadmaps/${mentee.roadmap_id}/feedback/mentee`,
        { credentials: "include" }
      )
        .then((res) => res.json())
        .then((data) => setMyFeedback(data.feedback))
    }
  }, [mentee.roadmap_id, mentee.progress])

  if (mentee.progress !== 100 || !mentee.roadmap_id) return null

  return (
    <div className="mt-4 space-y-2">
      {/* Show feedback from mentee */}
      {menteeFeedback ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="font-semibold text-green-800 mb-1">Mentee's Feedback for You:</div>
          <div className="flex items-center mb-1">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className={`h-4 w-4 ${i <= menteeFeedback.rating ? "text-yellow-500" : "text-gray-300"}`} />
            ))}
          </div>
          <div className="text-sm text-green-900 whitespace-pre-line">{menteeFeedback.text}</div>
        </div>
      ) : (
        <div className="text-blue-700 text-sm">
          Mentee has not given feedback yet. Please remind your mentee to submit feedback!
        </div>
      )}

      {/* Give feedback about mentee */}
      {myFeedback ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="font-semibold text-blue-800 mb-1">Your Feedback for Mentee:</div>
          <div className="flex items-center mb-1">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className={`h-4 w-4 ${i <= myFeedback.rating ? "text-yellow-500" : "text-gray-300"}`} />
            ))}
          </div>
          <div className="text-sm text-blue-900 whitespace-pre-line">{myFeedback.text}</div>
        </div>
      ) : (
        <div>
          <div className="text-blue-700 text-sm mb-2">
            You have not given feedback for your mentee yet.
          </div>
          {!showFeedbackForm ? (
            <Button onClick={() => setShowFeedbackForm(true)} size="sm">
              Give Feedback to Mentee
            </Button>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                setSubmitting(true)
                await fetch(
                  `http://localhost:5000/api/roadmaps/${mentee.roadmap_id}/feedback/mentee`,
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
                {[1,2,3,4,5].map(i => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setRating(i)}
                    className="focus:outline-none"
                  >
                    <Star className={`h-6 w-6 ${i <= rating ? "text-yellow-500" : "text-gray-300"}`} />
                  </button>
                ))}
                <span className="ml-2 text-sm">{rating ? `${rating} Star${rating > 1 ? "s" : ""}` : ""}</span>
              </div>
              <textarea
                className="w-full border rounded p-2"
                rows={3}
                placeholder="Write your feedback..."
                value={text}
                onChange={e => setText(e.target.value)}
                required
              />
              <Button type="submit" size="sm" disabled={submitting || !rating || !text}>
                {submitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
