"use client"

import DashboardLayout from "@/components/dashboard-layout"
import HorizontalScrollCards from "@/components/horizontal-scroll-cards"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Calendar,
  CheckCircle,
  Clock,
  MessageSquare,
  Video,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function MenteeDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [userData, setUserData] = useState<any>(null)
  const [mentorData, setMentorData] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token") // Make sure token is stored here after login
        const res = await fetch("http://localhost:5000/api/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          console.error("Failed to fetch dashboard data")
          return
        }

        const data = await res.json()
        setUserData(data.user)

        // Fetch mentor if assigned
        if (data.user?.mentors?.length > 0) {
          const mentorId = data.user.mentors[0]
          const mentorRes = await fetch(`http://localhost:5000/api/mentors/${mentorId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          const mentor = await mentorRes.json()
          setMentorData(mentor)
        }

      } catch (error) {
        console.error("Error fetching dashboard:", error)
      }
    }

    fetchDashboardData()
  }, [])

  const roadmap = {
    title: "Full Stack Web Development",
    progress: 35,
    nextModule: "React Fundamentals",
    modules: [
      { name: "HTML & CSS Basics", completed: true },
      { name: "JavaScript Fundamentals", completed: true },
      { name: "React Fundamentals", completed: false, current: true },
      { name: "Node.js & Express", completed: false },
      { name: "Database Design", completed: false },
      { name: "Authentication & Security", completed: false },
      { name: "Deployment & DevOps", completed: false },
    ],
  }

  const upcomingMeetings = [
    {
      id: 1,
      title: "Weekly Check-in",
      date: "June 15, 2025",
      time: "3:00 PM - 4:00 PM",
    },
  ]

  const recentMessages = [
    {
      id: 1,
      sender: mentorData?.name || "Your Mentor",
      message: "How are you progressing with the React exercises?",
      time: "Yesterday",
    }
  ]

  return (
    <DashboardLayout userRole="mentee">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {userData?.name || "Mentee"}!
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Continue your learning journey. You've made great progress this week!
            </p>
          </div>
        </div>

        {/* Mentor Card */}
        <div className="col-span-3">
          <HorizontalScrollCards
            title="Your Mentor"
            people={
              mentorData
                ? [
                    {
                      id: mentorData._id,
                      name: mentorData.name,
                      role: mentorData.profile?.experience || "Mentor",
                      avatar: mentorData.profile?.profile_picture || "/placeholder.svg",
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
              <CardDescription>{roadmap.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{roadmap.progress}%</span>
                </div>
                <Progress value={roadmap.progress} />
              </div>
              <div>
                <p className="text-sm font-medium">Next up:</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{roadmap.nextModule}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/roadmap" className="w-full">
                <Button variant="outline" className="w-full">View Full Roadmap</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Meeting Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Next Meeting</CardTitle>
              <CardDescription>Upcoming session with your mentor</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingMeetings.length > 0 ? (
                <div className="space-y-2">
                  <p className="font-medium">{upcomingMeetings[0].title}</p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="mr-1 h-4 w-4" />
                    <span>{upcomingMeetings[0].date}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="mr-1 h-4 w-4" />
                    <span>{upcomingMeetings[0].time}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming meetings</p>
              )}
            </CardContent>
            <CardFooter>
              <Link href="/schedule" className="w-full">
                <Button variant="outline" className="w-full">View All Meetings</Button>
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
              {recentMessages.map((message) => (
                <div key={message.id} className="flex items-start space-x-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{message.sender.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-sm">{message.sender}</p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{message.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{message.message}</p>
                  </div>
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
    </DashboardLayout>
  )
}
