"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { User, Briefcase, Building, FileText, Code, Calendar, Edit, Save, X, ArrowLeft , Plus} from "lucide-react"
import Link from "next/link"

interface MentorProfile {
  yearsExperience: string
  currentRole: string
  company: string
  bio: string
  skills: string[]
  availability: { [day: string]: string[] }
  languages: string[]
}

interface UserData {
  name: string
  email: string
}

export default function MentorProfilePage() {
  const [profile, setProfile] = useState<MentorProfile | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isEditing, setIsEditing] = useState({
    yearsExperience: false,
    currentRole: false,
    company: false,
    bio: false,
    skills: false,
    availability: false,
    languages: false,
  })
  const [editForm, setEditForm] = useState({
    yearsExperience: "",
    currentRole: "",
    company: "",
    bio: "",
    newSkill: "",
    skills: [] as string[],
    availability: {} as { [day: string]: string[] },
    languageInput: "",
    languages: [] as string[],
  })

  useEffect(() => {
    const storedProfile = localStorage.getItem("mentorProfile")
    if (storedProfile) {
      const parsedProfile = JSON.parse(storedProfile)
      setProfile(parsedProfile)
      setEditForm({
        yearsExperience: parsedProfile.yearsExperience,
        currentRole: parsedProfile.currentRole,
        company: parsedProfile.company,
        bio: parsedProfile.bio,
        newSkill: "",
        skills: parsedProfile.skills,
        availability: parsedProfile.availability,
        languageInput: "",
        languages: parsedProfile.languages,
      })
    } else {
      const mockProfile = {
        yearsExperience: "7-10",
        currentRole: "Senior Software Engineer",
        company: "TechCorp",
        bio: "Experienced software engineer with a passion for mentoring.",
        skills: ["React", "Node.js", "System Design"],
        availability: { "Monday": ["evening"], "Saturday": ["morning"] },
        languages: ["English", "Hindi"],
      }
      setProfile(mockProfile)
      setEditForm({ ...mockProfile, newSkill: "", languageInput: "" })
    }

    const storedUserData = localStorage.getItem('userData')
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

  const saveField = (field: keyof MentorProfile) => {
    const newProfile = { ...profile, [field]: editForm[field] } as MentorProfile
    setProfile(newProfile)
    localStorage.setItem("mentorProfile", JSON.stringify(newProfile))
    toggleEdit(field)
  }

  const addSkill = () => {
    if (editForm.newSkill.trim() && !editForm.skills.includes(editForm.newSkill.trim())) {
      const newSkills = [...editForm.skills, editForm.newSkill.trim()]
      setEditForm((prev) => ({ ...prev, skills: newSkills, newSkill: "" }))
    }
  }

  const removeSkill = (skill: string) => {
    setEditForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
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
    const newProfile = { ...profile, availability: editForm.availability } as MentorProfile
    setProfile(newProfile)
    localStorage.setItem("mentorProfile", JSON.stringify(newProfile))
    toggleEdit("availability")
  }

  const saveLanguages = () => {
    const newLanguages = editForm.languageInput
      .split(",")
      .map((lang) => lang.trim())
      .filter((lang) => lang && !editForm.languages.includes(lang))
    const updatedLanguages = [...editForm.languages, ...newLanguages]
    const newProfile = { ...profile, languages: updatedLanguages } as MentorProfile
    setProfile(newProfile)
    localStorage.setItem("mentorProfile", JSON.stringify(newProfile))
    setEditForm((prev) => ({ ...prev, languageInput: "", languages: updatedLanguages }))
    toggleEdit("languages")
  }

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
            href="/dashboard/mentor"
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
            {/* Years of Experience */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Years of Experience</Label>
                {isEditing.yearsExperience ? (
                  <div className="flex gap-2 mt-2">
                    <Select
                      value={editForm.yearsExperience}
                      onValueChange={(value) => updateEditForm("yearsExperience", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select years" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="<1">less than 1 year</SelectItem>
                        <SelectItem value="1-3">1-3 years</SelectItem>
                        <SelectItem value="4-6">4-6 years</SelectItem>
                        <SelectItem value="7-10">7-10 years</SelectItem>
                        <SelectItem value="10+">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={() => saveField("yearsExperience")} size="sm">
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-lg text-gray-900 dark:text-gray-100">{formatYearsExperience(profile.yearsExperience)}</p>
                )}
              </div>
              {!isEditing.yearsExperience && (
                <Button variant="ghost" size="sm" onClick={() => toggleEdit("yearsExperience")}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Current Role */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Role</Label>
                {isEditing.currentRole ? (
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={editForm.currentRole}
                      onChange={(e) => updateEditForm("currentRole", e.target.value)}
                      placeholder="e.g. Senior Software Engineer"
                    />
                    <Button onClick={() => saveField("currentRole")} size="sm">
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-lg text-gray-900 dark:text-gray-100">{profile.currentRole}</p>
                )}
              </div>
              {!isEditing.currentRole && (
                <Button variant="ghost" size="sm" onClick={() => toggleEdit("currentRole")}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Company */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company</Label>
                {isEditing.company ? (
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={editForm.company}
                      onChange={(e) => updateEditForm("company", e.target.value)}
                      placeholder="e.g. Google, Microsoft"
                    />
                    <Button onClick={() => saveField("company")} size="sm">
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-lg text-gray-900 dark:text-gray-100">{profile.company}</p>
                )}
              </div>
              {!isEditing.company && (
                <Button variant="ghost" size="sm" onClick={() => toggleEdit("company")}>
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
                    <Button onClick={() => saveField("bio")} size="sm">
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-lg text-gray-900 dark:text-gray-100">{profile.bio}</p>
                )}
              </div>
              {!isEditing.bio && (
                <Button variant="ghost" size="sm" onClick={() => toggleEdit("bio")}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Skills */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Skills</Label>
                {isEditing.skills ? (
                  <div className="space-y-2 mt-2">
                    <div className="flex gap-2">
                      <Input
                        value={editForm.newSkill}
                        onChange={(e) => updateEditForm("newSkill", e.target.value)}
                        placeholder="e.g. React, Python"
                        onKeyPress={(e) => e.key === "Enter" && addSkill()}
                      />
                      <Button type="button" onClick={addSkill} variant="secondary" size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => saveField("skills")} size="sm">
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editForm.skills.map((skill) => (
                        <div
                          key={skill}
                          className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full flex items-center gap-1"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
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
                )}
              </div>
              {!isEditing.skills && (
                <Button variant="ghost" size="sm" onClick={() => toggleEdit("skills")}>
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
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Teaching Languages</Label>
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