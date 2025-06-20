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
import Footer from "@/components/footer"
import { useRouter } from "next/navigation"

interface UserData {
  name: string;
  email: string;
}

export default function MenteeOnboarding() {
  const [step, setStep] = useState(1)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [formData, setFormData] = useState({
    careerGoal: "",
    otherCareerGoal: "",
    skillLevel: "",
    learningStyle: "",
    interests: [] as string[],
    availability: {} as { [day: string]: string[] },
    newInterest: "",
    languages: [] as string[],
    languageInput: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const totalSteps = 5
  const progress = (step / totalSteps) * 100

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData')
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData))
    }
  }, [])

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      setLoading(true)
      setError("")
      setSuccess("")
      // Prepare languages
      const finalLanguages = formData.languageInput
        .split(",")
        .map((lang) => lang.trim())
        .filter((lang) => lang && !formData.languages.includes(lang))
      // Prepare availability as array of "Day Time"
      const availabilityArr = Object.entries(formData.availability).flatMap(([day, times]) =>
        times.map((time) => `${day} ${time.charAt(0).toUpperCase() + time.slice(1)}`)
      )
      // Prepare payload
      const payload = {
        profile: {
          goals: [formData.careerGoal === "other" ? formData.otherCareerGoal : formData.careerGoal].filter(Boolean),
          learning_style: formData.learningStyle,
          availability: availabilityArr,
          languages: [...formData.languages, ...finalLanguages],
          bio: "", // Add if you have a field for this
          profile_picture: "", // Add if you have a field for this
          experience_level: formData.skillLevel,
        },
      }
      try {
        const res = await fetch("http://localhost:5000/api/auth/profile/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.message || "Failed to update profile")
          setLoading(false)
          return
        }
        setSuccess("Profile completed successfully!")
        // Optionally store in localStorage
        localStorage.setItem('menteeProfile', JSON.stringify(payload.profile))
        // Instead of redirecting to dashboard, go to match page
        setTimeout(() => {
          router.push("/match")
        }, 1200)
      } catch (err) {
        setError("Failed to update profile")
      } finally {
        setLoading(false)
      }
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

  const addInterest = () => {
    if (formData.newInterest.trim() !== "" && !formData.interests.includes(formData.newInterest.trim())) {
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, prev.newInterest.trim()],
        newInterest: "",
      }))
    }
  }

  const removeInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interest),
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
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {userData ? `Welcome, ${userData.name}` : "Set Up Your Mentee Profile"}
            </CardTitle>
            <CardDescription>
              {userData ? `Email: ${userData.email}` : "Tell us about your goals to find the perfect mentor"}
            </CardDescription>
            <Progress value={progress} className="mt-2" />
          </CardHeader>

          <CardContent>
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">What are your career goals?</h3>
                <div className="space-y-2">
                  <Label htmlFor="careerGoal">Career Goal</Label>
                  <Select
                    value={formData.careerGoal}
                    onValueChange={(value) => updateFormData("careerGoal", value)}
                  >
                    <SelectTrigger id="careerGoal">
                      <SelectValue placeholder="Select your career goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="frontend">Frontend Developer</SelectItem>
                      <SelectItem value="backend">Backend Developer</SelectItem>
                      <SelectItem value="fullstack">Full Stack Developer</SelectItem>
                      <SelectItem value="data">Data Scientist</SelectItem>
                      <SelectItem value="ai">AI/ML Engineer</SelectItem>
                      <SelectItem value="devops">DevOps Engineer</SelectItem>
                      <SelectItem value="mobile">Mobile Developer</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.careerGoal === "other" && (
                  <div className="space-y-2">
                    <Label htmlFor="otherCareerGoal">Specify Career Goal</Label>
                    <Input
                      id="otherCareerGoal"
                      value={formData.otherCareerGoal}
                      onChange={(e) => updateFormData("otherCareerGoal", e.target.value)}
                      placeholder="e.g. Cloud Architect"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="skillLevel">Current Skill Level</Label>
                  <Select
                    value={formData.skillLevel}
                    onValueChange={(value) => updateFormData("skillLevel", value)}
                  >
                    <SelectTrigger id="skillLevel">
                      <SelectValue placeholder="Select your skill level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">What are your interests?</h3>
                <div className="flex gap-2">
                  <Input
                    value={formData.newInterest}
                    onChange={(e) => updateFormData("newInterest", e.target.value)}
                    placeholder="e.g. Web Development, Machine Learning, UI/UX"
                    onKeyPress={(e) => e.key === "Enter" && addInterest()}
                  />
                  <Button type="button" onClick={addInterest} variant="secondary">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {formData.interests.map((interest) => (
                    <div
                      key={interest}
                      className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full flex items-center gap-1"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => removeInterest(interest)}
                        className="text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {formData.interests.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Add your interests</p>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">How do you prefer to learn?</h3>
                <div className="space-y-2">
                  <Label htmlFor="learningStyle">Learning Style</Label>
                  <Select
                    value={formData.learningStyle}
                    onValueChange={(value) => updateFormData("learningStyle", value)}
                  >
                    <SelectTrigger id="learningStyle">
                      <SelectValue placeholder="Select your learning style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visual">Visual (Diagrams, Videos)</SelectItem>
                      <SelectItem value="reading">Reading (Documentation, Tutorials)</SelectItem>
                      <SelectItem value="practical">Practical (Building Projects)</SelectItem>
                      <SelectItem value="social">Social (Discussion, Collaboration)</SelectItem>
                    </SelectContent>
                  </Select>
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
                <h3 className="text-lg font-medium">What languages would you like to learn in?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enter languages you’re comfortable learning in (comma-separated, e.g., English, Hindi)
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