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
import { Calendar, Clock, MessageSquare, BarChart, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useState, useRef } from "react"

export default function MentorDashboard() {
  const mentees = [
    { id: 1, name: "Sarah Kim", role: "Full Stack Web Development", progress: 35, avatar: "/placeholder.svg" },
    { id: 2, name: "Michael Chen", role: "Data Science", progress: 65, avatar: "/placeholder.svg"},
    { id: 3, name: "Jessica Taylor", role: "Mobile Development", progress: 20, avatar: "/placeholder.svg"},
    { id: 4, name: "David Wilson", role: "DevOps Engineering", progress: 45, avatar: "/placeholder.svg"},
  ];

  const upcomingMeetings = [
    { id: 1, mentee: "Sarah Kim", title: "Weekly Check-in", date: "June 15, 2025", time: "3:00 PM - 4:00 PM" },
    { id: 2, mentee: "Michael Chen", title: "Project Review", date: "June 16, 2025", time: "4:00 PM - 5:00 PM" },
  ];

  const recentMessages = [
    { id: 1, sender: "Sarah Kim", message: "I'm having trouble understanding React hooks. Could you help me?", time: "Yesterday" },
    { id: 2, sender: "Michael Chen", message: "I've completed the data visualization project. Ready for your feedback!", time: "2 days ago" },
  ];

  // Horizontal scroll for mentees
  const menteeScrollRef = useRef<HTMLDivElement>(null);
  const scrollMentees = (dir: "left" | "right") => {
    if (menteeScrollRef.current) {
      const scrollAmount = 320; // px
      menteeScrollRef.current.scrollBy({
        left: dir === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

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
            {mentees.map((mentee) => (
              <Card key={mentee.id} className="min-w-[300px] max-w-xs flex-shrink-0">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={mentee.avatar} alt={mentee.name} />
                    <AvatarFallback>{mentee.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{mentee.name}</CardTitle>
                    <CardDescription>{mentee.role}</CardDescription>
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
                  <Link href={`/roadmap?mentee=${mentee.id}`}>
                    <Button variant="outline" size="sm">
                      <BarChart className="mr-2 h-4 w-4" /> View Full Roadmap
                    </Button>
                  </Link>
                  <Link href={`/schedule?mentee=${mentee.id}`}>
                    <Button variant="outline" size="sm">
                      <Calendar className="mr-2 h-4 w-4" /> Schedule Meet
                    </Button>
                  </Link>
                </CardFooter>
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

        {/* Upcoming Meetings & Recent Messages side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Next Meeting */}
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
  );
}
