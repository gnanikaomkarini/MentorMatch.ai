"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, FileText, PaperclipIcon, Send, Sparkles } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState("mentor")
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock data
  const mentorInfo = {
    name: "Dr. Alex Johnson",
    role: "Senior AI Engineer",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
  }

  const aiAssistantInfo = {
    name: "AI Assistant",
    role: "Learning Helper",
    avatar: "/placeholder.svg?height=40&width=40",
  }

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    // Load initial messages
    if (activeTab === "mentor") {
      setMessages([
        {
          id: 1,
          sender: "mentor",
          content: "Hi Sarah! How's your progress with the React module going?",
          timestamp: "10:30 AM",
        },
        {
          id: 2,
          sender: "user",
          content:
            "I'm making good progress! I've completed the components section, but I'm having some trouble understanding hooks.",
          timestamp: "10:32 AM",
        },
        {
          id: 3,
          sender: "mentor",
          content: "Hooks can be tricky at first. What specific part is giving you trouble?",
          timestamp: "10:35 AM",
        },
      ])
    } else {
      setMessages([
        {
          id: 1,
          sender: "ai",
          content: "Hello! I'm your AI learning assistant. How can I help you with your React learning journey today?",
          timestamp: "11:15 AM",
        },
      ])
    }
  }, [activeTab])

  const handleSendMessage = () => {
    if (message.trim() === "") return

    // Add user message
    const newMessage = {
      id: messages.length + 1,
      sender: "user",
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages([...messages, newMessage])
    setMessage("")

    // Simulate response
    setTimeout(() => {
      const responseMessage = {
        id: messages.length + 2,
        sender: activeTab === "mentor" ? "mentor" : "ai",
        content:
          activeTab === "mentor"
            ? "I see. Let me explain hooks in a simpler way. React hooks are functions that let you use state and other React features without writing a class component. The most common ones are useState and useEffect."
            : "React hooks are a powerful feature introduced in React 16.8. They allow you to use state and other React features without writing class components. Would you like me to provide some examples of how to use useState and useEffect?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }

      setMessages((prev) => [...prev, responseMessage])
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <DashboardLayout userRole="mentee">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chat</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Connect with your mentor or get help from our AI assistant
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="mentor">Mentor</TabsTrigger>
                  <TabsTrigger value="ai">AI Assistant</TabsTrigger>
                </TabsList>
              </Tabs>

              {activeTab === "mentor" && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                    <Avatar>
                      <AvatarImage src={mentorInfo.avatar || "/placeholder.svg"} alt={mentorInfo.name} />
                      <AvatarFallback>{mentorInfo.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{mentorInfo.name}</p>
                      <div className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{mentorInfo.status}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="text-sm font-medium mb-2">Schedule a Meeting</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      Need more in-depth help? Schedule a video call.
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      <Calendar className="h-4 w-4 mr-2" /> Schedule
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="text-sm font-medium mb-2">Shared Resources</h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-xs">
                        <FileText className="h-3 w-3 mr-1 text-gray-500 dark:text-gray-400" />
                        <span className="text-purple-600 dark:text-purple-400 hover:underline cursor-pointer">
                          React_Hooks_Guide.pdf
                        </span>
                      </div>
                      <div className="flex items-center text-xs">
                        <FileText className="h-3 w-3 mr-1 text-gray-500 dark:text-gray-400" />
                        <span className="text-purple-600 dark:text-purple-400 hover:underline cursor-pointer">
                          Component_Lifecycle.pdf
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "ai" && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                    <Avatar>
                      <AvatarImage src={aiAssistantInfo.avatar || "/placeholder.svg"} alt={aiAssistantInfo.name} />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{aiAssistantInfo.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{aiAssistantInfo.role}</p>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="text-sm font-medium mb-2">AI Capabilities</h3>
                    <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <li>• Answer questions about your roadmap</li>
                      <li>• Explain technical concepts</li>
                      <li>• Provide code examples</li>
                      <li>• Suggest learning resources</li>
                      <li>• Help debug code issues</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="text-sm font-medium mb-2">Quick Prompts</h3>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs justify-start"
                        onClick={() => setMessage("Explain React hooks")}
                      >
                        Explain React hooks
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs justify-start"
                        onClick={() => setMessage("Help me debug this code")}
                      >
                        Help me debug this code
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs justify-start"
                        onClick={() => setMessage("Suggest resources for state management")}
                      >
                        Suggest resources for state management
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-3 flex flex-col h-[calc(100vh-13rem)]">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage
                      src={activeTab === "mentor" ? mentorInfo.avatar : aiAssistantInfo.avatar}
                      alt={activeTab === "mentor" ? mentorInfo.name : aiAssistantInfo.name}
                    />
                    <AvatarFallback>{activeTab === "mentor" ? mentorInfo.name.charAt(0) : "AI"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{activeTab === "mentor" ? mentorInfo.name : aiAssistantInfo.name}</CardTitle>
                    <CardDescription>{activeTab === "mentor" ? mentorInfo.role : aiAssistantInfo.role}</CardDescription>
                  </div>
                </div>

                {activeTab === "ai" && (
                  <Badge className="bg-purple-600">
                    <Sparkles className="h-3 w-3 mr-1" /> AI Powered
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.sender !== "user" && (
                    <Avatar className="h-8 w-8 mr-2 mt-1">
                      <AvatarImage
                        src={msg.sender === "mentor" ? mentorInfo.avatar : aiAssistantInfo.avatar}
                        alt={msg.sender === "mentor" ? mentorInfo.name : aiAssistantInfo.name}
                      />
                      <AvatarFallback>{msg.sender === "mentor" ? mentorInfo.name.charAt(0) : "AI"}</AvatarFallback>
                    </Avatar>
                  )}

                  <div className={`max-w-[70%] ${msg.sender === "user" ? "order-1" : "order-2"}`}>
                    <div
                      className={`p-3 rounded-lg ${
                        msg.sender === "user"
                          ? "bg-purple-600 text-white"
                          : msg.sender === "ai"
                            ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{msg.timestamp}</p>
                  </div>

                  {msg.sender === "user" && (
                    <Avatar className="h-8 w-8 ml-2 mt-1">
                      <AvatarFallback>S</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </CardContent>

            <CardFooter className="border-t p-4">
              <div className="flex items-end w-full space-x-2">
                <Button variant="outline" size="icon" className="shrink-0">
                  <PaperclipIcon className="h-4 w-4" />
                </Button>

                <Textarea
                  placeholder={`Message ${activeTab === "mentor" ? mentorInfo.name : aiAssistantInfo.name}...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="min-h-10 flex-1 resize-none"
                  rows={1}
                />

                <Button
                  className="bg-purple-600 hover:bg-purple-700 shrink-0"
                  onClick={handleSendMessage}
                  disabled={message.trim() === ""}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
