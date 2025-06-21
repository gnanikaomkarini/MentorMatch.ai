"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Volume2, Mic, RotateCcw, Check, Loader2 } from "lucide-react"

// Mock questions data (replace with API call)
const mockQuestions: { [key: number]: { id: number; text: string; audioUrl: string }[] } = {
  3: [
    { id: 1, text: "Explain the concept of state in React.", audioUrl: "/mock-audio/react-state.mp3" },
    { id: 2, text: "What is the difference between props and state?", audioUrl: "/mock-audio/props-vs-state.mp3" },
    { id: 3, text: "How do you handle side effects in React?", audioUrl: "/mock-audio/react-side-effects.mp3" },
  ],
  7: [
    { id: 1, text: "What is CI/CD and why is it important?", audioUrl: "/mock-audio/ci-cd.mp3" },
    { id: 2, text: "Explain how Docker containers work.", audioUrl: "/mock-audio/docker.mp3" },
    { id: 3, text: "Describe the process of deploying an application to AWS.", audioUrl: "/mock-audio/aws-deployment.mp3" },
  ],
}

export default function InterviewPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const moduleId = parseInt(searchParams.get("moduleId") || "0")
  const [showInstructions, setShowInstructions] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [questions, setQuestions] = useState(mockQuestions[moduleId] || [])
  const [answers, setAnswers] = useState<{ questionId: number; audioBlob: Blob | null; transcript: string; attempts: number }[]>(
    questions.map((q) => ({ questionId: q.id, audioBlob: null, transcript: "", attempts: 0 }))
  )
  const [recording, setRecording] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize SpeechRecognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = Array.from(event.results as SpeechRecognitionResultList)
            .map((result: SpeechRecognitionResult) => result[0].transcript)
            .join("")
          setAnswers((prev) =>
            prev.map((ans, i) =>
              i === currentQuestionIndex ? { ...ans, transcript } : ans
            )
          )
        }
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error:", event.error)
        }
        recognitionRef.current = recognition
      }
    }
  }, [currentQuestionIndex])

  // Fetch questions (mocked for now)
  useEffect(() => {
    console.log(`Fetching questions for moduleId: ${moduleId}`)
  }, [moduleId])

  // Play question audio automatically
  useEffect(() => {
    if (questions[currentQuestionIndex] && audioRef.current) {
      audioRef.current.src = questions[currentQuestionIndex].audioUrl
      audioRef.current.play().catch((err) => console.error("Audio playback error:", err))
    }
  }, [currentQuestionIndex, questions])

  const startRecording = async () => {
    if (answers[currentQuestionIndex].attempts >= 3) {
      alert("Maximum recording attempts reached.")
      return
    }

    // Start 3-second countdown
    setCountdown(3)
    let count = 3
    const interval = setInterval(() => {
      count--
      setCountdown(count)
      if (count === 0) {
        clearInterval(interval)
        setCountdown(null)
        initiateRecording()
      }
    }, 1000)
  }

  const initiateRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        setAnswers((prev) =>
          prev.map((ans, i) =>
            i === currentQuestionIndex
              ? { ...ans, audioBlob, attempts: ans.attempts + 1 }
              : ans
          )
        )
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorderRef.current.start()
      if (recognitionRef.current) {
        recognitionRef.current.start()
      } else {
        console.warn("Speech recognition is not available. Transcript will be empty.")
      }
      setRecording(true)
    } catch (err) {
      console.error("Error starting recording:", err)
      alert("Failed to start recording. Please check microphone permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      setRecording(false)
    }
  }

  const recordAgain = () => {
    if (answers[currentQuestionIndex].attempts >= 3) {
      alert("Maximum recording attempts reached.")
      return
    }
    setAnswers((prev) =>
      prev.map((ans, i) =>
        i === currentQuestionIndex ? { ...ans, audioBlob: null, transcript: "" } : ans
      )
    )
    startRecording()
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const submitInterview = async () => {
    setIsSubmitting(true)
    console.log("Submitting answers:", answers)
    setIsSubmitting(false)
    setShowSuccess(true)
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 flex items-center justify-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Interview Submitted Successfully</CardTitle>
            <CardDescription>Your responses have been recorded</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 dark:text-gray-400">
              Thank you for completing the interview for Module {moduleId}. Your answers have been submitted and will be reviewed.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => router.push("/roadmap")}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Back to Roadmap
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!moduleId || !questions.length) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Invalid Interview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 dark:text-gray-400">Invalid module selected. Please return to the roadmap.</p>
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

  if (showInstructions) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 flex items-center justify-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Interview Instructions</CardTitle>
            <CardDescription>Prepare for your module interview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Welcome to the interview for Module {moduleId}!</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>You will answer 3 questions related to the module.</li>
              <li>Each question will be played as audio and displayed as text.</li>
              <li>Record your answer using the microphone (a 3-second countdown will precede recording).</li>
              <li>You have up to 3 attempts to record each answer.</li>
              <li>Your speech will be converted to text for review (if supported by your browser).</li>
              <li>Click "Done Recording" to confirm your answer and move to the next question.</li>
              <li>After answering all questions, submit your responses.</li>
              <li>Ensure your microphone is enabled and your browser supports speech recognition.</li>
            </ul>
            {!(window.SpeechRecognition || (window as any).webkitSpeechRecognition) && (
              <p className="text-red-500">
                Speech recognition is not supported in your browser. You can still record audio answers, but transcripts will not be generated. Use Chrome or Edge for full functionality.
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => setShowInstructions(false)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Start Interview
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = answers[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 flex items-center justify-center">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Interview - Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
          <CardDescription>Module {moduleId}: {questions[0]?.text.split('.')[0]}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <p className="text-lg font-medium">{currentQuestion.text}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => audioRef.current?.play()}
              disabled={!audioRef.current}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
            <audio ref={audioRef} className="hidden" />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Attempts used: {currentAnswer.attempts} / 3
            </p>
            {currentAnswer.transcript && (
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium">Your Answer:</p>
                <p className="text-sm">{currentAnswer.transcript}</p>
              </div>
            )}
          </div>

          <div className="flex justify-center items-center space-x-4">
            {countdown !== null ? (
              <p className="text-2xl font-bold">{countdown}</p>
            ) : recording ? (
              <Button
                onClick={stopRecording}
                className="bg-red-600 hover:bg-red-700"
                disabled={!recording}
              >
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Stop Recording
              </Button>
            ) : (
              <Button
                onClick={startRecording}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={currentAnswer.attempts >= 3}
              >
                <Mic className="mr-2 h-4 w-4" />
                Record Answer
              </Button>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={recordAgain}
            disabled={currentAnswer.attempts >= 3 || !currentAnswer.audioBlob || recording}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Record Again
          </Button>
          {currentQuestionIndex < questions.length - 1 ? (
            <Button
              onClick={nextQuestion}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={!currentAnswer.audioBlob || recording}
            >
              Done Recording
            </Button>
          ) : (
            <Button
              onClick={submitInterview}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={!currentAnswer.audioBlob || recording || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Submit Interview
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}