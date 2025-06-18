"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Mic, MicOff, Play, Send, ThumbsDown, ThumbsUp } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

export default function InterviewPage() {
  const [activeTab, setActiveTab] = useState("prepare")
  const [interviewState, setInterviewState] = useState<"idle" | "active" | "completed">("idle")
  const [isRecording, setIsRecording] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")

  // Mock data
  const interviewTopics = [
    {
      id: 1,
      name: "React Fundamentals",
      description: "Test your knowledge of React core concepts",
      difficulty: "Intermediate",
      questions: 10,
      duration: "15-20 min",
    },
    {
      id: 2,
      name: "JavaScript Basics",
      description: "Review your JavaScript fundamentals",
      difficulty: "Beginner",
      questions: 8,
      duration: "10-15 min",
    },
    {
      id: 3,
      name: "Web Development Concepts",
      description: "General web development knowledge",
      difficulty: "Mixed",
      questions: 12,
      duration: "20-25 min",
    },
  ]

  const questions = [
    "Explain the concept of React components and their lifecycle.",
    "What are React hooks and how do they differ from class components?",
    "Describe the virtual DOM and its benefits.",
    "How would you handle state management in a complex React application?",
    "Explain the concept of props and how they're used in React.",
  ]

  const startInterview = () => {
    setInterviewState("active")
    setCurrentQuestion(0)
  }

  const submitAnswer = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setUserAnswer("")
    } else {
      setInterviewState("completed")
    }
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
  }

  const restartInterview = () => {
    setInterviewState("idle")
    setCurrentQuestion(0)
    setUserAnswer("")
  }

  return (
    <DashboardLayout userRole="mentee">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Interview Practice</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Practice your skills with our AI interviewer and get instant feedback
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="prepare">Prepare</TabsTrigger>
            <TabsTrigger value="interview">Interview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="prepare" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Interview Topics</CardTitle>
                <CardDescription>Select a topic to practice</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {interviewTopics.map((topic) => (
                    <Card key={topic.id} className="border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{topic.name}</CardTitle>
                        <CardDescription>{topic.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Difficulty:</span>
                            <Badge
                              variant={
                                topic.difficulty === "Beginner"
                                  ? "outline"
                                  : topic.difficulty === "Intermediate"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {topic.difficulty}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Questions:</span>
                            <span className="text-sm">{topic.questions}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Duration:</span>
                            <span className="text-sm">{topic.duration}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className="w-full bg-purple-600 hover:bg-purple-700"
                          onClick={() => {
                            setActiveTab("interview")
                          }}
                        >
                          <Play className="mr-2 h-4 w-4" /> Start Practice
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interview Tips</CardTitle>
                <CardDescription>Prepare for your practice interview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Prepare Your Environment</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Find a quiet place with good lighting. Make sure your microphone works properly. Have a notepad
                      ready to jot down key points.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Structure Your Answers</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Use the STAR method (Situation, Task, Action, Result) for behavioral questions. For technical
                      questions, explain your thought process clearly.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Review Your Roadmap</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Go through the key concepts in your current module before the interview. Focus on understanding
                      the fundamentals rather than memorizing details.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>React Fundamentals Interview</CardTitle>
                <CardDescription>
                  {interviewState === "idle"
                    ? "Start when you're ready"
                    : interviewState === "active"
                      ? `Question ${currentQuestion + 1} of ${questions.length}`
                      : "Interview completed"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {interviewState === "idle" && (
                  <div className="text-center py-8">
                    <div className="mb-6">
                      <Avatar className="h-20 w-20 mx-auto">
                        <AvatarImage src="/placeholder.svg" alt="AI Interviewer" />
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                      <h3 className="text-lg font-medium mt-4">AI Interviewer</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        I'll ask you questions about React fundamentals
                      </p>
                    </div>
                    <Button className="bg-purple-600 hover:bg-purple-700" onClick={startInterview}>
                      <Play className="mr-2 h-4 w-4" /> Start Interview
                    </Button>
                  </div>
                )}

                {interviewState === "active" && (
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg" alt="AI Interviewer" />
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                          <p>{questions[currentQuestion]}</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Take your time to think before answering
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Your Answer</h3>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className={isRecording ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400" : ""}
                            onClick={toggleRecording}
                          >
                            {isRecording ? (
                              <>
                                <MicOff className="h-4 w-4 mr-1" /> Stop Recording
                              </>
                            ) : (
                              <>
                                <Mic className="h-4 w-4 mr-1" /> Record Answer
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                      <Textarea
                        placeholder="Type your answer here..."
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        rows={6}
                      />
                    </div>
                  </div>
                )}

                {interviewState === "completed" && (
                  <div className="space-y-6">
                    <div className="text-center py-4">
                      <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                      <h3 className="text-xl font-medium">Interview Completed!</h3>
                      <p className="text-gray-500 dark:text-gray-400 mt-2">
                        You've answered all questions. Here's your feedback.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-medium mb-2">Overall Performance</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Score</span>
                            <span>75%</span>
                          </div>
                          <Progress value={75} className="h-2" />
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h3 className="font-medium mb-2">Strengths</h3>
                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          <li>Strong understanding of React components</li>
                          <li>Good explanation of state management</li>
                          <li>Clear communication style</li>
                        </ul>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h3 className="font-medium mb-2">Areas for Improvement</h3>
                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          <li>Deepen knowledge of React hooks</li>
                          <li>Practice explaining virtual DOM concepts</li>
                          <li>Provide more code examples in your answers</li>
                        </ul>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h3 className="font-medium mb-2">Recommended Resources</h3>
                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          <li>React Hooks Deep Dive (Module 3, Resource 4)</li>
                          <li>Virtual DOM Explained (Module 3, Resource 2)</li>
                          <li>Schedule a session with your mentor to review these concepts</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {interviewState === "active" && (
                  <div className="flex justify-between w-full">
                    <Button variant="outline" onClick={restartInterview}>
                      Restart
                    </Button>
                    <Button
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={submitAnswer}
                      disabled={userAnswer.trim() === ""}
                    >
                      <Send className="mr-2 h-4 w-4" /> Submit Answer
                    </Button>
                  </div>
                )}

                {interviewState === "completed" && (
                  <div className="flex justify-between w-full">
                    <Button variant="outline" onClick={restartInterview}>
                      Try Again
                    </Button>
                    <div className="flex space-x-2">
                      <Button variant="outline">
                        <ThumbsDown className="mr-2 h-4 w-4" /> Not Helpful
                      </Button>
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <ThumbsUp className="mr-2 h-4 w-4" /> Helpful
                      </Button>
                    </div>
                  </div>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Interview History</CardTitle>
                <CardDescription>Review your past practice interviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="font-medium">JavaScript Basics</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Completed on June 10, 2025</p>
                        <div className="flex items-center text-sm mt-2">
                          <Badge className="bg-green-600">85% Score</Badge>
                        </div>
                      </div>
                      <Button variant="outline" className="mt-4 md:mt-0">
                        View Feedback
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="font-medium">HTML & CSS Concepts</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Completed on June 5, 2025</p>
                        <div className="flex items-center text-sm mt-2">
                          <Badge className="bg-green-600">90% Score</Badge>
                        </div>
                      </div>
                      <Button variant="outline" className="mt-4 md:mt-0">
                        View Feedback
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="font-medium">Web Development Basics</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Completed on May 28, 2025</p>
                        <div className="flex items-center text-sm mt-2">
                          <Badge className="bg-yellow-600">70% Score</Badge>
                        </div>
                      </div>
                      <Button variant="outline" className="mt-4 md:mt-0">
                        View Feedback
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
