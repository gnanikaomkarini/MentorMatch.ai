import Footer from "@/components/footer"
import Navbar from "@/components/navbar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-white dark:bg-gray-900 py-40">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center gap-8 text-center">
            <div className="space-y-12">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                About <span className="text-purple-600 dark:text-purple-400">MentorMatch.ai</span>
              </h1>
              <p className="text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                We're on a mission to revolutionize skill development through personalized mentorship and AI-powered
                learning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section (Unchanged) */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">Our Mission</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              To connect learners with expert mentors and provide personalized learning paths that accelerate skill
              development and career growth.
            </p>
            <div className="flex justify-center">
              <div className="w-20 h-1 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              We believe that everyone deserves access to quality mentorship and guidance. By combining human expertise
              with artificial intelligence, we create learning experiences that are tailored to each individual's goals,
              learning style, and pace.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section (Timeline) */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Story</h2>
            <div className="relative space-y-12">
              {/* Timeline Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-purple-600 dark:bg-purple-400"></div>

              {/* Milestone 1: The Beginning */}
              <div className="relative flex flex-col md:flex-row items-center gap-6">
                <div className="md:w-1/2 text-right pr-8">
                  <h3 className="text-xl font-semibold">The Idea</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">May 2025</p>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    MentorMatch.ai was born out of a shared frustration with traditional learning platforms. 
                    While courses offered content, learners struggled with motivation, direction, and personalized support. 
                    We envisioned a solution that combined the structure of AI with the empathy of real mentors.
                  </p>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
                <div className="md:w-1/2"></div>
              </div>

              {/* Milestone 2: The Innovation */}
              <div className="relative flex flex-col md:flex-row items-center gap-6">
                <div className="md:w-1/2"></div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
                <div className="md:w-1/2 text-left pl-8">
                  <h3 className="text-xl font-semibold">The Innovation</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">June 2025</p>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    We built an intelligent platform that matches mentees with mentors based on goals,
                    skills, learning style, and availability. Our AI generates dynamic roadmaps and
                    adapts based on progress—while mentors provide real guidance, feedback, and accountability.
                  </p>
                </div>
              </div>

              {/* Milestone 3: Today */}
              <div className="relative flex flex-col md:flex-row items-center gap-6">
                <div className="md:w-1/2 text-right pr-8">
                  <h3 className="text-xl font-semibold">The Impact</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">July 2025 & Beyond</p>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    In just weeks, MentorMatch.ai grew into a thriving mentorship ecosystem. 
                    Today, learners from all over the world use our platform to connect with industry experts,
                    build real skills, and reach their career goals—faster and smarter.
                  </p>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
                <div className="md:w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-7">
            <TeamMember
              name="Gnanika Omkarini Makkena"
              role="gnanikaomkarini@gmail.com"
              image="/placeholder.svg?height=300&width=300"
              bio="BVRIT HYDERABAD College of Engineering from Women"
            />
            <TeamMember
              name="Radhika Sharda"
              role="shardaradhika25@gmail.com"
              image="/placeholder.svg?height=300&width=300"
              bio="NITK SURATHKAL"
            />
            <TeamMember
              name="Dyuthi Vivek"
              role="dyuthi.vivek@gmail.com"
              image="/placeholder.svg?height=300&width=300"
              bio="IIIT Bangalore"
            />
            <TeamMember
              name="Dhaksha Muthukumaran"
              role="dhaksha768@gmail.com"
              image="/placeholder.svg?height=300&width=300"
              bio=" R. V. College of Engineering"
            />
            <TeamMember
              name="Harshita Agarwal"
              role="harshitaa2809@gmail.com"
              image="/placeholder.svg?height=300&width=300"
              bio="Indira Gandhi Delhi Technical University for Women (IGDTUW)"
            />
          </div>
        </div>
      </section>

      {/* CTA Section (Unchanged) */}
      <section className="py-20 bg-purple-600 text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our Community</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Whether you're looking to learn new skills or share your expertise, MentorMatch.ai has a place for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100">
              <Link href="/signup?role=mentee">Join as Mentee</Link>
            </Button>
            <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100">
              <Link href="/signup?role=mentor">Become a Mentor</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function TeamMember({
  name,
  role,
  image,
  bio,
}: {
  name: string
  role: string
  image: string
  bio: string
}) {
  return (
    <div className="text-center">
      <Avatar className="w-40 h-40 rounded-full mx-auto mb-4">
        <AvatarFallback className="bg-gray-200 dark:bg-gray-700">
          <User className="h-16 w-16 text-gray-600 dark:text-gray-300" />
        </AvatarFallback>
      </Avatar>
      <h3 className="text-xl font-semibold">{name}</h3>
      <p className="text-purple-600 dark:text-purple-400">{role}</p>
      <p className="text-gray-600 dark:text-gray-300 mt-2">{bio}</p>
    </div>
  )
}