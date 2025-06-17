"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { User, Briefcase, Building, FileText, Code, Calendar, Edit, ArrowLeft } from "lucide-react"

// Define the shape of the onboarding data
interface MentorProfile {
  yearsExperience: string
  currentRole: string
  company: string
  bio: string
  skills: string[]
  availability: string[]
}

export default function MentorProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<MentorProfile | null>(null)
  const [userName, setUserName] = useState<string>("User") // Placeholder for user name
  const [userEmail, setUserEmail] = useState<string>("user@example.com") // Placeholder for user email

  // Fetch profile data (placeholder: localStorage or API)
  useEffect(() => {
    // Example: Retrieve from localStorage (replace with API call in production)
    const storedProfile = localStorage.getItem("mentorProfile")
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile))
    } else {
      // Mock data for development
      setProfile({
        yearsExperience: "7-10",
        currentRole: "Senior Software Engineer",
        company: "TechCorp",
        bio: "Experienced software engineer with a passion for mentoring aspiring developers in React, Node.js, and system design. I enjoy helping mentees achieve their career goals through practical, hands-on guidance.",
        skills: ["React", "Node.js", "System Design", "JavaScript", "AWS"],
        availability: ["Monday evenings", "Wednesday evenings", "Saturday mornings"],
      })
    }
    // Placeholder: Fetch user name and email (e.g., from auth context or API)
    setUserName("Jane Smith") // Replace with actual user data
    setUserEmail("jane.smith@example.com") // Replace with actual user data
  }, [])

  // Handle navigation for editing profile
  const handleNext = () => {
    router.push("/onboarding/mentor") // Redirect to onboarding for editing
  }

  // Format years of experience for display
  const formatYearsExperience = (years: string) => {
    const yearsMap: { [key: string]: string } = {
      "1-3": "1-3 years",
      "4-6": "4-6 years",
      "7-10": "7-10 years",
      "10+": "10+ years",
    }
    return yearsMap[years] || years
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading Profile...</CardTitle>
            <CardDescription>Please wait while we fetch your profile.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Link
            href="/dashboard/mentor"
            className="flex items-center text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        {/* Profile Card */}
        <Card className="w-full">
          <CardHeader className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src="/placeholder.svg" alt={userName} />
              <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <CardTitle className="text-2xl font-bold">{userName}</CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">{userEmail}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Years of Experience */}
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Years of Experience</Label>
              <p className="text-lg text-gray-900 dark:text-gray-100">{formatYearsExperience(profile.yearsExperience)}</p>
            </div>

            {/* Current Role */}
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Role</Label>
              <p className="text-lg text-gray-900 dark:text-gray-100">{profile.currentRole}</p>
            </div>

            {/* Company */}
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company</Label>
              <p className="text-lg text-gray-900 dark:text-gray-100">{profile.company}</p>
            </div>

            {/* Bio */}
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio</Label>
              <p className="text-lg text-gray-900 dark:text-gray-100">{profile.bio}</p>
            </div>

            {/* Skills */}
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Skills</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.skills.length > 0 ? (
                  profile.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
                    >
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No skills selected</p>
                )}
              </div>
            </div>

            {/* Availability */}
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Availability</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.availability.length > 0 ? (
                  profile.availability.map((day) => (
                    <Badge
                      key={day}
                      variant="outline"
                      className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                    >
                      {day}
                    </Badge>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No availability selected</p>
                )}
              </div>
            </div>

            {/* Edit Profile Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleNext}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Edit className="h-5 w-5 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}