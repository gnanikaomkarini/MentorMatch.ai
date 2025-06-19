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
  availability: { [day: string]: string[] }
  languages: string[]
}

// Define the shape of user data
interface UserData {
  name: string
  email: string
}

export default function MentorProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<MentorProfile | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)

  // Fetch profile and user data
  useEffect(() => {
    // Retrieve profile from localStorage
    const storedProfile = localStorage.getItem("mentorProfile")
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile))
    } else {
      // Mock data for development
      setProfile({
        yearsExperience: "7-10",
        currentRole: "Senior Software Engineer",
        company: "TechCorp",
        bio: "Experienced software engineer with a passion for mentoring aspiring developers in React, Node.js, and system design.",
        skills: ["React", "Node.js", "System Design", "JavaScript", "AWS"],
        availability: { "Monday": ["evening"], "Saturday": ["morning"] },
        languages: ["English", "Hindi"],
      })
    }

    // Retrieve user data from localStorage
    const storedUserData = localStorage.getItem('userData')
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData))
    } else {
      setUserData({ name: 'User', email: 'user@example.com' })
    }
  }, [])

  // Handle navigation for editing profile
  const handleEditProfile = () => {
    router.push("/onboarding/mentor")
  }

  // Format years of experience for display
  const formatYearsExperience = (years: string) => {
    const yearsMap: { [key: string]: string } = {
      "<1": "<1 year",
      "1-3": "1-3 years",
      "4-6": "4-6 years",
      "7-10": "7-10 years",
      "10+": "10+ years",
    }
    return yearsMap[years] || years
  }

  // Format availability for display
  const formatAvailability = (availability: { [day: string]: string[] }) => {
    const entries = Object.entries(availability).flatMap(([day, times]) =>
      times.map((time) => `${day} ${time.charAt(0).toUpperCase() + time.slice(1)}`)
    )
    return entries.length > 0 ? entries : ["No availability selected"]
  }

  if (!profile || !userData) {
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
              <AvatarFallback className="bg-gray-200 dark:bg-gray-700">
                <User className="h-12 w-12 text-gray-600 dark:text-gray-300" />
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <CardTitle className="text-2xl font-bold">{userData.name}</CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">{userData.email}</CardDescription>
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
                {formatAvailability(profile.availability).map((slot) => (
                  <Badge
                    key={slot}
                    variant="outline"
                    className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                  >
                    {slot}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Teaching Languages</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.languages.length > 0 ? (
                  profile.languages.map((language) => (
                    <Badge
                      key={language}
                      variant="secondary"
                      className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                    >
                      {language}
                    </Badge>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No languages selected</p>
                )}
              </div>
            </div>

            {/* Edit Profile Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleEditProfile}
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