"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Search, Filter } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("recommended")
  const [expertiseFilter, setExpertiseFilter] = useState("all")

  // Mock data
  const mentors = [
    {
      id: 1,
      name: "Dr. Alex Johnson",
      role: "Senior AI Engineer",
      company: "TechCorp Inc.",
      avatar: "/placeholder.svg?height=100&width=100",
      expertise: ["Artificial Intelligence", "Machine Learning", "Python"],
      rating: 4.9,
      reviewCount: 24,
      matchScore: 95,
      status: "online",
    },
    {
      id: 2,
      name: "Sarah Williams",
      role: "Full Stack Developer",
      company: "WebSolutions Ltd.",
      avatar: "/placeholder.svg?height=100&width=100",
      expertise: ["React", "Node.js", "JavaScript"],
      rating: 4.8,
      reviewCount: 18,
      matchScore: 87,
      status: "offline",
    },
    {
      id: 3,
      name: "Michael Chen",
      role: "Data Scientist",
      company: "DataInsights Co.",
      avatar: "/placeholder.svg?height=100&width=100",
      expertise: ["Data Science", "Python", "Machine Learning"],
      rating: 4.7,
      reviewCount: 15,
      matchScore: 82,
      status: "online",
    },
    {
      id: 4,
      name: "Jessica Taylor",
      role: "UX/UI Designer",
      company: "DesignHub",
      avatar: "/placeholder.svg?height=100&width=100",
      expertise: ["UI Design", "UX Research", "Figma"],
      rating: 4.9,
      reviewCount: 22,
      matchScore: 79,
      status: "offline",
    },
    {
      id: 5,
      name: "Davi Almeida",
      role: "DevOps Engineer",
      company: "CloudTech Solutions",
      avatar: "/placeholder.svg?height=100&width=100",
      expertise: ["DevOps", "AWS", "Docker", "Kubernetes"],
      rating: 4.6,
      reviewCount: 12,
      matchScore: 75,
      status: "online",
    },
    {
      id: 6,
      name: "Emily Johnson",
      role: "Mobile Developer",
      company: "AppWorks Inc.",
      avatar: "/placeholder.svg?height=100&width=100",
      expertise: ["React Native", "iOS", "Android"],
      rating: 4.8,
      reviewCount: 16,
      matchScore: 72,
      status: "offline",
    },
  ]

  const expertiseOptions = [
    "all",
    "Artificial Intelligence",
    "Machine Learning",
    "Python",
    "React",
    "Node.js",
    "JavaScript",
    "Data Science",
    "UI Design",
    "UX Research",
    "DevOps",
    "Mobile Development",
  ]

  // Filter mentors based on search query and expertise filter
  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch =
      searchQuery === "" ||
      mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.expertise.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesExpertise = expertiseFilter === "all" || mentor.expertise.some((skill) => skill === expertiseFilter)

    return matchesSearch && matchesExpertise
  })

  // Sort mentors based on active tab
  const sortedMentors = [...filteredMentors].sort((a, b) => {
    if (activeTab === "recommended") {
      return b.matchScore - a.matchScore
    } else if (activeTab === "rating") {
      return b.rating - a.rating
    } else {
      return b.reviewCount - a.reviewCount
    }
  })

  return (
    <DashboardLayout userRole="mentee">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discover Mentors</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Find the perfect mentor to guide you on your learning journey
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                placeholder="Search by name, role, or expertise..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full md:w-64">
            <Select value={expertiseFilter} onValueChange={setExpertiseFilter}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by expertise" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {expertiseOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option === "all" ? "All Expertise" : option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
            <TabsTrigger value="rating">Highest Rated</TabsTrigger>
            <TabsTrigger value="popular">Most Popular</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {sortedMentors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedMentors.map((mentor) => (
                  <Card key={mentor.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <Avatar className="h-12 w-12 mr-3">
                            <AvatarImage src={mentor.avatar || "/placeholder.svg"} alt={mentor.name} />
                            <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{mentor.name}</CardTitle>
                            <CardDescription>
                              {mentor.role} at {mentor.company}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className="bg-purple-600">{mentor.matchScore}%</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center mb-2">
                        <div className="flex">
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
                          {mentor.rating} ({mentor.reviewCount})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {mentor.expertise.map((skill, index) => (
                          <Badge key={index} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`h-2 w-2 rounded-full mr-1 ${
                            mentor.status === "online" ? "bg-green-500" : "bg-gray-400"
                          }`}
                        ></span>
                        <span className="text-xs capitalize">{mentor.status}</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                        <Link href={`/mentors/${mentor.id}`}>View Profile</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No mentors found matching your criteria</p>
                <Button
                  variant="link"
                  className="text-purple-600 dark:text-purple-400 mt-2"
                  onClick={() => {
                    setSearchQuery("")
                    setExpertiseFilter("all")
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
