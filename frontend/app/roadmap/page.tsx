"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CheckCircle, ChevronDown, ChevronRight, ExternalLink, MessageSquare, AlertCircle, Check, Lock } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Resource {
  title: string
  type: string
  url?: string
  completed: boolean
}

interface Subtopic {
  title: string
  resources: Resource[]
}

interface Module {
  title: string
  objective: string
  subtopics: Subtopic[]
}

interface RoadmapData {
  _id: string
  goal: string
  menteeId: string
  mentorId?: string
  durationWeeks: number
  status: string
  modules: Module[]
  interview_theme_1?: string
  interview_theme_2?: string
  assessment_scores?: { [userId: string]: { [moduleIndex: string]: number } }
  approvalStatus?: {
    mentorId: string
    status: string
    comments: string
  }
}

export default function RoadmapPage() {
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null)
  const [userRole, setUserRole] = useState<string>("")
  const [userId, setUserId] = useState<string>("")
  const [expandedModules, setExpandedModules] = useState<number[]>([0])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [interviewContext, setInterviewContext] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState<1 | 2>(1)
  const [updatingResource, setUpdatingResource] = useState<string | null>(null)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const roadmapId = searchParams.get('id')

  useEffect(() => {
    if (!roadmapId) {
      setError("No roadmap ID provided")
      setLoading(false)
      return
    }

    const fetchRoadmap = async () => {
      setLoading(true)
      setError("")
      try {
        // Get user profile first
        const profileRes = await fetch("http://localhost:5000/api/auth/profile", {
          credentials: "include",
        })
        const profileData = await profileRes.json()
        if (!profileRes.ok) {
          setError("Failed to fetch user profile")
          return
        }
        
        setUserRole(profileData.user.role)
        setUserId(profileData.user.id)

        // Get roadmap data
        const roadmapRes = await fetch(`http://localhost:5000/api/roadmaps/${roadmapId}`, {
          credentials: "include",
        })
        const roadmapData = await roadmapRes.json()
        
        if (!roadmapRes.ok) {
          setError(roadmapData.message || "Failed to fetch roadmap")
          return
        }
        
        setRoadmapData(roadmapData)
      } catch (err) {
        setError("Failed to fetch roadmap data")
      } finally {
        setLoading(false)
      }
    }

    fetchRoadmap()
  }, [roadmapId])

  const toggleModule = (index: number) => {
    // Only allow expansion if module is accessible
    if (!canAccessModule(index) && userRole === "mentee") return
    
    setExpandedModules((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index)
      } else {
        return [...prev, index]
      }
    })
  }

  // Get the first incomplete resource in the entire roadmap
  const getFirstIncompleteResource = () => {
    if (!roadmapData) return null
    
    for (let moduleIndex = 0; moduleIndex < roadmapData.modules.length; moduleIndex++) {
      const module = roadmapData.modules[moduleIndex]
      for (let subtopicIndex = 0; subtopicIndex < module.subtopics.length; subtopicIndex++) {
        const subtopic = module.subtopics[subtopicIndex]
        for (let resourceIndex = 0; resourceIndex < subtopic.resources.length; resourceIndex++) {
          const resource = subtopic.resources[resourceIndex]
          if (!resource.completed) {
            return { moduleIndex, subtopicIndex, resourceIndex }
          }
        }
      }
    }
    return null
  }

  // Check if a resource can be modified
  const canModifyResource = (moduleIndex: number, subtopicIndex: number, resourceIndex: number) => {
    if (!roadmapData || userRole !== "mentee") return false
    
    const firstIncomplete = getFirstIncompleteResource()
    if (!firstIncomplete) return false // All resources completed
    
    const currentResource = roadmapData.modules[moduleIndex].subtopics[subtopicIndex].resources[resourceIndex]
    
    // If resource is completed
    if (currentResource.completed) {
      // Check if this is in a subtopic that has been started but not completed
      const subtopic = roadmapData.modules[moduleIndex].subtopics[subtopicIndex]
      const subtopicCompleted = subtopic.resources.every(r => r.completed)
      const subtopicStarted = subtopic.resources.some(r => r.completed)
      
      // If subtopic is completed and we've moved past it, can't uncheck
      if (subtopicCompleted) {
        // Check if any later subtopic has been started
        for (let mi = 0; mi < roadmapData.modules.length; mi++) {
          for (let si = 0; si < roadmapData.modules[mi].subtopics.length; si++) {
            // If this is a later subtopic (either same module, later subtopic, or later module)
            if (mi > moduleIndex || (mi === moduleIndex && si > subtopicIndex)) {
              const laterSubtopic = roadmapData.modules[mi].subtopics[si]
              if (laterSubtopic.resources.some(r => r.completed)) {
                return false // Can't uncheck because later work has been started
              }
            }
          }
        }
      }
      
      // Can uncheck if it's the last completed resource in sequence
      return (
        moduleIndex === firstIncomplete.moduleIndex &&
        subtopicIndex === firstIncomplete.subtopicIndex &&
        resourceIndex === firstIncomplete.resourceIndex - 1
      ) || (
        // Or if we're at the end of a subtopic and the next subtopic hasn't been started
        resourceIndex === subtopic.resources.length - 1 &&
        !hasLaterWorkStarted(moduleIndex, subtopicIndex)
      )
    } else {
      // If resource is not completed, can only check if it's the next in sequence
      return (
        moduleIndex === firstIncomplete.moduleIndex &&
        subtopicIndex === firstIncomplete.subtopicIndex &&
        resourceIndex === firstIncomplete.resourceIndex
      )
    }
  }

  // Check if any work has been started after the given subtopic
  const hasLaterWorkStarted = (moduleIndex: number, subtopicIndex: number) => {
    if (!roadmapData) return false
    
    for (let mi = 0; mi < roadmapData.modules.length; mi++) {
      for (let si = 0; si < roadmapData.modules[mi].subtopics.length; si++) {
        // If this is a later subtopic
        if (mi > moduleIndex || (mi === moduleIndex && si > subtopicIndex)) {
          const laterSubtopic = roadmapData.modules[mi].subtopics[si]
          if (laterSubtopic.resources.some(r => r.completed)) {
            return true
          }
        }
      }
    }
    return false
  }

  // Get tooltip message for locked resources
  const getResourceTooltip = (moduleIndex: number, subtopicIndex: number, resourceIndex: number) => {
    if (userRole !== "mentee") return "Only mentees can modify resource completion"
    
    const canModify = canModifyResource(moduleIndex, subtopicIndex, resourceIndex)
    const resource = roadmapData?.modules[moduleIndex].subtopics[subtopicIndex].resources[resourceIndex]
    
    if (!resource) return ""
    
    if (canModify) return ""
    
    if (resource.completed) {
      return "Cannot uncheck: Later work has been started"
    } else {
      return "Complete previous resources first"
    }
  }

  const toggleResourceCompletion = async (moduleIndex: number, subtopicIndex: number, resourceIndex: number) => {
    if (!canModifyResource(moduleIndex, subtopicIndex, resourceIndex) || !roadmapData) return

    const resource = roadmapData.modules[moduleIndex].subtopics[subtopicIndex].resources[resourceIndex]
    const resourceId = `${moduleIndex}-${subtopicIndex}-${resourceIndex}`
    
    // Store original state for potential rollback
    const originalCompleted = resource.completed
    const newCompletedState = !resource.completed
    
    // Immediately update the UI to show the new state
    setRoadmapData(prev => {
      if (!prev) return prev
      const newData = { ...prev }
      newData.modules[moduleIndex].subtopics[subtopicIndex].resources[resourceIndex].completed = newCompletedState
      return newData
    })
    
    // Set updating state for subtle loading indicator (but don't dim the main state)
    setUpdatingResource(resourceId)
    
    try {
      const response = await fetch(`http://localhost:5000/api/roadmaps/${roadmapId}/resource/${resourceId}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          completed: newCompletedState
        })
      })

      if (!response.ok) {
        // Only revert on error
        setRoadmapData(prev => {
          if (!prev) return prev
          const newData = { ...prev }
          newData.modules[moduleIndex].subtopics[subtopicIndex].resources[resourceIndex].completed = originalCompleted
          return newData
        })
        setError("Failed to update resource completion")
      }
    } catch (err) {
      // Only revert on error
      setRoadmapData(prev => {
        if (!prev) return prev
        const newData = { ...prev }
        newData.modules[moduleIndex].subtopics[subtopicIndex].resources[resourceIndex].completed = originalCompleted
        return newData
      })
      setError("Failed to update resource completion")
    } finally {
      setUpdatingResource(null)
    }
  }

  const calculateModuleProgress = (module: Module) => {
    const totalResources = module.subtopics.reduce((acc, subtopic) => acc + subtopic.resources.length, 0)
    const completedResources = module.subtopics.reduce(
      (acc, subtopic) => acc + subtopic.resources.filter(r => r.completed).length, 0
    )
    return totalResources > 0 ? Math.round((completedResources / totalResources) * 100) : 0
  }

  const isModuleCompleted = (module: Module) => {
    return module.subtopics.every(subtopic => 
      subtopic.resources.every(resource => resource.completed)
    )
  }

  const calculateOverallProgress = () => {
    if (!roadmapData) return 0
    const totalModules = roadmapData.modules.length
    const completedModules = roadmapData.modules.filter(isModuleCompleted).length
    return totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0
  }

  const areModulesCompletedUpTo = (moduleIndex: number) => {
    if (!roadmapData) return false
    return roadmapData.modules.slice(0, moduleIndex + 1).every(isModuleCompleted)
  }

  const canTakeInterview = (interviewNumber: 1 | 2) => {
    if (!roadmapData) return false
    
    // Interview 1: halfway point (after 50% of modules)
    // Interview 2: at the end (after all modules)
    const requiredModules = interviewNumber === 1 
      ? Math.ceil(roadmapData.modules.length / 2)
      : roadmapData.modules.length

    const modulesCompleted = areModulesCompletedUpTo(requiredModules - 1)
    const hasTheme = interviewNumber === 1 
      ? !!roadmapData.interview_theme_1 
      : !!roadmapData.interview_theme_2

    return modulesCompleted && hasTheme
  }

  const getInterviewTooltip = (interviewNumber: 1 | 2) => {
    if (!roadmapData) return ""
    
    const requiredModules = interviewNumber === 1 
      ? Math.ceil(roadmapData.modules.length / 2)
      : roadmapData.modules.length
    
    const modulesCompleted = areModulesCompletedUpTo(requiredModules - 1)
    const hasTheme = interviewNumber === 1 
      ? !!roadmapData.interview_theme_1 
      : !!roadmapData.interview_theme_2

    if (!modulesCompleted) {
      return `Complete first ${requiredModules} modules to unlock this interview`
    }
    if (!hasTheme) {
      return "Ask your mentor to set the interview context"
    }
    return "Ready to take interview"
  }

  const handleSetInterviewContext = async () => {
    if (!interviewContext.trim()) return

    try {
      const response = await fetch(`http://localhost:5000/api/roadmaps/interview/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          roadmap_id: roadmapId,
          interview_num: selectedInterview,
          context: interviewContext
        })
      })

      if (response.ok) {
        // Update local state
        setRoadmapData(prev => {
          if (!prev) return prev
          const newData = { ...prev }
          if (selectedInterview === 1) {
            newData.interview_theme_1 = interviewContext
          } else {
            newData.interview_theme_2 = interviewContext
          }
          return newData
        })
        setInterviewContext("")
        setIsDialogOpen(false)
      } else {
        setError("Failed to set interview context")
      }
    } catch (err) {
      setError("Failed to set interview context")
    }
  }

  // Update the module assessment score
  const getModuleAssessmentScore = (moduleIndex: number) => {
    if (!roadmapData?.modules) return null
    
    // Check if the module has assessment_scores
    const module = roadmapData.modules[moduleIndex]
    if (!module || !module.assessment_scores) return null
    
    // For mentors, get the mentee's score (there should only be one user in assessment_scores)
    if (userRole === "mentor") {
      const userIds = Object.keys(module.assessment_scores)
      if (userIds.length > 0) {
        return module.assessment_scores[userIds[0]] || null
      }
      return null
    }
    
    // For mentees, get their own score
    if (!userId) return null
    return module.assessment_scores[userId] || null
  }

  // Update the hasPassedAssessment function  
  const hasPassedAssessment = (moduleIndex: number) => {
    const score = getModuleAssessmentScore(moduleIndex)
    return score !== null && score >= 80 // 80% passing grade
  }

  const canAccessModule = (moduleIndex: number) => {
    if (moduleIndex === 0) return true // First module is always accessible
    
    // Check if previous module is completed AND assessment is passed
    const previousModule = roadmapData?.modules[moduleIndex - 1]
    if (!previousModule) return false
    
    const previousModuleCompleted = isModuleCompleted(previousModule)
    const previousAssessmentPassed = hasPassedAssessment(moduleIndex - 1)
    
    return previousModuleCompleted && previousAssessmentPassed
  }

  // Add loading state handling before the return statement
  if (loading) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading roadmap...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout userRole={userRole}>
        <Alert variant="destructive" className="max-w-md mx-auto mt-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </DashboardLayout>
    )
  }

  if (!roadmapData) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="text-center mt-8">
          <p className="text-gray-600">No roadmap found</p>
        </div>
      </DashboardLayout>
    )
  }

  const overallProgress = calculateOverallProgress()

  return (
    <DashboardLayout userRole={userRole}>
      <TooltipProvider>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{roadmapData.goal}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {roadmapData.durationWeeks} week learning path • Status: {roadmapData.status}
            </p>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          </div>

          <Tabs defaultValue="modules" className="space-y-4">
            <TabsList>
              <TabsTrigger value="modules">Modules</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="modules" className="space-y-4">
              {roadmapData.modules.map((module, index) => {
                const moduleIndex = index
                const moduleProgress = calculateModuleProgress(module)
                const moduleCompleted = isModuleCompleted(module)
                const isInterviewModule = moduleIndex === Math.ceil(roadmapData.modules.length / 2) - 1 || 
                                        moduleIndex === roadmapData.modules.length - 1
                const isAccessible = canAccessModule(moduleIndex)
                const assessmentScore = getModuleAssessmentScore(moduleIndex)
                const assessmentPassed = hasPassedAssessment(moduleIndex)

                return (
                  <div key={moduleIndex}>
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleModule(moduleIndex)}>
                          <div className="flex items-center space-x-2">
                            <div
                              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                !isAccessible && userRole === "mentee"
                                  ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                                  : moduleCompleted
                                    ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                              }`}
                            >
                              {!isAccessible && userRole === "mentee" ? (
                                <Lock className="h-5 w-5" />
                              ) : moduleCompleted ? (
                                <CheckCircle className="h-5 w-5" />
                              ) : (
                                <span>{moduleIndex + 1}</span>
                              )}
                            </div>
                            <div className={!isAccessible && userRole === "mentee" ? "opacity-50" : ""}>
                              <CardTitle className="text-lg">{module.title}</CardTitle>
                              <CardDescription>{module.objective}</CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {!isAccessible && userRole === "mentee" ? (
                              <Badge variant="outline" className="bg-gray-50 text-gray-500">
                                🔒 Locked
                              </Badge>
                            ) : (
                              <>
                                <Badge variant="outline">{moduleProgress}% Complete</Badge>
                                {/* Assessment Score Display */}
                                {assessmentScore !== null && (
                                  <Badge 
                                    variant={assessmentPassed ? "default" : "destructive"}
                                    className={`text-xs ${
                                      assessmentPassed 
                                        ? "bg-green-100 text-green-800 border-green-200" 
                                        : "bg-red-100 text-red-800 border-red-200"
                                    }`}
                                  >
                                    Test: {assessmentScore}%
                                  </Badge>
                                )}
                              </>
                            )}
                            {isAccessible && (
                              expandedModules.includes(moduleIndex) ? (
                                <ChevronDown className="h-5 w-5" />
                              ) : (
                                <ChevronRight className="h-5 w-5" />
                              )
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      {expandedModules.includes(moduleIndex) && isAccessible && (
                        <>
                          <CardContent>
                            <div className="space-y-6">
                              {module.subtopics.map((subtopic, subtopicIndex) => (
                                <div key={subtopicIndex} className="border-l-2 border-gray-200 pl-4">
                                  <h4 className="font-medium text-sm mb-3">{subtopic.title}</h4>
                                  <div className="space-y-3">
                                    {subtopic.resources.map((resource, resourceIndex) => {
                                      const resourceId = `${moduleIndex}-${subtopicIndex}-${resourceIndex}`
                                      const isUpdating = updatingResource === resourceId
                                      const canModify = canModifyResource(moduleIndex, subtopicIndex, resourceIndex)
                                      const tooltipMessage = getResourceTooltip(moduleIndex, subtopicIndex, resourceIndex)
                                      
                                      return (
                                        <div key={resourceIndex} className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                                          resource.completed 
                                            ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" 
                                            : canModify 
                                              ? "bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                                              : "bg-gray-25 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800 opacity-60"
                                        }`}>
                                          <div className="relative flex-shrink-0">
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <div>
                                                  {/* Custom Checkbox Visual */}
                                                  <div 
                                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                                                      resource.completed
                                                        ? "bg-green-600 border-green-600 text-white"
                                                        : canModify
                                                          ? "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-purple-400 cursor-pointer"
                                                          : "border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                                                    }`}
                                                    onClick={() => canModify && !isUpdating && toggleResourceCompletion(moduleIndex, subtopicIndex, resourceIndex)}
                                                  >
                                                    {resource.completed && (
                                                      <Check className="h-3 w-3" />
                                                    )}
                                                    {!canModify && !resource.completed && (
                                                      <Lock className="h-3 w-3 text-gray-400" />
                                                    )}
                                                    {/* Show subtle loading indicator only when updating */}
                                                    {isUpdating && (
                                                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                                                    )}
                                                  </div>
                                                </div>
                                              </TooltipTrigger>
                                              {tooltipMessage && (
                                                <TooltipContent side="top" className="max-w-xs text-center">
                                                  <p>{tooltipMessage}</p>
                                                </TooltipContent>
                                              )}
                                            </Tooltip>
                                            
                                            {/* Hidden actual checkbox for accessibility */}
                                            <Checkbox
                                              id={`resource-${resourceId}`}
                                              checked={resource.completed}
                                              onCheckedChange={() => canModify && toggleResourceCompletion(moduleIndex, subtopicIndex, resourceIndex)}
                                              disabled={!canModify || isUpdating}
                                              className="sr-only"
                                            />
                                          </div>
                                          
                                          <div className="flex-1 min-w-0">
                                            <label
                                              htmlFor={`resource-${resourceId}`}
                                              className={`text-sm font-medium transition-all duration-200 block ${
                                                resource.completed 
                                                  ? "line-through text-green-700 dark:text-green-400" 
                                                  : canModify
                                                    ? "text-gray-900 dark:text-gray-100 cursor-pointer"
                                                    : "text-gray-500 dark:text-gray-500 cursor-not-allowed"
                                              }`}
                                              onClick={() => canModify && !isUpdating && toggleResourceCompletion(moduleIndex, subtopicIndex, resourceIndex)}
                                            >
                                              {resource.title}
                                              {/* Show subtle loading text only when updating */}
                                              {isUpdating && (
                                                <span className="ml-2 text-xs text-purple-600 animate-pulse">Saving...</span>
                                              )}
                                            </label>
                                            <div className="flex items-center gap-2 mt-1">
                                              <Badge 
                                                variant={resource.completed ? "default" : "outline"} 
                                                className={`text-xs ${
                                                  resource.completed 
                                                    ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200" 
                                                    : canModify
                                                      ? ""
                                                      : "opacity-50"
                                                }`}
                                              >
                                                {resource.type === "youtube" ? "Video" : 
                                                 resource.type === "other" ? "Article" : resource.type}
                                              </Badge>
                                              {resource.completed && (
                                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300">
                                                  ✓ Completed
                                                </Badge>
                                              )}
                                              {!canModify && !resource.completed && (
                                                <Badge variant="outline" className="text-xs bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400">
                                                  🔒 Locked
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                          
                                          {resource.url && (
                                            <Button 
                                              variant="ghost" 
                                              size="sm" 
                                              asChild
                                              className={`flex-shrink-0 ${
                                                resource.completed 
                                                  ? "text-green-600 hover:text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/30" 
                                                  : canModify
                                                    ? "text-gray-600 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                                                    : "text-gray-400 cursor-not-allowed opacity-50"
                                              }`}
                                            >
                                              <a 
                                                href={resource.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                onClick={(e) => {
                                                  if (!canModify && !resource.completed) {
                                                    e.preventDefault()
                                                  }
                                                }}
                                              >
                                                <ExternalLink className="h-4 w-4" />
                                              </a>
                                            </Button>
                                          )}
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>

                          <CardFooter className="bg-gray-50 dark:bg-gray-800/50 border-t">
                            {moduleCompleted ? (
                              <div className="w-full space-y-3">
                                {/* Main completion status and assessment button/status */}
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center text-green-600 dark:text-green-400">
                                      <CheckCircle className="h-5 w-5 mr-2" />
                                      <span className="font-medium">Module completed</span>
                                    </div>
                                    
                                    {/* Assessment Status Badge for both mentor and mentee */}
                                    {assessmentScore !== null && (
                                      <Badge 
                                        variant={assessmentPassed ? "default" : "destructive"}
                                        className={`${
                                          assessmentPassed 
                                            ? "bg-green-100 text-green-800 border-green-300" 
                                            : "bg-red-100 text-red-800 border-red-300"
                                        }`}
                                      >
                                        {assessmentPassed ? '✓ Passed' : '✗ Failed'} ({assessmentScore}%)
                                      </Badge>
                                    )}
                                    
                                    {/* Show if no assessment taken yet */}
                                    {assessmentScore === null && (
                                      <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-300">
                                        Assessment not taken
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  {/* Only show Take Assessment button for mentees */}
                                  {userRole === "mentee" && (
                                    <Button
                                      size="sm"
                                      className={`${
                                        assessmentScore !== null 
                                          ? "bg-blue-600 hover:bg-blue-700" 
                                          : "bg-purple-600 hover:bg-purple-700"
                                      } font-medium px-6`}
                                      onClick={() => router.push(`/roadmap/assessment?moduleId=${moduleIndex}&roadmapId=${roadmapId}`)}
                                    >
                                      {assessmentScore !== null ? 'Retake Assessment' : 'Take Assessment'}
                                    </Button>
                                  )}
                                  
                                  {/* For mentors, show assessment status text */}
                                  {userRole === "mentor" && assessmentScore === null && (
                                    <span className="text-sm text-gray-500 italic">
                                      Waiting for mentee to take assessment
                                    </span>
                                  )}
                                </div>
                                
                                {/* Warning/Status Messages */}
                                {moduleCompleted && !assessmentPassed && moduleIndex < roadmapData.modules.length - 1 && (
                                  <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                    <p className="text-sm text-amber-800 dark:text-amber-200">
                                      {userRole === "mentee" ? (
                                        <>
                                          <span className="font-medium">Pass the assessment (80%+)</span> to unlock the next module
                                        </>
                                      ) : (
                                        <>
                                          <span className="font-medium">Mentee needs to pass assessment (80%+)</span> to unlock the next module
                                        </>
                                      )}
                                    </p>
                                  </div>
                                )}
                                
                                {/* Success message for passed assessment */}
                                {moduleCompleted && assessmentPassed && moduleIndex < roadmapData.modules.length - 1 && (
                                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                    <p className="text-sm text-green-800 dark:text-green-200">
                                      {userRole === "mentee" ? (
                                        <>
                                          <span className="font-medium">Great job!</span> Next module is now unlocked
                                        </>
                                      ) : (
                                        <>
                                          <span className="font-medium">Assessment passed!</span> Next module is unlocked for mentee
                                        </>
                                      )}
                                    </p>
                                  </div>
                                )}
                                
                                {/* No assessment taken message */}
                                {moduleCompleted && assessmentScore === null && (
                                  <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                      {userRole === "mentee" ? (
                                        <>
                                          <span className="font-medium">Take the assessment</span> to unlock the next module
                                        </>
                                      ) : (
                                        <>
                                          <span className="font-medium">Waiting for mentee</span> to take the assessment
                                        </>
                                      )}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="w-full text-center py-2">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {userRole === "mentee" 
                                    ? "Complete all resources to unlock assessment"
                                    : "Mentee needs to complete all resources to unlock assessment"
                                  }
                                </p>
                              </div>
                            )}
                          </CardFooter>
                        </>
                      )}

                      {/* Show locked message when module is not accessible */}
                      {!isAccessible && userRole === "mentee" && (
                        <CardContent>
                          <div className="text-center py-8">
                            <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">Complete the previous module and pass its assessment to unlock this module.</p>
                          </div>
                        </CardContent>
                      )}
                    </Card>

                    {/* Interview Buttons with Enhanced Tooltips */}
                    {isInterviewModule && (
                      <div className="mt-4 flex justify-end">
                        {userRole === "mentee" ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <Button
                                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                  onClick={() => {
                                    const interviewNum = moduleIndex === Math.ceil(roadmapData.modules.length / 2) - 1 ? 1 : 2
                                    router.push(`/roadmap/interview?moduleId=${moduleIndex}&roadmapId=${roadmapId}&interviewNum=${interviewNum}`)
                                  }}
                                  disabled={!canTakeInterview(moduleIndex === Math.ceil(roadmapData.modules.length / 2) - 1 ? 1 : 2)}
                                >
                                  Take Interview {moduleIndex === Math.ceil(roadmapData.modules.length / 2) - 1 ? 1 : 2}
                                </Button>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs text-center">
                              <p>{getInterviewTooltip(moduleIndex === Math.ceil(roadmapData.modules.length / 2) - 1 ? 1 : 2)}</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          // Mentor view remains the same
                          <div className="space-y-2">
                            {moduleIndex === Math.ceil(roadmapData.modules.length / 2) - 1 && !roadmapData.interview_theme_1 && (
                              <Dialog open={isDialogOpen && selectedInterview === 1} onOpenChange={(open) => {
                                setIsDialogOpen(open)
                                if (open) setSelectedInterview(1)
                              }}>
                                <DialogTrigger asChild>
                                  <Button variant="outline">Set Interview 1 Context</Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Set Interview 1 Context</DialogTitle>
                                    <DialogDescription>
                                      Provide context and themes for the first AI interview (halfway point).
                                    </DialogDescription>
                                  </DialogHeader>
                                  <Textarea
                                    placeholder="Enter interview context and themes..."
                                    value={interviewContext}
                                    onChange={(e) => setInterviewContext(e.target.value)}
                                    rows={4}
                                  />
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                      Cancel
                                    </Button>
                                    <Button onClick={handleSetInterviewContext}>
                                      Set Context
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            )}
                            
                            {moduleIndex === roadmapData.modules.length - 1 && !roadmapData.interview_theme_2 && (
                              <Dialog open={isDialogOpen && selectedInterview === 2} onOpenChange={(open) => {
                                setIsDialogOpen(open)
                                if (open) setSelectedInterview(2)
                              }}>
                                <DialogTrigger asChild>
                                  <Button variant="outline">Set Interview 2 Context</Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Set Interview 2 Context</DialogTitle>
                                    <DialogDescription>
                                      Provide context and themes for the final AI interview.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <Textarea
                                    placeholder="Enter interview context and themes..."
                                    value={interviewContext}
                                    onChange={(e) => setInterviewContext(e.target.value)}
                                    rows={4}
                                  />
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                      Cancel
                                    </Button>
                                    <Button onClick={handleSetInterviewContext}>
                                      Set Context
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            )}

                            {/* Show context set confirmation */}
                            {moduleIndex === Math.ceil(roadmapData.modules.length / 2) - 1 && roadmapData.interview_theme_1 && (
                              <p className="text-sm text-green-600">✓ Interview 1 context set</p>
                            )}
                            {moduleIndex === roadmapData.modules.length - 1 && roadmapData.interview_theme_2 && (
                              <p className="text-sm text-green-600">✓ Interview 2 context set</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Timeline</CardTitle>
                  <CardDescription>
                    {userRole === "mentee" ? "Your learning progress over time" : "Mentee's learning progress over time"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800"></div>
                      <div className="space-y-8">
                        {roadmapData.modules.map((module, index) => {
                          const moduleCompleted = isModuleCompleted(module)
                          const moduleProgress = calculateModuleProgress(module)
                          const assessmentScore = getModuleAssessmentScore(index)
                          const assessmentPassed = hasPassedAssessment(index)
                          
                          return (
                            <div key={index} className="relative pl-10">
                              <div className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center ${
                                moduleCompleted && assessmentPassed
                                  ? "bg-green-100 dark:bg-green-900"
                                  : moduleCompleted && assessmentScore !== null
                                    ? "bg-red-100 dark:bg-red-900"
                                    : moduleCompleted
                                      ? "bg-yellow-100 dark:bg-yellow-900"
                                      : "bg-gray-100 dark:bg-gray-800"
                              }`}>
                                {moduleCompleted && assessmentPassed ? (
                                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                ) : moduleCompleted && assessmentScore !== null ? (
                                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                ) : moduleCompleted ? (
                                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                ) : (
                                  <span className="text-gray-500 dark:text-gray-400">{index + 1}</span>
                                )}
                              </div>
                              <div>
                                <h3 className="font-medium">{module.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {moduleCompleted && assessmentPassed
                                    ? `✅ Completed & Passed • Assessment: ${assessmentScore}%`
                                    : moduleCompleted && assessmentScore !== null
                                      ? `❌ Assessment Failed • Score: ${assessmentScore}%`
                                      : moduleCompleted
                                        ? "⏳ Assessment pending"
                                        : `📚 ${moduleProgress}% complete`
                                  }
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </TooltipProvider>
    </DashboardLayout>
  )
}