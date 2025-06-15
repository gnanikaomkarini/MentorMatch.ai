"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, FileText, MessageSquare, Star, Video } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

export default function MentorProfilePage() {
  const params = useParams()
  const mentorId = params.id
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data - in a real app, this would be fetched based on the mentorId
  const mentor = {
    id: mentorId,
    name: "Dr. Alex Johnson",
    role: "Senior AI Engineer",
    company: "TechCorp Inc.",
    avatar: "/placeholder.svg?height=100&width=100",
    status: "online",
    bio: "Senior AI Engineer with 10+ years of experience in machine learning and software development. Passionate about mentoring and helping others grow in their tech careers.",
    expertise: ["Artificial Intelligence", "Machine Learning", "Python", "TensorFlow", "React", "Node.js"],
    experience: "10+ years",
    education: "Ph.D. in Computer Science, Stanford University",
    rating: 4.9,
    reviewCount: 24,
    matchScore: 95,
  }

  const upcomingMeetings = [
    {
      id: 1,
      title: "Weekly Check-in",
      date: "June 15, 2025",
      time: "3:00 PM - 4:00 PM",
    },
  ]

  const sharedResources = [
    {
      id: 1,
      title: "React Hooks Guide",
      type: "PDF",
      date: "June 5, 2025",
    },
    {
      id: 2,
      title: "Machine Learning Fundamentals",
      type: "PDF",
      date: "June 8, 2025",
    },
    {
      id: 3,
      title: "Python Best Practices",
      type: "Link",
      date: "June 10, 2025",
    },
  ]

  const reviews = [
    {
      id: 1,
      name: "Michael Chen",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 5,
      date: "May 15, 2025",
      comment:
        "Dr. Johnson is an exceptional mentor. His guidance helped me land my dream job in AI. He's patient, knowledgeable, and truly cares about his mentees' success.",
    },
    {
      id: 2,
      name: "Jessica Taylor",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 5,
      date: "April 28, 2025",
      comment:
        "I've learned more in 3 months with Dr. Johnson than I did in a year of self-study. He provides clear explanations and practical advice.",
    },
    {
      id: 3,
      name: "David Wilson",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4,
      date: "April 10, 2025",
      comment: "Great mentor with deep technical knowledge. Always available to answer questions and provide guidance.",
    },
  ]

  return (
    <DashboardLayout userRole="mentee">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={mentor.avatar || "/placeholder.svg"} alt={mentor.name} />
              <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center">
                <h1 className="text-3xl font-bold tracking-tight">{mentor.name}</h1>
                <Badge className="ml-2 bg-purple-600">{mentor.matchScore}% Match</Badge>
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                {mentor.role} at {mentor.company}
              </p>
              <div className="flex items-center mt-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(mentor.rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : i < mentor.rating
                            ? "text-yellow-400 fill-yellow-400 opacity-50"
                            : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm">
                  {mentor.rating} ({mentor.reviewCount} reviews)
                </span>
              </div>
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
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Profile Card */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Bio</h3>
                    <p className="mt-1">{mentor.bio}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Experience</h3>
                    <p className="mt-1">{mentor.experience}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Education</h3>
                    <p className="mt-1">{mentor.education}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Areas of Expertise</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {mentor.expertise.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
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

            {/* Shared Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Shared Resources</CardTitle>
                <CardDescription>Resources shared by {mentor.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sharedResources.map((resource) => (
                    <div key={resource.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                        <div>
                          <p className="font-medium">{resource.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {resource.type} • Shared on {resource.date}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Reviews</CardTitle>
                  <CardDescription>What other mentees are saying</CardDescription>
                </div>
                <Button
                  variant="link"
                  className="text-purple-600 dark:text-purple-400"
                  onClick={() => setActiveTab("reviews")}
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.slice(0, 2).map((review) => (
                    <div key={review.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={review.avatar || "/placeholder.svg"} alt={review.name} />
                            <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{review.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{review.date}</p>
                          </div>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300 dark:text-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-2 text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Shared Resources</CardTitle>
                <CardDescription>Learning materials shared by {mentor.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sharedResources.map((resource) => (
                    <div key={resource.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center">
                        <FileText className="h-8 w-8 mr-4 text-gray-500 dark:text-gray-400" />
                        <div>
                          <p className="font-medium">{resource.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {resource.type} • Shared on {resource.date}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline">View</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Request Resources</CardTitle>
                <CardDescription>Ask {mentor.name} for specific learning materials</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="resource-topic" className="text-sm font-medium">
                      Topic
                    </label>
                    <input
                      id="resource-topic"
                      className="w-full p-2 border rounded-md"
                      placeholder="e.g. React Hooks, Python Data Structures"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="resource-description" className="text-sm font-medium">
                      Description
                    </label>
                    <textarea
                      id="resource-description"
                      className="w-full p-2 border rounded-md"
                      rows={3}
                      placeholder="Describe what specific information you're looking for..."
                    ></textarea>
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">Submit Request</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="meetings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Meetings with {mentor.name}</CardTitle>
                <CardDescription>Schedule and manage your sessions</CardDescription>
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
                          Provide Feedback
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

            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
                <CardDescription>{mentor.name}'s available time slots</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium">Monday</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">3:00 PM - 6:00 PM</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium">Wednesday</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">2:00 PM - 5:00 PM</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium">Friday</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">1:00 PM - 4:00 PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
                <CardDescription>Feedback from other mentees</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-4xl font-bold mr-4">{mentor.rating}</div>
                      <div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${
                                i < Math.floor(mentor.rating)
                                  ? "text-yellow-400 fill-yellow-400"
                                  : i < mentor.rating
                                    ? "text-yellow-400 fill-yellow-400 opacity-50"
                                    : "text-gray-300 dark:text-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Based on {mentor.reviewCount} reviews
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarImage src={review.avatar || "/placeholder.svg"} alt={review.name} />
                              <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{review.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{review.date}</p>
                            </div>
                          </div>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300 dark:text-gray-600"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="mt-3">{review.comment}</p>
                      </div>
                    ))}
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
