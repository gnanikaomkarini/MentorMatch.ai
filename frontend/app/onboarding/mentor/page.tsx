"use client"

import { useState } from "react"
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

export default function MentorOnboarding() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    yearsExperience: "",
    currentRole: "",
    company: "",
    bio: "",
    skills: [] as string[],
    availability: [] as string[],
    newSkill: "",
  })

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      // Submit and redirect to dashboard
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

  const toggleAvailability = (day: string) => {
    setFormData((prev) => {
      const availability = [...prev.availability]
      if (availability.includes(day)) {
        return { ...prev, availability: availability.filter((d) => d !== day) }
      } else {
        return { ...prev, availability: [...availability, day] }
      }
    })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Set Up Your Mentor Profile</CardTitle>
            <CardDescription>
              Share your expertise to help us match you with mentees who can benefit from your knowledge
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
                <p className="text-sm text-gray-500 dark:text-gray-400">Select all that apply</p>

                <div className="space-y-3">
                  {[
                    "Monday evenings",
                    "Tuesday evenings",
                    "Wednesday evenings",
                    "Thursday evenings",
                    "Friday evenings",
                    "Saturday mornings",
                    "Saturday afternoons",
                    "Sunday mornings",
                    "Sunday afternoons",
                  ].map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={day}
                        checked={formData.availability.includes(day)}
                        onCheckedChange={() => toggleAvailability(day)}
                      />
                      <Label htmlFor={day}>{day}</Label>
                    </div>
                  ))}
                </div>
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
