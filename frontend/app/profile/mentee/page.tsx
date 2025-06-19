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

interface MenteeProfile {
  careerGoals: string[]
  skillLevel: string
  learningStyle: string
  interests: string[]
  availability: { [day: string]: string[] }
  languages: string[]
}

interface UserData {
  name: string
  email: string
}

export default function MenteeProfilePage() {
  const [profile, setProfile] = useState<MenteeProfile | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isEditing, setIsEditing] = useState({
    careerGoals: false,
    skillLevel: false,
    learningStyle: false,
    interests: false,
    availability: false,
    languages: false,
  })
  const [editForm, setEditForm] = useState({
    careerGoals: [] as string[],
    newCareerGoal: "",
    skillLevel: "",
    learningStyle: "",
    newInterest: "",
    interests: [] as string[],
    availability: {} as { [day: string]: string[] },
    languageInput: "",
    languages: [] as string[],
  })

  useEffect(() => {
    const storedProfile = localStorage.getItem("menteeProfile")
    if (storedProfile) {
      const parsedProfile = JSON.parse(storedProfile)
      // Handle backward compatibility: convert careerGoal/otherCareerGoal to careerGoals
      const careerGoals = parsedProfile.careerGoals || (
        parsedProfile.careerGoal
          ? [parsedProfile.careerGoal === "other" ? parsedProfile.otherCareerGoal || "other" : parsedProfile.careerGoal]
          : []
      )
      const updatedProfile = { ...parsedProfile, careerGoals }
      setProfile(updatedProfile)
      setEditForm({
        careerGoals,
        newCareerGoal: "",
        skillLevel: parsedProfile.skillLevel || "",
        learningStyle: parsedProfile.learningStyle || "",
        newInterest: "",
        interests: parsedProfile.interests || [],
        availability: parsedProfile.availability || {},
        languageInput: "",
        languages: parsedProfile.languages || [],
      })
    } else {
      const mockProfile = {
        careerGoals: ["frontend"],
        skillLevel: "beginner",
        learningStyle: "practical",
        interests: ["Web Development", "JavaScript", "React"],
        availability: { "Monday": ["evening"], "Saturday": ["morning"] },
        languages: ["English", "Hindi"],
      }
      setProfile(mockProfile)
      setEditForm({
        ...mockProfile,
        newCareerGoal: "",
        newInterest: "", // Added to fix the error
        languageInput: "",
      })
    }

    const storedUserData = localStorage.getItem("userData")
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData))
    } else {
      setUserData({ name: "User", email: "user@example.com" })
    }
  }, [])

  const toggleEdit = (field: keyof typeof isEditing) => {
    setIsEditing((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const updateEditForm = (field: string, value: any) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  const saveField = (field: keyof typeof isEditing) => {
    const newProfile = { ...profile, [field]: editForm[field] } as MenteeProfile
    setProfile(newProfile)
    localStorage.setItem("menteeProfile", JSON.stringify(newProfile))
    toggleEdit(field)
  }

  const addCareerGoal = () => {
    if (editForm.newCareerGoal.trim() && !editForm.careerGoals.includes(editForm.newCareerGoal.trim())) {
      const newCareerGoals = [...editForm.careerGoals, editForm.newCareerGoal.trim()]
      setEditForm((prev) => ({ ...prev, careerGoals: newCareerGoals, newCareerGoal: "" }))
    }
  }

  const removeCareerGoal = (goal: string) => {
    setEditForm((prev) => ({
      ...prev,
      careerGoals: prev.careerGoals.filter((g) => g !== goal),
    }))
  }

  const addInterest = () => {
    if (editForm.newInterest.trim() && !editForm.interests.includes(editForm.newInterest.trim())) {
      const newInterests = [...editForm.interests, editForm.newInterest.trim()]
      setEditForm((prev) => ({ ...prev, interests: newInterests, newInterest: "" }))
    }
  }

  const removeInterest = (interest: string) => {
    setEditForm((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interest),
    }))
  }

  const toggleAvailability = (day: string, time: string) => {
    setEditForm((prev) => {
      const dayAvailability = [...(prev.availability[day] || [])]
      if (dayAvailability.includes(time)) {
        return {
          ...prev,
          availability: {
            ...prev.availability,
            [day]: dayAvailability.filter((t) => t !== time),
          },
        }
      } else {
        return {
          ...prev,
          availability: {
            ...prev.availability,
            [day]: [...dayAvailability, time],
          },
        }
      }
    })
  }

  const saveAvailability = () => {
    const newProfile = { ...profile, availability: editForm.availability } as MenteeProfile
    setProfile(newProfile)
    localStorage.setItem("menteeProfile", JSON.stringify(newProfile))
    toggleEdit("availability")
  }

  const saveLanguages = () => {
    const newLanguages = editForm.languageInput
      .split(",")
      .map((lang) => lang.trim())
      .filter((lang) => lang && !editForm.languages.includes(lang))
    const updatedLanguages = [...editForm.languages, ...newLanguages]
    const newProfile = { ...profile, languages: updatedLanguages } as MenteeProfile
    setProfile(newProfile)
    localStorage.setItem("menteeProfile", JSON.stringify(newProfile))
    setEditForm((prev) => ({ ...prev, languageInput: "", languages: updatedLanguages }))
    toggleEdit("languages")
  }

  const formatCareerGoals = (goals: string[]) => {
    const goalMap: { [key: string]: string } = {
      frontend: "Frontend Developer",
      backend: "Backend Developer",
      fullstack: "Full Stack Developer",
      data: "Data Scientist",
      ai: "AI/ML Engineer",
      devops: "DevOps Engineer",
      mobile: "Mobile Developer",
      cloud: "Cloud Architect",
    }
    return goals.map((goal) => goalMap[goal] || goal)
  }

  const formatSkillLevel = (level: string) => {
    const levelMap: { [key: string]: string } = {
      beginner: "Beginner - Just starting out",
      intermediate: "Intermediate - Some experience",
      advanced: "Advanced - Experienced but looking to grow",
      expert: "Expert - Looking for specialized guidance",
    }
    return levelMap[level] || level
  }

  const formatLearningStyle = (style: string) => {
    const levelMap: { [key: string]: string } = {
      visual: "Visual - Diagrams, videos, demonstrations",
      reading: "Reading - Documentation and tutorials",
      practical: "Practical - Building projects",
      social: "Social - Discussion and collaboration",
    }
    return levelMap[style] || style
  }

  const formatAvailability = (availability: { [day: string]: string[] }) => {
    const entries = Object.entries(availability).flatMap(([day, times]) =>
      times.map((time) => `${day} ${time.charAt(0).toUpperCase() + time.slice(1)}`)
    )
    return entries.length > 0 ? entries : ["No availability selected"]
  }

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const times = ["morning", "afternoon", "evening"]

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
            {/* Career Goals */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Career Goals</Label>
                {isEditing.careerGoals ? (
                  <div className="space-y-2 mt-2">
                    <div className="flex gap-2">
                      <Select
                        value={editForm.newCareerGoal}
                        onValueChange={(value) => updateEditForm("newCareerGoal", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a career goal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="frontend">Frontend Developer</SelectItem>
                          <SelectItem value="backend">Backend Developer</SelectItem>
                          <SelectItem value="fullstack">Full Stack Developer</SelectItem>
                          <SelectItem value="data">Data Scientist</SelectItem>
                          <SelectItem value="ai">AI/ML Engineer</SelectItem>
                          <SelectItem value="devops">DevOps Engineer</SelectItem>
                          <SelectItem value="mobile">Mobile Developer</SelectItem>
                          <SelectItem value="cloud">Cloud Architect</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button type="button" onClick={addCareerGoal} variant="secondary" size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => saveField("careerGoals")} size="sm">
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editForm.careerGoals.map((goal) => (
                        <div
                          key={goal}
                          className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full flex items-center gap-1"
                        >
                          {formatCareerGoals([goal])[0]}
                          <button
                            type="button"
                            onClick={() => removeCareerGoal(goal)}
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
                    {profile.careerGoals.length > 0 ? (
                      formatCareerGoals(profile.careerGoals).map((goal) => (
                        <Badge
                          key={goal}
                          variant="secondary"
                          className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
                        >
                          {goal}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No career goals selected</p>
                    )}
                  </div>
                )}
              </div>
              {!isEditing.careerGoals && (
                <Button variant="ghost" size="sm" onClick={() => toggleEdit("careerGoals")}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Skill Level */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Skill Level</Label>
                {isEditing.skillLevel ? (
                  <div className="flex gap-2 mt-2">
                    <Select
                      value={editForm.skillLevel}
                      onValueChange={(value) => updateEditForm("skillLevel", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your skill level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={() => saveField("skillLevel")} size="sm">
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-lg text-gray-900 dark:text-gray-100">{formatSkillLevel(profile.skillLevel)}</p>
                )}
              </div>
              {!isEditing.skillLevel && (
                <Button variant="ghost" size="sm" onClick={() => toggleEdit("skillLevel")}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Learning Style */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Learning Style</Label>
                {isEditing.learningStyle ? (
                  <div className="flex gap-2 mt-2">
                    <Select
                      value={editForm.learningStyle}
                      onValueChange={(value) => updateEditForm("learningStyle", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your learning style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visual">Visual (Diagrams, Videos)</SelectItem>
                        <SelectItem value="reading">Reading (Documentation, Tutorials)</SelectItem>
                        <SelectItem value="practical">Practical (Building Projects)</SelectItem>
                        <SelectItem value="social">Social (Discussion, Collaboration)</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={() => saveField("learningStyle")} size="sm">
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-lg text-gray-900 dark:text-gray-100">{formatLearningStyle(profile.learningStyle)}</p>
                )}
              </div>
              {!isEditing.learningStyle && (
                <Button variant="ghost" size="sm" onClick={() => toggleEdit("learningStyle")}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Interests */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Interests</Label>
                {isEditing.interests ? (
                  <div className="space-y-2 mt-2">
                    <div className="flex gap-2">
                      <Input
                        value={editForm.newInterest}
                        onChange={(e) => updateEditForm("newInterest", e.target.value)}
                        placeholder="e.g. Web Development, UI/UX"
                        onKeyPress={(e) => e.key === "Enter" && addInterest()}
                      />
                      <Button type="button" onClick={addInterest} variant="secondary" size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => saveField("interests")} size="sm">
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editForm.interests.map((interest) => (
                        <div
                          key={interest}
                          className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full flex items-center gap-1"
                        >
                          {interest}
                          <button
                            type="button"
                            onClick={() => removeInterest(interest)}
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
                    {profile.interests.length > 0 ? (
                      profile.interests.map((interest) => (
                        <Badge
                          key={interest}
                          variant="secondary"
                          className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
                        >
                          {interest}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No interests selected</p>
                    )}
                  </div>
                )}
              </div>
              {!isEditing.interests && (
                <Button variant="ghost" size="sm" onClick={() => toggleEdit("interests")}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Availability */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Availability</Label>
                {isEditing.availability ? (
                  <div className="space-y-4 mt-2">
                    {days.map((day) => (
                      <div key={day} className="flex items-center space-x-4">
                        <Label className="w-24">{day}</Label>
                        <div className="flex space-x-2">
                          {times.map((time) => (
                            <div key={time} className="flex items-center space-x-1">
                              <Checkbox
                                id={`${day}-${time}`}
                                checked={(editForm.availability[day] || []).includes(time)}
                                onCheckedChange={() => toggleAvailability(day, time)}
                              />
                              <Label htmlFor={`${day}-${time}`}>
                                {time.charAt(0).toUpperCase() + time.slice(1)}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <Button onClick={saveAvailability} size="sm">
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
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
                )}
              </div>
              {!isEditing.availability && (
                <Button variant="ghost" size="sm" onClick={() => toggleEdit("availability")}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Languages */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Preferred Learning Languages</Label>
                {isEditing.languages ? (
                  <div className="flex gap-2 mt-2">
                    <Textarea
                      value={editForm.languageInput}
                      onChange={(e) => updateEditForm("languageInput", e.target.value)}
                      placeholder="e.g., English, Hindi"
                      rows={3}
                    />
                    <Button onClick={saveLanguages} size="sm">
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
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
                )}
              </div>
              {!isEditing.languages && (
                <Button variant="ghost" size="sm" onClick={() => toggleEdit("languages")}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}