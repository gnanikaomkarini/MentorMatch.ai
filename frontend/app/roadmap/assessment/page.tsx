"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

type Question = {
  question: string
  options: { [key: string]: string }
  correct_option?: string
}

export default function AssessmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const moduleId = searchParams.get("moduleId") || "0"
  const roadmapId = searchParams.get("roadmapId")

  const [questions, setQuestions] = useState<Question[]>([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]) // Track all answers
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [submittingScore, setSubmittingScore] = useState(false)
  const [previousScore, setPreviousScore] = useState<number | null>(null)
  const [assessmentResult, setAssessmentResult] = useState<{
    current_score: number
    best_score: number
    correct_answers: number
    total_questions: number
    passed: boolean
  } | null>(null)

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!roadmapId || !moduleId) {
        setError("Missing roadmap ID or module ID")
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/roadmaps/${roadmapId}/${moduleId}/assessment/get`,
          {
            credentials: "include",
          }
        )

        const data = await response.json()

        if (!response.ok) {
          setError(data.message || "Failed to fetch questions")
          return
        }

        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions)
        } else {
          setError("No questions found for this assessment")
        }
      } catch (err) {
        setError("Failed to load assessment questions")
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [roadmapId, moduleId])

  // Check if assessment was already taken
  useEffect(() => {
    const checkPreviousScore = async () => {
      if (!roadmapId) return

      try {
        const response = await fetch(`http://localhost:5000/api/roadmaps/${roadmapId}`, {
          credentials: "include",
        })

        if (response.ok) {
          const roadmapData = await response.json()
          const userId = await getUserId()
          
          if (roadmapData.assessment_scores && roadmapData.assessment_scores[userId]) {
            const moduleScores = roadmapData.assessment_scores[userId]
            if (moduleScores[moduleId] !== undefined) {
              setPreviousScore(moduleScores[moduleId])
            }
          }
        }
      } catch (err) {
        console.error("Failed to check previous score:", err)
      }
    }

    checkPreviousScore()
  }, [roadmapId, moduleId])

  const getUserId = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/profile", {
        credentials: "include",
      })
      const data = await response.json()
      return data.user.id
    } catch {
      return null
    }
  }

  const handleOption = (option: string) => {
    if (selected) return
    setSelected(option)
    setShowAnswer(true)
    
    // Make sure we're only storing the option key (A, B, C, D)
    const newAnswers = [...selectedAnswers]
    
    // Ensure we're storing just the key, not any prefix
    const cleanOption = option.replace(/^option\s+/i, '') // Remove "option " prefix if present
    newAnswers[current] = cleanOption.trim().toUpperCase() // Store as uppercase A, B, C, D
    setSelectedAnswers(newAnswers)
    
    // Debug logging
    console.log("Raw option received:", option)
    console.log("Clean option stored:", cleanOption.trim().toUpperCase())
    console.log("Updated answers array:", newAnswers)
    
    setTimeout(async () => {
      setSelected(null)
      setShowAnswer(false)
      
      if (current < questions.length - 1) {
        setCurrent((c) => c + 1)
      } else {
        // This is the last question - submit immediately
        console.log("Final answers before submission:", newAnswers)
        await submitAssessment(newAnswers)
        setDone(true)
      }
    }, 1200)
  }

  const submitAssessment = async (answers: string[]) => {
    if (!roadmapId || submittingScore) return

    setSubmittingScore(true)
    
    // Log the request body before sending
    const requestBody = {
      selected_answers: answers,
    }
    console.log("Request body being sent:", requestBody)
    
    try {
      const response = await fetch(
        `http://localhost:5000/api/roadmaps/${roadmapId}/${moduleId}/assessment/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(requestBody),
        }
      )

      const data = await response.json()
      
      // Log the backend response
      console.log("Backend response:", data)
      console.log("Response status:", response.status)

      if (!response.ok) {
        console.error("Error response:", data)
        setError(data.message || "Failed to submit assessment")
        return
      }

      setAssessmentResult({
        current_score: data.current_score,
        best_score: data.best_score,
        correct_answers: data.correct_answers,
        total_questions: data.total_questions,
        passed: data.passed
      })
      
      // Update previous score with the new best score
      setPreviousScore(data.best_score)
      
    } catch (err) {
      console.error("Network error:", err)
      setError("Failed to submit assessment")
    } finally {
      setSubmittingScore(false)
    }
  }

  const handleEnd = () => {
    router.push(`/roadmap?id=${roadmapId}`)
  }

  // Enhanced text formatting function
  const formatText = (text: string) => {
    if (!text) return ""
    
    // Handle code blocks with proper formatting
    let formatted = text
      // Multi-line code blocks
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono my-3"><code>$2</code></pre>')
      // Inline code
      .replace(/`([^`\n]+)`/g, '<code class="bg-gray-800 text-green-300 px-2 py-1 rounded text-sm font-mono">$1</code>')
      // Bold text
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold">$1</strong>')
      // Italic text
      .replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')
      // Line breaks
      .replace(/\n/g, '<br>')
    
    return formatted
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading assessment...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-900 dark:to-gray-800">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!questions.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">No questions available for this assessment.</div>
      </div>
    )
  }

  if (done && assessmentResult) {
    const { current_score, best_score, correct_answers, total_questions, passed } = assessmentResult

    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-lg shadow-2xl border-0">
          <CardHeader className="flex flex-col items-center">
            <CardTitle className="text-2xl mb-2">Assessment Complete</CardTitle>
            <div className="flex items-center gap-2 text-lg">
              {passed ? (
                <CheckCircle className="text-green-500 h-7 w-7" />
              ) : (
                <XCircle className="text-red-500 h-7 w-7" />
              )}
              <span>
                Your Score: <span className="font-bold">{correct_answers} / {total_questions}</span>
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Percentage: <span className="font-semibold">{current_score}%</span>
            </div>
            {best_score > current_score && (
              <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                Best Score: <span className="font-semibold">{best_score}%</span>
              </div>
            )}
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {passed ? (
              <div className="text-green-600 dark:text-green-400 font-semibold text-lg mb-2 text-center">
                🎉 Congratulations! You passed!
                {current_score > (previousScore || 0) && (
                  <div className="text-sm text-green-500 mt-1">New best score!</div>
                )}
              </div>
            ) : (
              <div className="text-red-600 dark:text-red-400 font-semibold text-lg mb-2 text-center">
                You did not pass. You can retake the assessment.
                {previousScore && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Previous best: {previousScore}%
                  </div>
                )}
              </div>
            )}
            
            <Progress value={current_score} className="w-2/3 h-3 mt-2" />
            
            {/* Score breakdown */}
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg w-full">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 text-center">Score Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Correct Answers:</span>
                  <span className="font-medium text-green-600">{correct_answers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Questions:</span>
                  <span className="font-medium">{total_questions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Score:</span>
                  <span className="font-medium">{current_score}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Best Score:</span>
                  <span className="font-medium text-blue-600">{best_score}%</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>Status:</span>
                  <span className={`font-medium ${passed ? 'text-green-600' : 'text-red-600'}`}>
                    {passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
              </div>
            </div>
            
            {previousScore !== null && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Assessment History</h4>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  This assessment has been taken before.
                  {best_score >= 80 ? 
                    " You have already passed this module." : 
                    " Keep practicing to improve your score!"
                  }
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              onClick={handleEnd} 
              className="px-8 py-2 text-lg rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
              disabled={submittingScore}
            >
              {submittingScore ? "Saving..." : "End Assessment"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Add loading state for when submitting assessment
  if (done && !assessmentResult && submittingScore) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-lg shadow-2xl border-0">
          <CardContent className="flex flex-col items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Calculating your score...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Please wait while we process your assessment</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const q = questions[current]
  const hasCorrectAnswer = q.correct_option !== undefined

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-4xl shadow-2xl border-0 mx-4">
        <CardHeader className="flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Question {current + 1} of {questions.length}
            </span>
            <Progress value={((current) / questions.length) * 100} className="w-32 h-2" />
          </div>
          
          {/* Previous Assessment Indicator */}
          {previousScore !== null && (
            <div className="w-full mb-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-300 text-center">
                ⚠️ You've taken this assessment before (Score: {previousScore}%). You can retake to improve.
              </p>
            </div>
          )}
          
          <CardTitle className="text-xl text-center leading-relaxed max-w-3xl">
            <div 
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ 
                __html: formatText(q.question) 
              }} 
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 mt-4 max-w-3xl mx-auto">
            {Object.entries(q.options).map(([key, value]) => {
              const isCorrect = hasCorrectAnswer && key === q.correct_option
              const isSelected = selected === key
              let btnClass =
                "w-full py-4 px-6 text-left text-base rounded-xl transition-all duration-200 border-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 relative"
              
              if (selected) {
                if (isSelected && isCorrect) {
                  btnClass += " border-green-400 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-200"
                } else if (isSelected && !isCorrect && hasCorrectAnswer) {
                  btnClass += " border-red-400 bg-red-50 dark:bg-red-900/20 ring-2 ring-red-200"
                } else if (isCorrect && hasCorrectAnswer) {
                  btnClass += " border-green-300 bg-green-50 dark:bg-green-900/20"
                } else {
                  btnClass += " border-gray-200 dark:border-gray-600"
                }
              } else {
                btnClass += " border-gray-200 dark:border-gray-600 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer"
              }
              
              return (
                <button
                  key={key}
                  className={btnClass}
                  onClick={() => {
                    console.log("Button clicked with key:", key) // Debug log
                    handleOption(key)
                  }}
                  disabled={!!selected}
                >
                  <div className="flex items-start gap-4">
                    <span className="font-bold text-purple-600 dark:text-purple-400 flex-shrink-0 text-lg">{key}.</span>
                    <div 
                      className="flex-1 prose prose-sm max-w-none dark:prose-invert text-left"
                      dangerouslySetInnerHTML={{ 
                        __html: formatText(value) 
                      }} 
                    />
                  </div>
                  
                  {showAnswer && hasCorrectAnswer && (
                    <div className="absolute top-2 right-2">
                      {isSelected && isCorrect && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">Correct ✓</span>
                      )}
                      {isSelected && !isCorrect && (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">Wrong ✗</span>
                      )}
                      {!isSelected && isCorrect && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">Correct ✓</span>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
          
          {showAnswer && hasCorrectAnswer && selected !== q.correct_option && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg max-w-3xl mx-auto">
              <div className="text-center">
                <span className="font-semibold text-green-700 dark:text-green-300">Correct answer: </span>
                <span className="text-green-800 dark:text-green-200 font-semibold">
                  {q.correct_option}
                </span>
                <div className="mt-2 text-sm text-green-600 dark:text-green-400 italic">
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ 
                      __html: formatText(q.options[q.correct_option!]) 
                    }} 
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <span className="text-gray-400 dark:text-gray-500 text-xs">
            {current === questions.length - 1 ? "Last question - your score will be calculated automatically!" : "Choose the best answer to continue"}
          </span>
        </CardFooter>
      </Card>
    </div>
  )
}