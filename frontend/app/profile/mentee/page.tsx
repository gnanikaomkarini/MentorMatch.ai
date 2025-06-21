"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { User, Edit, ArrowLeft, Save, X, Plus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface MenteeProfile {
  goals: string[]
  experience_level: string
  learning_style: string
  interests?: string[]
  availability: string[]
  languages: string[]
  bio: string
  profile_picture: string
}

interface UserData {
  name: string
  email: string
  id: string
  username: string
  created_at: string
  mentors: string[]
  role: string
  profile: MenteeProfile
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const times = ["morning", "afternoon", "evening"]

// Helper for availability as an object { [day]: string[] }
function getAvailabilityObj(arr: string[]) {
  const obj: { [day: string]: string[] } = {}
  arr.forEach((slot) => {
    const [day, time] = slot.split(" ")
    if (day && time) {
      if (!obj[day]) obj[day] = []
      obj[day].push(time.toLowerCase())
    }
  })
  return obj
}

function getAvailabilityArr(obj: { [day: string]: string[] }) {
  return Object.entries(obj).flatMap(([day, times]) =>
    times.map((time) => `${day} ${time.charAt(0).toUpperCase() + time.slice(1)}`)
  )
}

export default function MenteeProfilePage() {
  const [profile, setProfile] = useState<MenteeProfile | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isEditing, setIsEditing] = useState({
    goals: false,
    experience_level: false,
    learning_style: false,
    availability: false,
    languages: false,
    bio: false,
    profile_picture: false,
  })
  const [editForm, setEditForm] = useState({
    goals: [] as string[],
    newGoal: "",
    experience_level: "",
    learning_style: "",
    availability: [] as string[], // e.g. ["Monday Morning", "Tuesday Evening"]
    languages: [] as string[],
    languageInput: "",
    bio: "",
    profile_picture: "",
  })
  const [editTouched, setEditTouched] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Fetch profile from backend on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      setError("")
      try {
        const res = await fetch("http://localhost:5000/api/auth/profile", {
          method: "GET",
          credentials: "include",
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.message || "Failed to fetch profile")
          setLoading(false)
          return
        }
        setUserData({
          name: data.user.name,
          email: data.user.email,
          id: data.user.id,
          username: data.user.username,
          created_at: data.user.created_at,
          mentors: data.user.mentors,
          role: data.user.role,
          profile: data.user.profile,
        })
        setProfile(data.user.profile)
        setEditForm({
          goals: data.user.profile.goals || [],
          newGoal: "",
          experience_level: data.user.profile.experience_level || "",
          learning_style: data.user.profile.learning_style || "",
          availability: data.user.profile.availability || [],
          languages: data.user.profile.languages || [],
          languageInput: "",
          bio: data.user.profile.bio || "",
          profile_picture: data.user.profile.profile_picture || "",
        })
      } catch (err) {
        setError("Failed to fetch profile")
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  // Toggle edit and set editTouched
  const toggleEdit = (field: keyof typeof isEditing) => {
    setIsEditing((prev) => ({ ...prev, [field]: !prev[field] }))
    setEditTouched(true)
  }

  const updateEditForm = (field: string, value: any) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  // Add/Remove goals
  const addGoal = () => {
    if (editForm.newGoal.trim() && !editForm.goals.includes(editForm.newGoal.trim())) {
      setEditForm((prev) => ({
        ...prev,
        goals: [...prev.goals, prev.newGoal.trim()],
        newGoal: "",
      }))
      setEditTouched(true)
    }
  }
  const removeGoal = (goal: string) => {
    setEditForm((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g !== goal),
    }))
    setEditTouched(true)
  }

  // Add/Remove languages
  const addLanguages = () => {
    const newLanguages = editForm.languageInput
      .split(",")
      .map((lang) => lang.trim())
      .filter((lang) => lang && !editForm.languages.includes(lang))
    setEditForm((prev) => ({
      ...prev,
      languages: [...prev.languages, ...newLanguages],
      languageInput: "",
    }))
    setEditTouched(true)
  }
  const removeLanguage = (lang: string) => {
    setEditForm((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l !== lang),
    }))
    setEditTouched(true)
  }

  // Add/Remove availability
  const availabilityObj = getAvailabilityObj(editForm.availability)

  const toggleAvailabilityCheckbox = (day: string, time: string) => {
    const slot = `${day} ${time.charAt(0).toUpperCase() + time.slice(1)}`
    setEditForm((prev) => {
      const exists = prev.availability.includes(slot)
      let newArr
      if (exists) {
        newArr = prev.availability.filter((s) => s !== slot)
      } else {
        newArr = [...prev.availability, slot]
      }
      return { ...prev, availability: newArr }
    })
    setEditTouched(true)
  }

  // Helper to check if any field has changed
  const isProfileModified = (() => {
    if (!profile) return false
    return (
      JSON.stringify(profile.goals) !== JSON.stringify(editForm.goals) ||
      profile.experience_level !== editForm.experience_level ||
      profile.learning_style !== editForm.learning_style ||
      JSON.stringify(profile.availability) !== JSON.stringify(editForm.availability) ||
      JSON.stringify(profile.languages) !== JSON.stringify(editForm.languages) ||
      profile.bio !== editForm.bio ||
      profile.profile_picture !== editForm.profile_picture
    )
  })()

  // Helper to get the current displayed profile (live preview of edits)
  const displayedProfile: MenteeProfile | null = profile
    ? {
        ...profile,
        goals: isEditing.goals || editTouched ? editForm.goals : profile.goals,
        experience_level: isEditing.experience_level || editTouched ? editForm.experience_level : profile.experience_level,
        learning_style: isEditing.learning_style || editTouched ? editForm.learning_style : profile.learning_style,
        availability: isEditing.availability || editTouched ? editForm.availability : profile.availability,
        languages: isEditing.languages || editTouched ? editForm.languages : profile.languages,
        bio: isEditing.bio || editTouched ? editForm.bio : profile.bio,
        profile_picture: isEditing.profile_picture || editTouched ? editForm.profile_picture : profile.profile_picture,
      }
    : null

  // Save all changes at once
  const saveAllChanges = async () => {
    setError("")
    setSuccess("")
    try {
      const res = await fetch("http://localhost:5000/api/auth/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          profile: {
            goals: editForm.goals,
            learning_style: editForm.learning_style,
            availability: editForm.availability,
            languages: editForm.languages,
            bio: editForm.bio,
            profile_picture: editForm.profile_picture,
            experience_level: editForm.experience_level,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || "Failed to update profile")
        return
      }
      setProfile(data.user.profile)
      setUserData((prev) => (prev ? { ...prev, profile: data.user.profile } : null))
      setIsEditing({
        goals: false,
        experience_level: false,
        learning_style: false,
        availability: false,
        languages: false,
        bio: false,
        profile_picture: false,
      })
      setEditTouched(false)
      setSuccess("Profile updated successfully!")
    } catch (err) {
      setError("Failed to update profile")
    }
  }

  if (loading) {
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/dashboard/mentee"
            className="flex items-center text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>
        <Card className="w-full">
          <CardHeader className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="text-center sm:text-left">
              <CardTitle className="text-2xl font-bold">{userData?.name}</CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">{userData?.email}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {success && (
              <Alert variant="default" className="bg-green-100 border-green-400 text-green-800">
                {success}
              </Alert>
            )}
            {/* Goals */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Goals</Label>
                {isEditing.goals ? (
                  <div className="space-y-2 mt-2">
                    <div className="flex gap-2">
                      <Input
                        value={editForm.newGoal}
                        onChange={(e) => updateEditForm("newGoal", e.target.value)}
                        placeholder="e.g. Become a data scientist"
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addGoal())}
                      />
                      <Button type="button" onClick={addGoal} variant="secondary" size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => setIsEditing((prev) => ({ ...prev, goals: false }))} size="sm">
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editForm.goals.map((goal) => (
                        <div
                          key={goal}
                          className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full flex items-center gap-1"
                        >
                          {goal}
                          <button
                            type="button"
                            onClick={() => removeGoal(goal)}
                            className="text-purple-600 dark:text-purple-300 hover:text-purple-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {displayedProfile?.goals?.length > 0 ? (
                      displayedProfile.goals.map((goal) => (
                        <Badge
                          key={goal}
                          variant="secondary"
                          className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
                        >
                          {goal}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No goals selected</p>
                    )}
                  </div>
                )}
              </div>
              {!isEditing.goals && (
                <Button variant="ghost" size="sm" onClick={() => toggleEdit("goals")}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
            {/* Experience Level */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Experience Level</Label>
                {isEditing.experience_level ? (
                  <div className="flex gap-2 mt-2">
                    <Select
                      value={editForm.experience_level}
                      onValueChange={(value) => updateEditForm("experience_level", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={() => setIsEditing((prev) => ({ ...prev, experience_level: false }))} size="sm">
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-lg text-gray-900 dark:text-gray-100">{displayedProfile?.experience_level}</p>
                )}
              </div>
              {!isEditing.experience_level && (
                <Button variant="ghost" size="sm" onClick={() => toggleEdit("experience_level")}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
            {/* Learning Style */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Learning Style</Label>
                {isEditing.learning_style ? (
                  <div className="flex gap-2 mt-2">
                    <Select
                      value={editForm.learning_style}
                      onValueChange={(value) => updateEditForm("learning_style", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your learning style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Visual">Visual (Diagrams, Videos)</SelectItem>
                        <SelectItem value="Reading">Reading (Documentation, Tutorials)</SelectItem>
                        <SelectItem value="Hands-on projects">Practical (Building Projects)</SelectItem>
                        <SelectItem value="Social">Social (Discussion, Collaboration)</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={() => setIsEditing((prev) => ({ ...prev, learning_style: false }))} size="sm">
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-lg text-gray-900 dark:text-gray-100">{displayedProfile?.learning_style}</p>
                )}
              </div>
              {!isEditing.learning_style && (
                <Button variant="ghost" size="sm" onClick={() => toggleEdit("learning_style")}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
            {/* Availability */}
            <div className="mb-6 flex items-start gap-4">
              <div className="flex-1">
                <Label className="text-lg font-semibold">When are you available for mentoring?</Label>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Select available days and times (Morning: 8 AM–12 PM, Afternoon: 12 PM–5 PM, Evening: 5 PM–10 PM)
                </div>
                {isEditing.availability ? (
                  <div className="space-y-2">
                    {days.map((day) => (
                      <div key={day} className="flex items-center gap-4">
                        <span className="w-24">{day}</span>
                        {times.map((time) => (
                          <label key={time} className="flex items-center gap-1">
                            <Checkbox
                              checked={availabilityObj[day]?.includes(time)}
                              onCheckedChange={() => toggleAvailabilityCheckbox(day, time)}
                            />
                            <span className="capitalize">{time}</span>
                          </label>
                        ))}
                      </div>
                    ))}
                    <Button onClick={() => setIsEditing((prev) => ({ ...prev, availability: false }))} size="sm" className="mt-2">
                      <Save className="h-4 w-4 mr-1" /> Save
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {displayedProfile?.availability?.length > 0 ? (
                      displayedProfile.availability.map((slot) => (
                        <Badge
                          key={slot}
                          variant="outline"
                          className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                        >
                          {slot}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No availability selected</p>
                    )}
                  </div>
                )}
              </div>
              {!isEditing.availability && (
                <div className="flex items-start pt-7">
                  <Button variant="ghost" size="sm" onClick={() => toggleEdit("availability")}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            {/* Languages */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Languages</Label>
                {isEditing.languages ? (
                  <div className="space-y-2 mt-2">
                    <div className="flex gap-2">
                      <Input
                        value={editForm.languageInput}
                        onChange={(e) => updateEditForm("languageInput", e.target.value)}
                        placeholder="e.g., English, Hindi"
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLanguages())}
                      />
                      <Button type="button" onClick={addLanguages} variant="secondary" size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => setIsEditing((prev) => ({ ...prev, languages: false }))} size="sm">
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editForm.languages.map((language) => (
                        <div
                          key={language}
                          className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full flex items-center gap-1"
                        >
                          {language}
                          <button
                            type="button"
                            onClick={() => removeLanguage(language)}
                            className="text-blue-600 dark:text-blue-300 hover:text-blue-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {displayedProfile?.languages?.length > 0 ? (
                      displayedProfile.languages.map((language) => (
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
                )}
              </div>
              {!isEditing.languages && (
                <Button variant="ghost" size="sm" onClick={() => toggleEdit("languages")}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
            {/* Bio */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio</Label>
                {isEditing.bio ? (
                  <div className="flex gap-2 mt-2">
                    <Textarea
                      value={editForm.bio}
                      onChange={(e) => updateEditForm("bio", e.target.value)}
                      placeholder="Share your background..."
                      rows={4}
                    />
                    <Button onClick={() => setIsEditing((prev) => ({ ...prev, bio: false }))} size="sm">
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-lg text-gray-900 dark:text-gray-100">{displayedProfile?.bio}</p>
                )}
              </div>
              {!isEditing.bio && (
                <Button variant="ghost" size="sm" onClick={() => toggleEdit("bio")}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
            {/* Save Changes button */}
            {(isProfileModified || editTouched) && (
              <div className="flex justify-end">
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={saveAllChanges}
                >
                  Save Changes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}