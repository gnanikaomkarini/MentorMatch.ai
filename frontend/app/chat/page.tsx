"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { PaperclipIcon, Send } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

interface User {
  id: string
  name: string
  username: string
  role: string
}

interface Message {
  _id: string
  sender_id: string
  receiver_id: string
  content: string
  timestamp: string
}

export default function ChatPage() {
  // State variables
  const [userRole, setUserRole] = useState<"mentor" | "mentee">("mentee")
  const [userId, setUserId] = useState<string>("")
  const [userName, setUserName] = useState<string>("")
  const [mentees, setMentees] = useState<User[]>([])
  const [mentor, setMentor] = useState<User | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState("")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMounted, setHasMounted] = useState(false)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  // Prevent hydration mismatch
  useEffect(() => {
    setHasMounted(true)
  }, [])

  // Fetch user profile and initialize chat
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch("http://localhost:5000/api/auth/profile", {
          credentials: "include",
        })
        
        if (!response.ok) {
          throw new Error("Failed to fetch profile")
        }
        
        const data = await response.json()
        const user = data.user
        
        setUserId(user.id)
        setUserName(user.name)
        setUserRole(user.role)
        
        if (user.role === "mentor" && user.mentees && user.mentees.length > 0) {
          // Fetch mentees with their names using the API
          try {
            const menteesResponse = await fetch("http://localhost:5000/api/users/mentees", {
              credentials: "include",
            })
            
            if (menteesResponse.ok) {
              const menteesData = await menteesResponse.json()
              setMentees(menteesData)
              
              if (menteesData.length > 0) {
                setSelectedUser(menteesData[0])
              }
            } else {
              // Fallback to using IDs from profile if API fails
              const menteeUsers = user.mentees.map((menteeId: string) => ({
                id: menteeId,
                name: `Mentee ${menteeId.slice(-4)}`,
                username: `mentee_${menteeId.slice(-4)}`,
                role: "mentee"
              }))
              setMentees(menteeUsers)
              setSelectedUser(menteeUsers[0])
            }
          } catch (error) {
            console.error("Error fetching mentees:", error)
            // Fallback to using IDs from profile
            const menteeUsers = user.mentees.map((menteeId: string) => ({
              id: menteeId,
              name: `Mentee ${menteeId.slice(-4)}`,
              username: `mentee_${menteeId.slice(-4)}`,
              role: "mentee"
            }))
            setMentees(menteeUsers)
            setSelectedUser(menteeUsers[0])
          }
          
        } else if (user.role === "mentee" && user.mentors && user.mentors.length > 0) {
          // Fetch mentor with their name using the API
          try {
            const mentorResponse = await fetch("http://localhost:5000/api/users/mymentor", {
              credentials: "include",
            })
            
            if (mentorResponse.ok) {
              const mentorData = await mentorResponse.json()
              setMentor(mentorData)
              setSelectedUser(mentorData)
            } else {
              // Fallback to using ID from profile if API fails
              const mentorId = user.mentors[0]
              const mentorUser = {
                id: mentorId,
                name: `Mentor ${mentorId.slice(-4)}`,
                username: `mentor_${mentorId.slice(-4)}`,
                role: "mentor"
              }
              setMentor(mentorUser)
              setSelectedUser(mentorUser)
            }
          } catch (error) {
            console.error("Error fetching mentor:", error)
            // Fallback to using ID from profile
            const mentorId = user.mentors[0]
            const mentorUser = {
              id: mentorId,
              name: `Mentor ${mentorId.slice(-4)}`,
              username: `mentor_${mentorId.slice(-4)}`,
              role: "mentor"
            }
            setMentor(mentorUser)
            setSelectedUser(mentorUser)
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        setError("Failed to load profile")
      } finally {
        setLoading(false)
      }
    }
    
    if (hasMounted) {
      fetchProfile()
    }
  }, [hasMounted])

  // Fetch messages function
  const fetchMessages = useCallback(async (otherId: string, pageNum: number, reset: boolean = false) => {
    if (!otherId) return
    
    try {
      const response = await fetch(`http://localhost:5000/api/chat/get/${otherId}/${pageNum}`, {
        credentials: "include",
      })
      
      if (!response.ok) {
        throw new Error("Failed to fetch messages")
      }
      
      const data = await response.json()
      setHasMore(!data.isLastPage)
      
      if (reset) {
        setMessages(data.messages || [])
        setPage(1)
      } else {
        setMessages(prev => [...(data.messages || []), ...prev])
        setPage(pageNum)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      setError("Failed to load messages")
    } finally {
      setIsFetchingMore(false)
    }
  }, [])

  // Load messages when selectedUser changes
  useEffect(() => {
    if (!selectedUser?.id || !hasMounted) return
    
    setMessages([])
    setPage(1)
    setHasMore(true)
    fetchMessages(selectedUser.id, 1, true)
    
    // Scroll to bottom after a short delay
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" })
    }, 100)
  }, [selectedUser, fetchMessages, hasMounted])

  // Polling for new messages every 15 seconds
  useEffect(() => {
    if (!selectedUser?.id || !hasMounted) return
    
    // Clear existing polling
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
    }
    
    pollingRef.current = setInterval(() => {
      fetchMessages(selectedUser.id, 1, true)
    }, 15000)
    
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [selectedUser, fetchMessages, hasMounted])

  // Infinite scroll for loading older messages
  useEffect(() => {
    if (!hasMounted) return
    
    const handleScroll = () => {
      if (
        !chatContainerRef.current ||
        !selectedUser?.id ||
        !hasMore ||
        isFetchingMore
      ) return
      
      if (chatContainerRef.current.scrollTop === 0) {
        setIsFetchingMore(true)
        fetchMessages(selectedUser.id, page + 1, false)
      }
    }
    
    const container = chatContainerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll)
      return () => container.removeEventListener("scroll", handleScroll)
    }
  }, [selectedUser, page, hasMore, isFetchingMore, fetchMessages, hasMounted])

  // Send message function
  const handleSendMessage = async () => {
    if (!message.trim() || !selectedUser?.id) return
    
    const messageContent = message.trim()
    setMessage("")
    
    // Optimistic update
    const tempMessage: Message = {
      _id: `temp-${Date.now()}`,
      sender_id: userId,
      receiver_id: selectedUser.id,
      content: messageContent,
      timestamp: new Date().toISOString()
    }
    
    setMessages(prev => [...prev, tempMessage])
    
    // Scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
    
    try {
      const response = await fetch("http://localhost:5000/api/chat/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          receiver_id: selectedUser.id,
          content: messageContent,
        }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to send message")
      }
      
      // Refresh messages to get the actual message with correct timestamp
      await fetchMessages(selectedUser.id, 1, true)
      
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
      
    } catch (error) {
      console.error("Error sending message:", error)
      setError("Failed to send message")
      // Remove the temporary message on error
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id))
      setMessage(messageContent) // Restore the message
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Don't render anything until mounted to prevent hydration mismatch
  if (!hasMounted) {
    return null
  }

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chat</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {userRole === "mentor" 
              ? "Select a mentee to chat with" 
              : "Chat with your mentor"}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userRole === "mentor" ? (
                mentees.length > 0 ? (
                  mentees.map((mentee) => (
                    <div
                      key={mentee.id}
                      className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedUser?.id === mentee.id
                          ? "bg-purple-100 dark:bg-purple-900"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                      onClick={() => setSelectedUser(mentee)}
                    >
                      <Avatar>
                        <AvatarFallback>
                          {mentee.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{mentee.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          @{mentee.username}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No mentees found
                  </div>
                )
              ) : mentor ? (
                <div className="flex items-center space-x-3 p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                  <Avatar>
                    <AvatarFallback>
                      {mentor.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{mentor.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      @{mentor.username}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No mentor assigned
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-3 flex flex-col h-[calc(100vh-13rem)]">
            <CardHeader className="border-b">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>
                    {selectedUser?.name?.charAt(0).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{selectedUser?.name || "Select a conversation"}</CardTitle>
                  <CardDescription>
                    {selectedUser ? `@${selectedUser.username}` : ""}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent 
              className="flex-1 overflow-y-auto p-4 space-y-4" 
              ref={chatContainerRef}
            >
              {!selectedUser ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    Select a conversation to start chatting
                  </div>
                </div>
              ) : (
                <>
                  {isFetchingMore && (
                    <div className="text-center text-gray-400 py-2">
                      Loading older messages...
                    </div>
                  )}
                  
                  {messages.map((msg) => {
                    const isMe = msg.sender_id === userId
                    return (
                      <div 
                        key={msg._id} 
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-2xl ${
                            isMe
                              ? "bg-[#9290C3] text-white rounded-br-md"
                              : "bg-[#1B1A55] text-white rounded-bl-md"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p className="text-xs text-white/70 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  
                  <div ref={messagesEndRef} />
                </>
              )}
            </CardContent>

            <div className="border-t p-4">
              <div className="flex items-end w-full space-x-2">
                <Button variant="outline" size="icon" className="shrink-0">
                  <PaperclipIcon className="h-4 w-4" />
                </Button>

                <Textarea
                  placeholder={
                    selectedUser 
                      ? `Message ${selectedUser.name}...` 
                      : "Select a user to start chatting"
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="min-h-10 flex-1 resize-none"
                  rows={1}
                  disabled={!selectedUser}
                />

                <Button
                  className="bg-[#9290C3] hover:bg-[#7B68EE] shrink-0"
                  onClick={handleSendMessage}
                  disabled={message.trim() === "" || !selectedUser}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
