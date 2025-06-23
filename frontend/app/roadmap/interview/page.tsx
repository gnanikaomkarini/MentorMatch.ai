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
  const historyRef = useRef<InterviewHistory[]>([])
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  
  // Error handling
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [isListening, setIsListening] = useState(false)

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

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = 'en-US'
        
        recognitionRef.current.onstart = () => {
          console.log("🎤 Speech recognition started")
          setIsListening(true)
        }
        
        recognitionRef.current.onend = () => {
          console.log("🎤 Speech recognition ended")
          setIsListening(false)
        }
        
        recognitionRef.current.onerror = (event) => {
          console.error("❌ Speech recognition error:", event.error)
          setIsListening(false)
          setError("Speech recognition failed. Please try again.")
        }
      }
    } else {
      console.warn("⚠️ Speech recognition not supported in this browser")
    }
  }, [])

  // Fix 1: Change how we send history for the first call
  const startInterview = async () => {
    if (!roadmapId) {
      return
    }
    
    setIsProcessing(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append('roadmap_id', roadmapId)
      formData.append('interview_num', interviewNum.toString())
      formData.append('history', '')

      const response = await fetch('http://localhost:5000/api/ai/interview', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      if (!response.ok) {
        let errorText = ''
        try {
          const errorData = await response.json()
          errorText = errorData.message || 'Unknown error from server'
        } catch {
          const textResponse = await response.text()
          errorText = textResponse || 'Unknown error from server'
        }
        setError(errorText)
        throw new Error('Failed to start interview')
      }

      const data = await response.json()
      
      setCurrentQuestion(data.next_question)
      setAiAudioUrl(`http://localhost:5000/ai-speech.mp3?ts=${Date.now()}&rnd=${Math.random()}`)
      setInterviewStarted(true)
      
      // 🔥 Reset both ref and state
      historyRef.current = []
      setHistory([])
      
      setTimeout(() => {
        playAIResponse()
      }, 500)

    } catch (err) {
      setError("Failed to start interview")
    } finally {
      setIsProcessing(false)
    }
  }

  // Simplified audio playback function
  const playAIResponse = () => {
    if (!aiAudioRef.current) {
      console.error("❌ Audio element not found")
      return
    }

    setIsAIPlaying(true)
    // Force reload by resetting src with a new query string
    const uniqueUrl = `http://localhost:5000/ai-speech.mp3?ts=${Date.now()}&rnd=${Math.random()}`
    aiAudioRef.current.src = ""
    aiAudioRef.current.src = uniqueUrl
    setAiAudioUrl(uniqueUrl)

    aiAudioRef.current.load()
    aiAudioRef.current.play()
      .then(() => {
        console.log("✅ AI audio playing successfully")
      })
      .catch((err) => {
        console.error("❌ Audio playback error:", err)
        setIsAIPlaying(false)
        setError("Failed to play AI response")
      })
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
        stream.getTracks().forEach((track) => track.stop())
        
        // Stop speech recognition
        if (recognitionRef.current && isListening) {
          recognitionRef.current.stop()
        }
        
        processRecording()
      }

      // Start both audio recording and speech recognition
      mediaRecorderRef.current.start()
      
      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start()
      }
      
      setRecording(true)
      console.log("🔴 Recording and speech recognition started successfully")
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

  // Modified recording process with frontend transcript generation
  const processRecording = async () => {
    if (audioChunksRef.current.length === 0) {
      setError("No audio recorded")
      return
    }

    setIsProcessing(true)
    setError("")

    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      
      // Save the recorded audio locally
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const fileName = `mentee-response-${roadmapId}-interview${interviewNum}-q${historyRef.current.length + 1}-${timestamp}.webm`
      
      // Create download link to save audio locally
      const audioUrl = URL.createObjectURL(audioBlob)
      const link = document.createElement('a')
      link.href = audioUrl
      link.download = fileName
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(audioUrl)
      
      console.log(`💾 Audio saved locally as: ${fileName}`)
      console.log(`📁 Location: User's Downloads folder`)
      
      // 🔥 WAIT FOR FRONTEND TRANSCRIPT
      console.log("⏳ Waiting for speech recognition to complete...")
      
      // Wait for speech recognition to finish and get transcript
      const transcript = await new Promise<string>((resolve) => {
        if (recognitionRef.current) {
          recognitionRef.current.onresult = (event) => {
            let finalTranscript = ''
            for (let i = event.resultIndex; i < event.results.length; i++) {
              if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript
              }
            }
            console.log("🎤 Frontend transcript generated:", finalTranscript)
            resolve(finalTranscript || "No transcript generated")
          }
          
          // Set a timeout in case speech recognition doesn't work
          setTimeout(() => {
            resolve("Transcript not available")
          }, 2000)
        } else {
          resolve("Speech recognition not available")
        }
      })

      // 🔥 UPDATE HISTORY IMMEDIATELY with frontend transcript
      const newHistoryItem = {
        question: currentQuestion,
        answer: transcript
      }
      
      // Update ref immediately (synchronous)
      historyRef.current = [...historyRef.current, newHistoryItem]
      
      // Update state for UI
      setHistory([...historyRef.current])
      
      console.log("🆕 HISTORY UPDATED BEFORE API CALL:")
      console.log("=== HISTORY START ===")
      historyRef.current.forEach((item, index) => {
        console.log(`Q${index + 1}: ${item.question}`)
        console.log(`A${index + 1}: ${item.answer}`)
        console.log("---")
      })
      console.log("=== HISTORY END ===")
      console.log("📊 Total Q&A pairs:", historyRef.current.length)
      
      // 🔥 NOW build history string with UPDATED history
      let historyString = ""
      if (historyRef.current.length > 0) {
        const historyItems = historyRef.current.map(item =>
          `{"question": "${item.question.replace(/"/g, '\\"')}", ` +
          `"answer": "${item.answer.replace(/"/g, '\\"')}"}`
        )
        historyString = historyItems.join(",")
      }

      console.log("📝 Updated history being sent to API:", historyString)

      const formData = new FormData()
      formData.append('audio', audioBlob, 'response.webm')
      formData.append('roadmap_id', roadmapId!)
      formData.append('interview_num', interviewNum.toString())
      formData.append('history', historyString)

      console.log("🚀 Making POST API call with updated history...")

      const response = await fetch('http://localhost:5000/api/ai/interview', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to process interview response')
      }

      const data = await response.json()
      console.log("📨 API Response received:", data)

      // Check if interview should end
      const isEnding = data.next_question.toLowerCase().includes("thank you") || 
                      data.next_question.toLowerCase().includes("feedback") ||
                      data.next_question.toLowerCase().includes("that concludes") ||
                      historyRef.current.length >= 5

      if (isEnding) {
        console.log("🎯 Interview ending detected")
        setInterviewEnded(true)
        setAiAudioUrl('http://localhost:5000/ai-speech.mp3')
        setTimeout(() => {
          playAIResponse()
        }, 500)
      } else {
        console.log("➡️ Continuing to next question")
        setCurrentQuestion(data.next_question)
        setAiAudioUrl('http://localhost:5000/ai-speech.mp3')
        setTimeout(() => {
          playAIResponse()
        }, 500)
      }
      
    } catch (err) {
      console.error("❌ Process Recording Error:", err)
      setError("Failed to process your response. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  // End interview
  const endInterview = async () => {
    try {
      // Prepare feedback payload
      const feedbackPayload = {
        roadmap_id: roadmapId,
        interview_num: interviewNum,
        history: historyRef.current, // already in array of {question, answer}
      }

      // Send feedback to backend
      const response = await fetch('http://localhost:5000/api/ai/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(feedbackPayload),
      })

      if (!response.ok) {
        setError("Failed to submit interview for feedback")
        return
      }

      // Optionally handle response data if needed
      setShowSuccess(true)
    } catch (err) {
      setError("Failed to submit interview for feedback")
    }
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
          {/* Current Question Display - Show generic message */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">AI Interviewer:</h4>
                <p className="text-blue-700 dark:text-blue-300">
                  {/* Remove the question text, show only instruction */}
                  Listen carefully to the AI interviewer's question and answer after the audio finishes.
                </p>
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
                <span>{historyRef.current.length}/~5</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((historyRef.current.length / 5) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {!interviewEnded && (
            <Button
              variant="outline"
              onClick={() => router.push(`/roadmap?id=${roadmapId}`)}
            >
              Exit Interview
            </Button>
          )}
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