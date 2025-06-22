"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Volume2, Mic, RotateCcw, Check, Loader2, Play, Pause } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface InterviewHistory {
  question: string
  answer: string
}

export default function AIInterviewPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const moduleId = parseInt(searchParams.get("moduleId") || "0")
  const roadmapId = searchParams.get("roadmapId")
  const interviewNum = parseInt(searchParams.get("interviewNum") || "1")
  
  // Interview state
  const [showInstructions, setShowInstructions] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [interviewEnded, setInterviewEnded] = useState(false)
  
  // Current question and response
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [isAIPlaying, setIsAIPlaying] = useState(false)
  const [aiAudioUrl, setAiAudioUrl] = useState<string | null>(null)
  
  // Recording state
  const [recording, setRecording] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Interview history and context
  const [history, setHistory] = useState<InterviewHistory[]>([])
  const [interviewContext, setInterviewContext] = useState("")
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const aiAudioRef = useRef<HTMLAudioElement | null>(null)
  
  // Error handling
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  // Fetch roadmap data and interview context on mount
  useEffect(() => {
    const fetchRoadmapData = async () => {
      if (!roadmapId) {
        setError("No roadmap ID provided")
        setLoading(false)
        return
      }

      console.log("🔍 Fetching roadmap data...")
      console.log("Request URL:", `http://localhost:5000/api/roadmaps/${roadmapId}`)
      console.log("Request Method: GET")
      console.log("Request Headers:", { credentials: "include" })

      try {
        const response = await fetch(`http://localhost:5000/api/roadmaps/${roadmapId}`, {
          credentials: "include",
        })
        
        console.log("📥 Roadmap API Response Status:", response.status)
        console.log("📥 Roadmap API Response Headers:", Object.fromEntries(response.headers.entries()))
        
        if (!response.ok) {
          console.error("❌ Roadmap API Error - Response not OK")
          throw new Error("Failed to fetch roadmap data")
        }
        
        const roadmapData = await response.json()
        console.log("📥 Roadmap API Response Body:", roadmapData)
        
        const context = interviewNum === 1 
          ? roadmapData.interview_theme_1 
          : roadmapData.interview_theme_2
          
        console.log("🎯 Interview Context Retrieved:", context)
        
        if (!context) {
          console.error(`❌ Interview ${interviewNum} context not found in roadmap data`)
          setError(`Interview ${interviewNum} context not set by mentor`)
          setLoading(false)
          return
        }
        
        setInterviewContext(context)
        console.log("✅ Roadmap data fetched successfully")
      } catch (err) {
        console.error("❌ Roadmap API Error:", err)
        setError("Failed to load interview data")
      } finally {
        setLoading(false)
      }
    }

    fetchRoadmapData()
  }, [roadmapId, interviewNum])

  // Start the interview with the first question
  const startInterview = async () => {
    if (!roadmapId || !interviewContext) {
      console.error("❌ Cannot start interview - missing roadmapId or interviewContext")
      return
    }
    
    setIsProcessing(true)
    setError("")
    
    try {
      const formData = new FormData()
      formData.append('roadmap_id', roadmapId)
      formData.append('interview_num', interviewNum.toString())
      // For first call, send empty history as string "null" or empty array
      formData.append('history', 'null')

      // Log the request details
      console.log("🚀 Starting interview API call...")
      console.log("Request URL:", 'http://localhost:5000/api/ai/interview')
      console.log("Request Method: POST")
      console.log("Request Headers:", { 
        credentials: 'include',
        'Content-Type': 'multipart/form-data'
      })
      console.log("📤 Start Interview Request Body:")
      console.log("  - roadmap_id:", roadmapId)
      console.log("  - interview_num:", interviewNum.toString())
      console.log("  - history:", 'null')
      console.log("  - audio file:", "None (initial call)")

      const response = await fetch('http://localhost:5000/api/ai/interview', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      console.log("📥 Start Interview API Response Status:", response.status)
      console.log("📥 Start Interview API Response Headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        console.error("❌ Start Interview API Error - Response not OK")
        const errorText = await response.text()
        console.error("❌ Error Response Body:", errorText)
        throw new Error('Failed to start interview')
      }

      const data = await response.json()
      console.log("📥 Start Interview API Response Body:", data)
      
      // Set the first question and play audio
      setCurrentQuestion(data.next_question)
      setAiAudioUrl(`http://localhost:5000/${data.audio_path}`)
      setInterviewStarted(true)
      
      // Initialize history as empty array for subsequent calls
      setHistory([])
      
      console.log("✅ Interview started successfully")
      console.log("🎵 AI Audio URL:", `http://localhost:5000/${data.audio_path}`)
      console.log("❓ First Question:", data.next_question)
      
      // Auto-play the first question
      setTimeout(() => {
        playAIResponse()
      }, 500)
      
    } catch (err) {
      console.error("❌ Start Interview Error:", err)
      setError("Failed to start interview")
    } finally {
      setIsProcessing(false)
    }
  }

  // Play AI audio response
  const playAIResponse = () => {
    console.log("🔊 Attempting to play AI audio response...")
    console.log("🎵 Audio URL:", aiAudioUrl)
    console.log("🎵 Audio Element Ready:", !!aiAudioRef.current)
    
    if (aiAudioRef.current && aiAudioUrl) {
      setIsAIPlaying(true)
      aiAudioRef.current.src = aiAudioUrl
      aiAudioRef.current.play()
        .then(() => {
          console.log("✅ AI audio playing successfully")
        })
        .catch((err) => {
          console.error("❌ Audio playback error:", err)
          setIsAIPlaying(false)
        })
    } else {
      console.error("❌ Cannot play audio - missing audio element or URL")
    }
  }

  // Handle AI audio events
  useEffect(() => {
    const audioElement = aiAudioRef.current
    if (!audioElement) return

    const handleAudioEnd = () => {
      console.log("🔇 AI audio playback ended")
      setIsAIPlaying(false)
    }

    const handleAudioError = () => {
      console.error("❌ AI audio playback error")
      setIsAIPlaying(false)
      setError("Failed to play AI response")
    }

    const handleAudioLoadStart = () => {
      console.log("📥 AI audio loading started")
    }

    const handleAudioCanPlay = () => {
      console.log("✅ AI audio can play")
    }

    audioElement.addEventListener('ended', handleAudioEnd)
    audioElement.addEventListener('error', handleAudioError)
    audioElement.addEventListener('loadstart', handleAudioLoadStart)
    audioElement.addEventListener('canplay', handleAudioCanPlay)

    return () => {
      audioElement.removeEventListener('ended', handleAudioEnd)
      audioElement.removeEventListener('error', handleAudioError)
      audioElement.removeEventListener('loadstart', handleAudioLoadStart)
      audioElement.removeEventListener('canplay', handleAudioCanPlay)
    }
  }, [aiAudioUrl])

  // Start recording with countdown
  const startRecording = async () => {
    console.log("🎤 Initiating recording process...")
    
    if (isAIPlaying) {
      console.warn("⚠️ Cannot start recording - AI is still speaking")
      setError("Wait for AI to finish speaking")
      return
    }

    console.log("⏰ Starting 3-second countdown...")
    // Start 3-second countdown
    setCountdown(3)
    let count = 3
    const interval = setInterval(() => {
      count--
      console.log(`⏰ Countdown: ${count}`)
      setCountdown(count)
      if (count === 0) {
        clearInterval(interval)
        setCountdown(null)
        console.log("🎤 Countdown finished, starting recording...")
        initiateRecording()
      }
    }, 1000)
  }

  // Actually start recording
  const initiateRecording = async () => {
    console.log("🎤 Requesting microphone access...")
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      console.log("✅ Microphone access granted")
      console.log("🎤 Audio stream details:", {
        active: stream.active,
        tracks: stream.getTracks().length
      })
      
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
          console.log("🎤 Audio chunk received:", event.data.size, "bytes")
        }
      }

      mediaRecorderRef.current.onstop = () => {
        console.log("🎤 Recording stopped")
        console.log("🎤 Total audio chunks:", audioChunksRef.current.length)
        stream.getTracks().forEach((track) => track.stop())
        processRecording()
      }

      mediaRecorderRef.current.start()
      setRecording(true)
      console.log("🔴 Recording started successfully")
    } catch (err) {
      console.error("❌ Error starting recording:", err)
      setError("Failed to start recording. Please check microphone permissions.")
    }
  }

  // Stop recording
  const stopRecording = () => {
    console.log("⏹️ Stopping recording...")
    
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)
      console.log("⏹️ Recording stop command sent")
    } else {
      console.warn("⚠️ No active recording to stop")
    }
  }

  // Update the processRecording function to handle history correctly
  const processRecording = async () => {
    if (audioChunksRef.current.length === 0) {
      console.error("❌ No audio recorded")
      setError("No audio recorded")
      return
    }

    setIsProcessing(true)
    setError("")

    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      
      const formData = new FormData()
      formData.append('audio', audioBlob, 'response.webm')
      formData.append('roadmap_id', roadmapId!)
      formData.append('interview_num', interviewNum.toString())
      formData.append('history', JSON.stringify(history))

      // Detailed logging for the interview continuation
      console.log("🎤 Processing recorded audio and sending to API...")
      console.log("Request URL:", 'http://localhost:5000/api/ai/interview')
      console.log("Request Method: POST")
      console.log("Request Headers:", { 
        credentials: 'include',
        'Content-Type': 'multipart/form-data'
      })
      console.log("📤 Interview Continuation Request Body:")
      console.log("  - roadmap_id:", roadmapId)
      console.log("  - interview_num:", interviewNum.toString())
      console.log("  - history:", JSON.stringify(history, null, 2))
      console.log("  - audio file size:", audioBlob.size, "bytes")
      console.log("  - audio file type:", audioBlob.type)
      console.log("  - current question being answered:", currentQuestion)

      const response = await fetch('http://localhost:5000/api/ai/interview', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      console.log("📥 Interview Continuation API Response Status:", response.status)
      console.log("📥 Interview Continuation API Response Headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        console.error("❌ Interview Continuation API Error - Response not OK")
        const errorText = await response.text()
        console.error("❌ Error Response Body:", errorText)
        throw new Error('Failed to process interview response')
      }

      const data = await response.json()
      console.log("📥 Interview Continuation API Response Body:", data)

      // Update history: Add the completed Q&A pair from the current exchange
      const newHistory = [...history, {
        question: currentQuestion,
        answer: data.transcript
      }]
      setHistory(newHistory)

      console.log("📝 Updated Interview History:", newHistory)
      console.log("🎵 Next AI Audio URL:", `http://localhost:5000/${data.audio_path}`)
      console.log("❓ Next Question:", data.next_question)

      // Check if interview is ending
      const isEnding = data.next_question.toLowerCase().includes("thank you") || 
                      data.next_question.toLowerCase().includes("feedback") ||
                      data.next_question.toLowerCase().includes("that concludes") ||
                      newHistory.length >= 5

      console.log("🏁 Interview ending check:", {
        includesThankYou: data.next_question.toLowerCase().includes("thank you"),
        includesFeedback: data.next_question.toLowerCase().includes("feedback"),
        includesConclude: data.next_question.toLowerCase().includes("that concludes"),
        historyLength: newHistory.length,
        isEnding: isEnding
      })

      if (isEnding) {
        console.log("🏁 Interview is ending...")
        setInterviewEnded(true)
        setCurrentQuestion(data.next_question)
        setAiAudioUrl(`http://localhost:5000/${data.audio_path}`)
        // Play final message
        setTimeout(() => {
          playAIResponse()
        }, 500)
      } else {
        console.log("▶️ Interview continuing...")
        // Continue interview - set the next question
        setCurrentQuestion(data.next_question)
        setAiAudioUrl(`http://localhost:5000/${data.audio_path}`)
        
        // Auto-play next question
        setTimeout(() => {
          playAIResponse()
        }, 500)
      }
      
      console.log("✅ Interview response processed successfully")
      
    } catch (err) {
      console.error("❌ Process Recording Error:", err)
      setError("Failed to process your response. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  // End interview
  const endInterview = () => {
    setShowSuccess(true)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 flex items-center justify-center">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mr-3" />
            <span>Loading interview...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error && !interviewStarted) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 flex items-center justify-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Interview Error</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/roadmap")} className="bg-purple-600 hover:bg-purple-700">
              Back to Roadmap
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Success state
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 flex items-center justify-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Interview Completed Successfully</CardTitle>
            <CardDescription>Your AI interview has been recorded</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Thank you for completing Interview {interviewNum} for Module {moduleId + 1}. 
                Your responses have been recorded and will be reviewed by your mentor.
              </p>
              
              {/* Show interview summary */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium mb-2">Interview Summary:</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Questions answered: {history.length}</li>
                  <li>• Interview type: {interviewNum === 1 ? "Mid-course" : "Final"} Assessment</li>
                  <li>• Module: {moduleId + 1}</li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => router.push(`/roadmap?id=${roadmapId}`)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Back to Roadmap
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Instructions state
  if (showInstructions) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 flex items-center justify-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>AI Interview Instructions</CardTitle>
            <CardDescription>
              Prepare for your {interviewNum === 1 ? "mid-course" : "final"} AI interview
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Interview Context:</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">{interviewContext}</p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">How it works:</h4>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>The AI interviewer will ask you questions based on the interview context</li>
                <li>Listen to each question carefully (audio will play automatically)</li>
                <li>Click "Record Answer" and speak your response clearly</li>
                <li>The AI will analyze your answer and ask follow-up questions</li>
                <li>The interview typically lasts 4-5 questions</li>
                <li>Ensure your microphone is enabled and working properly</li>
              </ul>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">Tips for success:</h4>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                <li>• Speak clearly and at a moderate pace</li>
                <li>• Provide detailed, thoughtful answers</li>
                <li>• Use examples from your learning experience</li>
                <li>• Don't rush - take time to think before answering</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => {
                setShowInstructions(false)
                startInterview()
              }}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting Interview...
                </>
              ) : (
                "Start AI Interview"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Main interview interface
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 flex items-center justify-center">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>
            AI Interview {interviewNum} - Question {history.length + 1}
          </CardTitle>
          <CardDescription>Module {moduleId + 1}: AI-Powered Assessment</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Current Question Display */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">AI Interviewer:</h4>
                <p className="text-blue-700 dark:text-blue-300">{currentQuestion}</p>
              </div>
              
              {/* Audio Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={playAIResponse}
                  disabled={isAIPlaying || !aiAudioUrl}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {isAIPlaying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            {/* Hidden audio element */}
            <audio ref={aiAudioRef} className="hidden" />
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Recording Controls */}
          <div className="text-center space-y-4">
            {countdown !== null ? (
              <div className="space-y-2">
                <p className="text-lg font-medium">Get ready to speak in...</p>
                <p className="text-4xl font-bold text-purple-600">{countdown}</p>
              </div>
            ) : recording ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <p className="text-lg font-medium">Recording your response...</p>
                </div>
                <Button
                  onClick={stopRecording}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={!recording}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Done Recording
                </Button>
              </div>
            ) : isProcessing ? (
              <div className="space-y-2">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <p className="text-lg font-medium">Processing your response...</p>
              </div>
            ) : (
              <Button
                onClick={startRecording}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={isAIPlaying || countdown !== null}
              >
                <Mic className="mr-2 h-4 w-4" />
                Record Answer
              </Button>
            )}
          </div>

          {/* Interview Progress */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium mb-2">Interview Progress:</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Questions completed</span>
                <span>{history.length}/~5</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((history.length / 5) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => router.push(`/roadmap?id=${roadmapId}`)}
          >
            Exit Interview
          </Button>
          
          {interviewEnded && (
            <Button
              onClick={endInterview}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="mr-2 h-4 w-4" />
              Complete Interview
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}