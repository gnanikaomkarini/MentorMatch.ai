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
import { useState } from "react"

export default function MenteeDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  const mentors = [
    {
      id: 1,
      name: "Dr. Alex Johnson",
      role: "Senior AI Engineer",
      avatar: "/placeholder.svg?height=40&width=40",
      matchScore: 95,
      status: "online",
    },
    {
      id: 2,
      name: "Sarah Williams",
      role: "Full Stack Developer",
      avatar: "/placeholder.svg?height=40&width=40",
      matchScore: 87,
      status: "offline",
    },
    {
      id: 3,
      name: "Michael Chen",
      role: "Data Scientist",
      avatar: "/placeholder.svg?height=40&width=40",
      matchScore: 82,
      status: "offline",
    },
  ]

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
      sender: "Dr. Alex Johnson",
      message: "How are you progressing with the React exercises?",
      time: "Yesterday",
    },
    {
      id: 2,
      sender: "AI Assistant",
      message:
        "I've analyzed your latest quiz results. Would you like some additional resources on React hooks?",
      time: "2 days ago",
    },
  ]

  return (
    <DashboardLayout userRole="mentee">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, Sarah!</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Continue your learning journey. You've made great progress this week!
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <Button variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" /> Message Mentor
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Video className="mr-2 h-4 w-4" /> Schedule Meeting
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
          </TabsList>

          {/* ========== OVERVIEW TAB ========== */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-3">
                <HorizontalScrollCards
                  title="Your Mentors"
                  people={mentors}
                  onCardClick={(id) => console.log(`Clicked mentor ${id}`)}
                  emptyMessage="You don't have any mentors yet"
                  type="mentors"
                />
              </div>

              {/* Roadmap Progress */}
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
                    <Button variant="outline" className="w-full">Schedule Meeting</Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>

            {/* Recent Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Messages</CardTitle>
                <CardDescription>Stay in touch with your mentor and AI assistant</CardDescription>
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
          </TabsContent>

          {/* ========== ROADMAP TAB ========== */}
          <TabsContent value="roadmap" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{roadmap.title}</CardTitle>
                <CardDescription>Your personalized learning path</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {roadmap.modules.map((module, index) => (
                    <div key={index} className="flex items-start">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full mr-4 ${
                          module.completed
                            ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                            : module.current
                            ? "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
                            : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {module.completed ? <CheckCircle className="h-5 w-5" /> : <span>{index + 1}</span>}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <p className="font-medium">{module.name}</p>
                          {module.current && <Badge className="ml-2 bg-purple-600">Current</Badge>}
                        </div>
                        {module.current && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Learn the fundamentals of React, including components, props, and state.
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/roadmap" className="w-full">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">View Detailed Roadmap</Button>
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* ========== RESOURCES TAB ========== */}
          <TabsContent value="resources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Learning Resources</CardTitle>
                <CardDescription>Curated materials for your current module</CardDescription>
              </CardHeader>
              <CardContent>
                {/* You can turn this into a map if the list grows */}
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">React Official Documentation</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          The official React documentation with guides and API references
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <a href="https://reactjs.org" target="_blank" rel="noopener noreferrer">View</a>
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">React Crash Course</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          YouTube video tutorial covering React fundamentals
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">Watch</a>
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">React Hooks Explained</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          In-depth article about React hooks and their use cases
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <a href="#" target="_blank" rel="noopener noreferrer">Read</a>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========== MEETINGS TAB ========== */}
          <TabsContent value="meetings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Meetings</CardTitle>
                <CardDescription>Scheduled sessions with your mentor</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingMeetings.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingMeetings.map((meeting) => (
                      <div key={meeting.id} className="p-4 border rounded-lg">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="font-medium">{meeting.title}</p>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                              <Calendar className="mr-1 h-4 w-4" />
                              <span>{meeting.date}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                              <Clock className="mr-1 h-4 w-4" />
                              <span>{meeting.time}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4 md:mt-0">
                            <Button variant="outline" size="sm">Reschedule</Button>
                            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">Join</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No upcoming meetings scheduled
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Link href="/schedule" className="w-full">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">Schedule New Meeting</Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Past Meetings</CardTitle>
                <CardDescription>Review previous sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded-lg">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium">Introduction & Goal Setting</p>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <Calendar className="mr-1 h-4 w-4" />
                        <span>June 1, 2025</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <Clock className="mr-1 h-4 w-4" />
                        <span>3:00 PM - 4:00 PM</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="mt-4 md:mt-0">
                      View Notes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
