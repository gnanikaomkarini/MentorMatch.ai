"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle, ChevronDown, ChevronRight, ExternalLink, Play } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

export default function RoadmapPage() {
  const [expandedModules, setExpandedModules] = useState<number[]>([0])

  // Mock data
  const roadmap = {
    title: "Full Stack Web Development",
    description: "A comprehensive roadmap to become a full stack web developer",
    progress: 35,
    modules: [
      {
        id: 1,
        name: "HTML & CSS Basics",
        description: "Learn the fundamentals of web development with HTML and CSS",
        progress: 100,
        completed: true,
        resources: [
          { id: 1, title: "HTML Crash Course", type: "video", completed: true },
          { id: 2, title: "CSS Fundamentals", type: "video", completed: true },
          { id: 3, title: "Building Your First Webpage", type: "exercise", completed: true },
        ],
      },
      {
        id: 2,
        name: "JavaScript Fundamentals",
        description: "Master the basics of JavaScript programming",
        progress: 100,
        completed: true,
        resources: [
          { id: 4, title: "JavaScript Basics", type: "video", completed: true },
          { id: 5, title: "Working with DOM", type: "video", completed: true },
          { id: 6, title: "JavaScript Exercises", type: "exercise", completed: true },
        ],
      },
      {
        id: 3,
        name: "React Fundamentals",
        description: "Learn the basics of React and component-based architecture",
        progress: 40,
        completed: false,
        current: true,
        resources: [
          { id: 7, title: "Introduction to React", type: "video", completed: true },
          { id: 8, title: "React Components", type: "video", completed: true },
          { id: 9, title: "State and Props", type: "video", completed: false },
          { id: 10, title: "React Hooks", type: "video", completed: false },
          { id: 11, title: "Building a Todo App", type: "exercise", completed: false },
        ],
      },
      {
        id: 4,
        name: "Node.js & Express",
        description: "Build server-side applications with Node.js and Express",
        progress: 0,
        completed: false,
        resources: [
          { id: 12, title: "Node.js Basics", type: "video", completed: false },
          { id: 13, title: "Express Framework", type: "video", completed: false },
          { id: 14, title: "RESTful API Design", type: "video", completed: false },
          { id: 15, title: "Building an API", type: "exercise", completed: false },
        ],
      },
      {
        id: 5,
        name: "Database Design",
        description: "Learn about databases and how to design efficient schemas",
        progress: 0,
        completed: false,
        resources: [
          { id: 16, title: "SQL Fundamentals", type: "video", completed: false },
          { id: 17, title: "NoSQL Databases", type: "video", completed: false },
          { id: 18, title: "Database Schema Design", type: "video", completed: false },
          { id: 19, title: "Implementing a Database", type: "exercise", completed: false },
        ],
      },
      {
        id: 6,
        name: "Authentication & Security",
        description: "Implement user authentication and secure your applications",
        progress: 0,
        completed: false,
        resources: [
          { id: 20, title: "Authentication Basics", type: "video", completed: false },
          { id: 21, title: "JWT Authentication", type: "video", completed: false },
          { id: 22, title: "Security Best Practices", type: "video", completed: false },
          { id: 23, title: "Implementing Auth", type: "exercise", completed: false },
        ],
      },
      {
        id: 7,
        name: "Deployment & DevOps",
        description: "Learn how to deploy and manage your applications",
        progress: 0,
        completed: false,
        resources: [
          { id: 24, title: "Deployment Basics", type: "video", completed: false },
          { id: 25, title: "CI/CD Pipelines", type: "video", completed: false },
          { id: 26, title: "Docker Containers", type: "video", completed: false },
          { id: 27, title: "Deploying Your App", type: "exercise", completed: false },
        ],
      },
    ],
  }

  const toggleModule = (index: number) => {
    setExpandedModules((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index)
      } else {
        return [...prev, index]
      }
    })
  }

  const toggleResourceCompletion = (moduleIndex: number, resourceId: number) => {
    // In a real app, this would update the state and make an API call
    console.log(`Toggle resource ${resourceId} in module ${moduleIndex}`)
  }

  return (
    <DashboardLayout userRole="mentee">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{roadmap.title}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">{roadmap.description}</p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{roadmap.progress}%</span>
            </div>
            <Progress value={roadmap.progress} className="h-2" />
          </div>

          <div className="flex gap-2">
            <Button variant="outline">Request Changes</Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Play className="mr-2 h-4 w-4" /> Continue Learning
            </Button>
          </div>
        </div>

        <Tabs defaultValue="modules" className="space-y-4">
          <TabsList>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
          </TabsList>

          <TabsContent value="modules" className="space-y-4">
            {roadmap.modules.map((module, index) => (
              <Card key={module.id} className={module.current ? "border-purple-500 dark:border-purple-400" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleModule(index)}>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full ${
                          module.completed
                            ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                            : module.current
                              ? "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
                              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {module.completed ? <CheckCircle className="h-5 w-5" /> : <span>{index + 1}</span>}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{module.name}</CardTitle>
                        <CardDescription>{module.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {module.current && <Badge className="bg-purple-600">Current</Badge>}
                      <Badge variant="outline">{module.progress}% Complete</Badge>
                      {expandedModules.includes(index) ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {expandedModules.includes(index) && (
                  <>
                    <CardContent>
                      <div className="space-y-4">
                        {module.resources.map((resource) => (
                          <div key={resource.id} className="flex items-center space-x-3">
                            <Checkbox
                              id={`resource-${resource.id}`}
                              checked={resource.completed}
                              onCheckedChange={() => toggleResourceCompletion(index, resource.id)}
                              disabled={module.completed || (!module.current && !resource.completed)}
                            />
                            <div className="flex-1">
                              <label
                                htmlFor={`resource-${resource.id}`}
                                className={`text-sm font-medium ${resource.completed ? "line-through text-gray-500 dark:text-gray-400" : ""}`}
                              >
                                {resource.title}
                              </label>
                              <Badge variant="outline" className="ml-2">
                                {resource.type === "video" ? "Video" : "Exercise"}
                              </Badge>
                            </div>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>

                    <CardFooter>
                      {module.completed ? (
                        <div className="flex items-center text-green-600 dark:text-green-400">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          <span>Module completed</span>
                        </div>
                      ) : module.current ? (
                        <div className="flex justify-between w-full">
                          <Button variant="outline">Request Help</Button>
                          {module.progress > 0 && (
                            <Button className="bg-purple-600 hover:bg-purple-700">Take Assessment</Button>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Complete previous modules to unlock this content
                        </p>
                      )}
                    </CardFooter>
                  </>
                )}
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Learning Timeline</CardTitle>
                <CardDescription>Your projected learning schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800"></div>

                    <div className="space-y-8">
                      <div className="relative pl-10">
                        <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h3 className="font-medium">HTML & CSS Basics</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Completed on June 1, 2025</p>
                        </div>
                      </div>

                      <div className="relative pl-10">
                        <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h3 className="font-medium">JavaScript Fundamentals</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Completed on June 8, 2025</p>
                        </div>
                      </div>

                      <div className="relative pl-10">
                        <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400">
                          3
                        </div>
                        <div>
                          <h3 className="font-medium">React Fundamentals</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">In progress (40% complete)</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Estimated completion: June 22, 2025
                          </p>
                        </div>
                      </div>

                      <div className="relative pl-10">
                        <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400">
                          4
                        </div>
                        <div>
                          <h3 className="font-medium">Node.js & Express</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Estimated: June 23 - July 7, 2025</p>
                        </div>
                      </div>

                      <div className="relative pl-10">
                        <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400">
                          5
                        </div>
                        <div>
                          <h3 className="font-medium">Database Design</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Estimated: July 8 - July 21, 2025</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Available Certificates</CardTitle>
                <CardDescription>Complete your learning path to earn certificates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="font-medium">Full Stack Web Development - Standard</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Complete all modules and pass the standard assessment
                        </p>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                          <Progress value={35} className="h-2 w-24 mr-2" />
                          <span>35% Progress</span>
                        </div>
                      </div>
                      <Button variant="outline" className="mt-4 md:mt-0" disabled>
                        Take Assessment
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="font-medium">Full Stack Web Development - Advanced</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Complete all modules and pass the advanced assessment
                        </p>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                          <Progress value={35} className="h-2 w-24 mr-2" />
                          <span>35% Progress</span>
                        </div>
                      </div>
                      <Button variant="outline" className="mt-4 md:mt-0" disabled>
                        Take Assessment
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="font-medium">HTML & CSS Fundamentals</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Complete the HTML & CSS module and pass the assessment
                        </p>
                        <div className="flex items-center text-sm text-green-600 dark:text-green-400 mt-2">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span>Completed</span>
                        </div>
                      </div>
                      <Button variant="outline" className="mt-4 md:mt-0">
                        View Certificate
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="font-medium">JavaScript Fundamentals</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Complete the JavaScript module and pass the assessment
                        </p>
                        <div className="flex items-center text-sm text-green-600 dark:text-green-400 mt-2">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span>Completed</span>
                        </div>
                      </div>
                      <Button variant="outline" className="mt-4 md:mt-0">
                        View Certificate
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
