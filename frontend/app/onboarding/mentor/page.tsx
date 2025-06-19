"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Check, Plus, X } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

interface UserData {
  name: string;
  email: string;
}

export default function MentorOnboarding() {
  const [step, setStep] = useState(1)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [formData, setFormData] = useState({
    yearsExperience: "",
    currentRole: "",
    company: "",
    bio: "",
    skills: [] as string[],
    availability: {} as { [day: string]: string[] }, // e.g., { "Monday": ["morning", "evening"], "Tuesday": [] }
    newSkill: "",
    languages: [] as string[],
    languageInput: "",
  })

  const totalSteps = 5 // Increased for languages step
  const progress = (step / totalSteps) * 100

  // Fetch user data
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData')
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData))
    }
  }, [])

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      // Process languages before saving
      const finalLanguages = formData.languageInput
        .split(",")
        .map((lang) => lang.trim())
        .filter((lang) => lang && !formData.languages.includes(lang))
      const finalFormData = {
        ...formData,
        languages: [...formData.languages, ...finalLanguages],
        languageInput: "",
      }
      
      // Save to localStorage
      localStorage.setItem('mentorProfile', JSON.stringify(finalFormData))
      window.location.href = "/dashboard/mentor"
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addSkill = () => {
    if (formData.newSkill.trim() !== "" && !formData.skills.includes(formData.newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, prev.newSkill.trim()],
        newSkill: "",
      }))
    }
  }

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }))
  }

  const toggleAvailability = (day: string, time: string) => {
    setFormData((prev) => {
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

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const times = ["morning", "afternoon", "evening"]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {userData ? `Welcome, ${userData.name}` : "Set Up Your Mentor Profile"}
            </CardTitle>
            <CardDescription>
              {userData ? `Email: ${userData.email}` : "Share your expertise to help us match you with mentees"}
            </CardDescription>
            <Progress value={progress} className="mt-2" />
          </CardHeader>

          <CardContent>
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Tell us about your professional background</h3>

                <div className="space-y-2">
                  <Label htmlFor="yearsExperience">Years of Experience</Label>
                  <Select
                    value={formData.yearsExperience}
                    onValueChange={(value) => updateFormData("yearsExperience", value)}
                  >
                    <SelectTrigger id="yearsExperience">
                      <SelectValue placeholder="Select years of experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="<1"> less than 1 year</SelectItem>
                      <SelectItem value="1-3">1-3 years</SelectItem>
                      <SelectItem value="4-6">4-6 years</SelectItem>
                      <SelectItem value="7-10">7-10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentRole">Current Role</Label>
                  <Input
                    id="currentRole"
                    value={formData.currentRole}
                    onChange={(e) => updateFormData("currentRole", e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company/Organization</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => updateFormData("company", e.target.value)}
                    placeholder="e.g. Google, Microsoft, Freelance"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">What skills can you mentor others in?</h3>

                <div className="flex gap-2">
                  <Input
                    value={formData.newSkill}
                    onChange={(e) => updateFormData("newSkill", e.target.value)}
                    placeholder="e.g. React, Python, System Design"
                    onKeyPress={(e) => e.key === "Enter" && addSkill()}
                  />
                  <Button type="button" onClick={addSkill} variant="secondary">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {formData.skills.map((skill) => (
                    <div
                      key={skill}
                      className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full flex items-center gap-1"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {formData.skills.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Add skills you can mentor others in</p>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Tell us about yourself</h3>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => updateFormData("bio", e.target.value)}
                    placeholder="Share your background, expertise, and mentorship approach..."
                    rows={6}
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">When are you available for mentoring?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Select available days and times (Morning: 8 AM–12 PM, Afternoon: 12 PM–5 PM, Evening: 5 PM–10 PM)
                </p>

                <div className="space-y-4">
                  {days.map((day) => (
                    <div key={day} className="flex items-center space-x-4">
                      <Label className="w-24">{day}</Label>
                      <div className="flex space-x-2">
                        {times.map((time) => (
                          <div key={time} className="flex items-center space-x-1">
                            <Checkbox
                              id={`${day}-${time}`}
                              checked={(formData.availability[day] || []).includes(time)}
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
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">What languages can you teach in?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enter languages you’re comfortable teaching in (comma-separated, e.g., English, Hindi)
                </p>
                <Textarea
                  id="languageInput"
                  value={formData.languageInput}
                  onChange={(e) => updateFormData("languageInput", e.target.value)}
                  placeholder="e.g., English, Hindi, Spanish"
                  rows={3}
                  className="mt-1"
                />
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack} disabled={step === 1}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            <Button onClick={handleNext} className="bg-purple-600 hover:bg-purple-700">
              {step === totalSteps ? (
                <>
                  Complete <Check className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Footer />
    </div>
  )
}