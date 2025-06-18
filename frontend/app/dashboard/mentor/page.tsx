"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, CheckCircle, Clock, MessageSquare, Users } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import HorizontalScrollCards from "@/components/horizontal-scroll-cards"

export default function MentorDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data
  const mentees = [
    {
      id: 1,
      name: "Sarah Kim",
      role: "Full Stack Web Development",
      progress: 35,
      avatar: "/placeholder.svg?height=40&width=40",
      lastActive: "Today",
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Data Science",
      progress: 65,
      avatar: "/placeholder.svg?height=40&width=40",
      lastActive: "Yesterday",
    },
    {
      id: 3,
      name: "Jessica Taylor",
      role: "Mobile Development",
      progress: 20,
      avatar: "/placeholder.svg?height=40&width=40",
      lastActive: "3 days ago",
    },
    {
      id: 4,
      name: "David Wilson",
      role: "DevOps Engineering",
      progress: 45,
      avatar: "/placeholder.svg?height=40&width=40",
      lastActive: "Today",
    },
  ]

  const upcomingMeetings = [
    {
      id: 1,
      mentee: "Sarah Kim",
      title: "Weekly Check-in",
      date: "June 15, 2025",
      time: "3:00 PM - 4:00 PM",
    },
    {
      id: 2,
      mentee: "Michael Chen",
      title: "Project Review",
      date: "June 16, 2025",
      time: "4:00 PM - 5:00 PM",
    },
  ]

  const recentMessages = [
    {
      id: 1,
      sender: "Sarah Kim",
      message: "I'm having trouble understanding React hooks. Could you help me?",
      time: "Yesterday",
    },
    {
      id: 2,
      sender: "Michael Chen",
      message: "I've completed the data visualization project. Ready for your feedback!",
      time: "2 days ago",
    },
  ]

  return (
    <DashboardLayout userRole="mentor">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, Dr. Johnson!</h1>
            <p className="text-gray-500 dark:text-gray-400">
              You have {mentees.length} active mentees and {upcomingMeetings.length} upcoming meetings
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Calendar className="mr-2 h-4 w-4" /> View Schedule
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="mentees">Mentees</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Mentees Section */}
              <div className="col-span-3">
                <HorizontalScrollCards
                  title="Your Mentees"
                  people={mentees}
                  onCardClick={(id) => console.log(`Clicked mentee ${id}`)}
                  emptyMessage="You don't have any mentees yet"
                  type="mentees"
                />
              </div>

              {/* Next Meeting Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Next Meeting</CardTitle>
                  <CardDescription>Upcoming session</CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingMeetings.length > 0 ? (
                    <div className="space-y-2">
                      <p className="font-medium">{upcomingMeetings[0].title}</p>
                      <p className="text-sm">with {upcomingMeetings[0].mentee}</p>
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
                  <Button variant="outline" className="w-full">
                    <Link href="/schedule">View Schedule</Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Messages Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Recent Messages</CardTitle>
                  <CardDescription>Stay in touch with your mentees</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentMessages.map((message) => (
                      <div key={message.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{message.sender}</p>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{message.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">{message.message}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    <Link href="/chat">Open Chat</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Mentee Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mentee Progress</CardTitle>
                <CardDescription>Track your mentees' learning journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mentees.map((mentee) => (
                    <div key={mentee.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={mentee.avatar || "/placeholder.svg"} alt={mentee.name} />
                            <AvatarFallback>{mentee.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{mentee.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Last active: {mentee.lastActive}</p>
                          </div>
                        </div>
                        <Badge className={mentee.progress < 30 ? "bg-orange-500" : "bg-green-500"}>
                          {mentee.progress}% Complete
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${mentee.progress}%` }}></div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{mentee.role}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View Detailed Progress
                </Button>
              </CardFooter>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Review Roadmaps</CardTitle>
                  <CardDescription>Adjust learning paths for your mentees</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Review and customize the AI-generated roadmaps for your mentees. Adjust modules, add resources, or
                    modify the learning path based on their progress.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Review Roadmaps
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Mentee Applications</CardTitle>
                  <CardDescription>Review new mentee requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      You have 2 new mentee applications waiting for your review.
                    </p>
                    <Badge>2 New</Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Review Applications
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="mentees" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Your Mentees</CardTitle>
                  <CardDescription>Manage and track your mentees' progress</CardDescription>
                </div>
                <Button className="mt-4 md:mt-0 bg-purple-600 hover:bg-purple-700">
                  <Users className="mr-2 h-4 w-4" /> Accept New Mentees
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mentees.map((mentee) => (
                    <div key={mentee.id} className="border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={mentee.avatar || "/placeholder.svg"} alt={mentee.name} />
                            <AvatarFallback>{mentee.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{mentee.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{mentee.role}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Last active: {mentee.lastActive}</p>
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Progress</span>
                            <span className="text-sm font-medium">{mentee.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${mentee.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button variant="outline" size="sm">
                          <MessageSquare className="mr-2 h-4 w-4" /> Message
                        </Button>
                        <Button variant="outline" size="sm">
                          <Calendar className="mr-2 h-4 w-4" /> Schedule
                        </Button>
                        <Button variant="outline" size="sm">
                          View Roadmap
                        </Button>
                        <Button variant="outline" size="sm">
                          View Progress
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meetings" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Upcoming Meetings</CardTitle>
                  <CardDescription>Scheduled sessions with your mentees</CardDescription>
                </div>
                <Button className="mt-4 md:mt-0 bg-purple-600 hover:bg-purple-700">
                  <Calendar className="mr-2 h-4 w-4" /> Set Availability
                </Button>
              </CardHeader>
              <CardContent>
                {upcomingMeetings.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingMeetings.map((meeting) => (
                      <div key={meeting.id} className="p-4 border rounded-lg">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="font-medium">{meeting.title}</p>
                            <p className="text-sm">with {meeting.mentee}</p>
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
                            <Button variant="outline" size="sm">
                              Reschedule
                            </Button>
                            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                              Join
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">No upcoming meetings scheduled</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Past Meetings</CardTitle>
                <CardDescription>Review previous sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium">Weekly Check-in</p>
                        <p className="text-sm">with Sarah Kim</p>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <Calendar className="mr-1 h-4 w-4" />
                          <span>June 8, 2025</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <Clock className="mr-1 h-4 w-4" />
                          <span>3:00 PM - 4:00 PM</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 md:mt-0">
                        <Button variant="outline" size="sm">
                          View Notes
                        </Button>
                        <Button variant="outline" size="sm">
                          Add Feedback
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium">Project Review</p>
                        <p className="text-sm">with Michael Chen</p>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <Calendar className="mr-1 h-4 w-4" />
                          <span>June 1, 2025</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <Clock className="mr-1 h-4 w-4" />
                          <span>4:00 PM - 5:00 PM</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 md:mt-0">
                        <Button variant="outline" size="sm">
                          View Notes
                        </Button>
                        <Button variant="outline" size="sm">
                          Add Feedback
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Your Resources</CardTitle>
                  <CardDescription>Materials you've shared with mentees</CardDescription>
                </div>
                <Button className="mt-4 md:mt-0 bg-purple-600 hover:bg-purple-700">Add New Resource</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium">React Best Practices Guide</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Shared with: Sarah Kim, Jessica Taylor
                        </p>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <CheckCircle className="mr-1 h-4 w-4" />
                          <span>Added on June 5, 2025</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 md:mt-0">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium">Data Visualization Techniques</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Shared with: Michael Chen</p>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <CheckCircle className="mr-1 h-4 w-4" />
                          <span>Added on May 28, 2025</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 md:mt-0">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium">Mobile App Development Roadmap</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Shared with: Jessica Taylor</p>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <CheckCircle className="mr-1 h-4 w-4" />
                          <span>Added on May 20, 2025</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 md:mt-0">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          Share
                        </Button>
                      </div>
                    </div>
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
