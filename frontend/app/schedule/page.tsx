"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, CheckCircle, Clock, Video } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

export default function SchedulePage() {
  const [activeTab, setActiveTab] = useState("upcoming")
  const [date, setDate] = useState<Date | undefined>(new Date())

  // Mock data
  const upcomingMeetings = [
    {
      id: 1,
      title: "Weekly Check-in",
      mentor: "Dr. Alex Johnson",
      date: "June 15, 2025",
      time: "3:00 PM - 4:00 PM",
      status: "confirmed",
    },
  ]

  const pastMeetings = [
    {
      id: 1,
      title: "Introduction & Goal Setting",
      mentor: "Dr. Alex Johnson",
      date: "June 1, 2025",
      time: "3:00 PM - 4:00 PM",
      status: "completed",
    },
  ]

  const availableSlots = [
    { id: 1, date: "June 17, 2025", time: "2:00 PM - 3:00 PM" },
    { id: 2, date: "June 17, 2025", time: "4:00 PM - 5:00 PM" },
    { id: 3, date: "June 18, 2025", time: "1:00 PM - 2:00 PM" },
    { id: 4, date: "June 18, 2025", time: "3:00 PM - 4:00 PM" },
    { id: 5, date: "June 19, 2025", time: "2:00 PM - 3:00 PM" },
  ]

  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [meetingTitle, setMeetingTitle] = useState("")
  const [meetingAgenda, setMeetingAgenda] = useState("")

  const handleScheduleMeeting = () => {
    // In a real app, this would make an API call to schedule the meeting
    console.log("Scheduling meeting:", {
      slot: selectedSlot,
      title: meetingTitle,
      agenda: meetingAgenda,
    })

    // Reset form
    setSelectedSlot(null)
    setMeetingTitle("")
    setMeetingAgenda("")

    // Switch to upcoming tab
    setActiveTab("upcoming")
  }

  return (
    <DashboardLayout userRole="mentee">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule Meetings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Book time with your mentor for personalized guidance</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="schedule">Schedule New</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingMeetings.length > 0 ? (
              upcomingMeetings.map((meeting) => (
                <Card key={meeting.id}>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <CardTitle>{meeting.title}</CardTitle>
                        <CardDescription>with {meeting.mentor}</CardDescription>
                      </div>
                      <Badge className="mt-2 md:mt-0 bg-green-600 self-start md:self-auto">
                        {meeting.status === "confirmed" ? "Confirmed" : "Pending"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
                      <div className="flex items-center">
                        <CalendarIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                        <span>{meeting.date}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                        <span>{meeting.time}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Meeting link will be available 15 minutes before the scheduled time
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline">Reschedule</Button>
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <Video className="mr-2 h-4 w-4" /> Join Meeting
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Upcoming Meetings</CardTitle>
                  <CardDescription>You don't have any scheduled meetings</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    Schedule a meeting with your mentor to get personalized guidance
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => setActiveTab("schedule")}>
                    Schedule Meeting
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastMeetings.length > 0 ? (
              pastMeetings.map((meeting) => (
                <Card key={meeting.id}>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <CardTitle>{meeting.title}</CardTitle>
                        <CardDescription>with {meeting.mentor}</CardDescription>
                      </div>
                      <Badge variant="outline" className="mt-2 md:mt-0 self-start md:self-auto">
                        {meeting.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
                      <div className="flex items-center">
                        <CalendarIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                        <span>{meeting.date}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                        <span>{meeting.time}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2">
                    <Button variant="outline">View Notes</Button>
                    <Button variant="outline">
                      <Video className="mr-2 h-4 w-4" /> Recording
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Past Meetings</CardTitle>
                  <CardDescription>You haven't had any meetings yet</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    Once you've had meetings with your mentor, they'll appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Schedule a New Meeting</CardTitle>
                <CardDescription>Book time with your mentor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                  <div className="md:w-1/2 space-y-4">
                    <div>
                      <Label htmlFor="meeting-title">Meeting Title</Label>
                      <Input
                        id="meeting-title"
                        placeholder="e.g. Weekly Check-in"
                        value={meetingTitle}
                        onChange={(e) => setMeetingTitle(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="meeting-agenda">Agenda (Optional)</Label>
                      <Textarea
                        id="meeting-agenda"
                        placeholder="What would you like to discuss?"
                        value={meetingAgenda}
                        onChange={(e) => setMeetingAgenda(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label>Meeting Type</Label>
                      <Select defaultValue="video">
                        <SelectTrigger>
                          <SelectValue placeholder="Select meeting type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">Video Call</SelectItem>
                          <SelectItem value="audio">Audio Call</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="md:w-1/2">
                    <Label className="block mb-2">Select Date</Label>
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="border rounded-md p-2"
                      disabled={(date) => {
                        // Disable past dates and weekends
                        const now = new Date()
                        now.setHours(0, 0, 0, 0)
                        const day = date.getDay()
                        return date < now || day === 0 || day === 6
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Label className="block mb-2">Available Time Slots</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {availableSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`border rounded-md p-3 cursor-pointer ${
                          selectedSlot === slot.id
                            ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                            : "hover:border-gray-400 dark:hover:border-gray-600"
                        }`}
                        onClick={() => setSelectedSlot(slot.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{slot.time}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{slot.date}</p>
                          </div>
                          {selectedSlot === slot.id && (
                            <CheckCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("upcoming")}>
                  Cancel
                </Button>
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={!selectedSlot || !meetingTitle}
                  onClick={handleScheduleMeeting}
                >
                  Schedule Meeting
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
