"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, CheckCircle, Clock, MessageSquare, Video } from "lucide-react"
import { useParams } from "next/navigation"
import { useState } from "react"

export default function MenteeProfilePage() {
  const params = useParams()
  const menteeId = params.id
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data - in a real app, this would be fetched based on the menteeId
  const mentee = {
    id: menteeId,
    name: "Sarah Kim",
    email: "sarah@example.com",
    goal: "Full Stack Web Development",
    progress: 35,
    avatar: "/placeholder.svg?height=100&width=100",
    lastActive: "Today",
    joinedDate: "June 1, 2025",
    bio: "Aspiring full stack developer with a background in graphic design. Looking to transition into web development and build interactive web applications.",
    skills: ["HTML", "CSS", "JavaScript", "React (Beginner)"],
    timeCommitment: "10 hours per week",
    learningStyle: "Visual and practical",
  }

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

  const recentActivities = [
    {
      id: 1,
      type: "module_completed",
      description: "Completed JavaScript Fundamentals module",
      date: "June 8, 2025",
    },
    {
      id: 2,
      type: "resource_completed",
      description: "Completed 'Introduction to React' video",
      date: "June 10, 2025",
    },
    {
      id: 3,
      type: "assessment_taken",
      description: "Scored 85% on JavaScript assessment",
      date: "June 9, 2025",
    },
  ]

  return (
    <DashboardLayout userRole="mentor" userName={mentee.name} userEmail={mentee.email}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={mentee.avatar || "/placeholder.svg"} alt={mentee.name} />
              <AvatarFallback>{mentee.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{mentee.name}</h1>
              <p className="text-gray-500 dark:text-gray-400">
                {mentee.goal} • Joined {mentee.joinedDate}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" /> Message
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Video className="mr-2 h-4 w-4" /> Schedule Meeting
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Profile Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Bio</h3>
                    <p className="mt-1">{mentee.bio}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
                    <p className="mt-1">{mentee.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Time Commitment</h3>
                    <p className="mt-1">{mentee.timeCommitment}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Learning Style</h3>
                    <p className="mt-1">{mentee.learningStyle}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Skills</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {mentee.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Progress Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Roadmap Progress</CardTitle>
                  <CardDescription>{roadmap.title}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{mentee.progress}%</span>
                    </div>
                    <Progress value={mentee.progress} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Current module:</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{roadmap.nextModule}</p>
                  </div>
                  <div className="space-y-2">
                    {roadmap.modules.map((module, index) => (
                      <div key={index} className="flex items-center">
                        <div
                          className={`w-5 h-5 rounded-full mr-2 flex items-center justify-center ${
                            module.completed
                              ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                              : module.current
                                ? "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
                                : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {module.completed ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <span className="text-xs">{index + 1}</span>
                          )}
                        </div>
                        <span className={module.current ? "font-medium" : ""}>{module.name}</span>
                        {module.current && <Badge className="ml-2 bg-purple-600">Current</Badge>}
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View Full Roadmap
                  </Button>
                </CardFooter>
              </Card>

              {/* Next Meeting Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Next Meeting</CardTitle>
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
                  <Button variant="outline" className="w-full">
                    Schedule Meeting
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div
                        className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.type === "module_completed"
                            ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                            : activity.type === "resource_completed"
                              ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                              : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300"
                        }`}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p>{activity.description}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roadmap" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Learning Roadmap</CardTitle>
                <CardDescription>Track and adjust {mentee.name}'s learning path</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{mentee.progress}%</span>
                    </div>
                    <Progress value={mentee.progress} className="h-2" />
                  </div>

                  <div className="space-y-6">
                    {roadmap.modules.map((module, index) => (
                      <div key={index} className="border-b pb-4 last:border-0">
                        <div className="flex items-start">
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
                                In progress - Estimated completion: June 22, 2025
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Suggest Changes</Button>
                <Button className="bg-purple-600 hover:bg-purple-700">Edit Roadmap</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
                <CardDescription>Detailed view of {mentee.name}'s progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Module Completion</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>HTML & CSS Basics</span>
                        <span>100%</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                    <div className="space-y-2 mt-4">
                      <div className="flex justify-between text-sm">
                        <span>JavaScript Fundamentals</span>
                        <span>100%</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                    <div className="space-y-2 mt-4">
                      <div className="flex justify-between text-sm">
                        <span>React Fundamentals</span>
                        <span>40%</span>
                      </div>
                      <Progress value={40} className="h-2" />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Assessment Results</h3>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">JavaScript Assessment</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Completed on June 9, 2025</p>
                          </div>
                          <Badge className="bg-green-600">85%</Badge>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm font-medium">Strengths:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Functions, Arrays, DOM manipulation
                          </p>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm font-medium">Areas for improvement:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Closures, Promises, Async/Await</p>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">HTML & CSS Assessment</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Completed on June 2, 2025</p>
                          </div>
                          <Badge className="bg-green-600">92%</Badge>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm font-medium">Strengths:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Semantic HTML, CSS Flexbox, Responsive design
                          </p>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm font-medium">Areas for improvement:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">CSS Grid, Animations</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meetings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Meetings</CardTitle>
                <CardDescription>Schedule and review meetings with {mentee.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">Upcoming Meetings</h3>
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
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">No upcoming meetings scheduled</p>
                  )}
                </div>

                <div>
                  <h3 className="font-medium mb-4">Past Meetings</h3>
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
              <CardFooter>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">Schedule New Meeting</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
