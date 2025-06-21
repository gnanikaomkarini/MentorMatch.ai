"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle } from "lucide-react"

type Question = {
  question: string
  options: { [key: string]: string }
  correct_option: string
}

const MOCK_QUESTIONS: Question[] = [
  {
    question: "What is React?",
    options: { A: "A library for UI", B: "A database", C: "A CSS framework", D: "A server" },
    correct_option: "A",
  },
  {
    question: "Which hook manages state?",
    options: { A: "useFetch", B: "useState", C: "useRouter", D: "useEffect" },
    correct_option: "B",
  },
  {
    question: "How do you pass data to a child component?",
    options: { A: "With state", B: "With props", C: "With context", D: "With hooks" },
    correct_option: "B",
  },
  {
    question: "Which is NOT a valid React lifecycle method?",
    options: { A: "componentDidMount", B: "componentWillUnmount", C: "componentDidUpdate", D: "componentWillRender" },
    correct_option: "D",
  },
  {
    question: "What does JSX stand for?",
    options: { A: "JavaScript XML", B: "Java Syntax Extension", C: "JavaScript XHR", D: "JavaScript Xtreme" },
    correct_option: "A",
  },
]

export default function AssessmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const moduleId = searchParams.get("moduleId") || "1"

  const [questions] = useState<Question[]>(MOCK_QUESTIONS)
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const handleOption = (option: string) => {
    if (selected) return
    setSelected(option)
    setShowAnswer(true)
    if (option === questions[current].correct_option) setScore((s) => s + 1)
    setTimeout(() => {
      setSelected(null)
      setShowAnswer(false)
      if (current < questions.length - 1) setCurrent((c) => c + 1)
      else setDone(true)
    }, 1200)
  }

  const handleEnd = () => {
    router.push("/roadmap")
  }

  if (!questions.length)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
        <div className="text-xl font-semibold text-gray-700">Loading...</div>
      </div>
    )

  if (done)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
        <Card className="w-full max-w-lg shadow-2xl border-0">
          <CardHeader className="flex flex-col items-center">
            <CardTitle className="text-2xl mb-2">Assessment Complete</CardTitle>
            <div className="flex items-center gap-2 text-lg">
              {score >= 4 ? (
                <CheckCircle className="text-green-500 h-7 w-7" />
              ) : (
                <XCircle className="text-red-500 h-7 w-7" />
              )}
              <span>
                Your Score: <span className="font-bold">{score} / {questions.length}</span>
              </span>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {score >= 4 ? (
              <div className="text-green-600 font-semibold text-lg mb-2">Congratulations! You passed.</div>
            ) : (
              <div className="text-red-600 font-semibold text-lg mb-2">You did not pass. Please retake the assessment.</div>
            )}
            <Progress value={(score / questions.length) * 100} className="w-2/3 h-3 mt-2" />
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={handleEnd} className="px-8 py-2 text-lg rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg">
              End Assessment
            </Button>
          </CardFooter>
        </Card>
      </div>
    )

  const q = questions[current]
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-lg shadow-2xl border-0">
        <CardHeader className="flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">Question {current + 1} of {questions.length}</span>
            <Progress value={((current) / questions.length) * 100} className="w-32 h-2" />
          </div>
          <CardTitle className="text-xl text-center">{q.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mt-4">
            {Object.entries(q.options).map(([key, value]) => {
              const isCorrect = key === q.correct_option
              const isSelected = selected === key
              let btnClass =
                "w-full py-3 text-base rounded-xl transition-all duration-200 border border-gray-300 bg-white text-gray-900"
              if (selected) {
                if (isSelected && isCorrect) btnClass += " ring-2 ring-green-400"
                else if (isSelected && !isCorrect) btnClass += " ring-2 ring-red-400"
                else if (isCorrect) btnClass += " ring-2 ring-green-200"
              } else {
                btnClass += " hover:border-blue-400 hover:bg-blue-50"
              }
              return (
                <button
                  key={key}
                  className={btnClass}
                  onClick={() => handleOption(key)}
                  disabled={!!selected}
                >
                  <span className="mr-2 font-bold">{key}.</span> {value}
                  {showAnswer && isSelected && isCorrect && (
                    <span className="ml-2 text-green-600 font-bold">(Correct)</span>
                  )}
                  {showAnswer && isSelected && !isCorrect && (
                    <span className="ml-2 text-red-600 font-bold">(Your Answer)</span>
                  )}
                  {showAnswer && !isSelected && isCorrect && (
                    <span className="ml-2 text-green-600 font-bold">(Correct Answer)</span>
                  )}
                </button>
              )
            })}
          </div>
          {showAnswer && selected !== q.correct_option && (
            <div className="mt-6 text-center text-base text-gray-700">
              <span className="font-semibold">Correct answer:</span>{" "}
              <span className="text-green-700 font-semibold">{q.options[q.correct_option]}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <span className="text-gray-400 text-xs">Choose the best answer to continue</span>
        </CardFooter>
      </Card>
    </div>
  )
}