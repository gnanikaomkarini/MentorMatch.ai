"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Person {
  id: number
  name: string
  role: string
  avatar?: string
  status?: string
  lastActive?: string
  matchScore?: number
}

interface HorizontalScrollCardsProps {
  title: string
  people: Person[]
  onCardClick: (id: number) => void
  emptyMessage: string
  type: "mentors" | "mentees"
}

export default function HorizontalScrollCards({
  title,
  people,
  onCardClick,
  emptyMessage,
  type,
}: HorizontalScrollCardsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef
      const scrollAmount = 300
      if (direction === "left") {
        current.scrollBy({ left: -scrollAmount, behavior: "smooth" })
      } else {
        current.scrollBy({ left: scrollAmount, behavior: "smooth" })
      }
    }
  }

  if (people.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={() => scroll("left")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => scroll("right")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {people.map((person) => (
          <Card
            key={person.id}
            className="min-w-[250px] cursor-pointer hover:border-purple-400 transition-colors"
            onClick={() => onCardClick(person.id)}
          >
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-16 w-16 mb-2">
                  <AvatarImage src={person.avatar || "/placeholder.svg"} alt={person.name} />
                  <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h4 className="font-medium">{person.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{person.role}</p>

                {person.matchScore && <Badge className="mt-2 bg-purple-600">{person.matchScore}% Match</Badge>}

                {person.status && (
                  <div className="flex items-center mt-2">
                    <span
                      className={`h-2 w-2 rounded-full mr-1 ${
                        person.status === "online" ? "bg-green-500" : "bg-gray-400"
                      }`}
                    ></span>
                    <span className="text-xs capitalize">{person.status}</span>
                  </div>
                )}

                {person.lastActive && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Last active: {person.lastActive}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
