import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-white dark:bg-gray-900 py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                About <span className="text-purple-600 dark:text-purple-400">MentorMatch.ai</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-xl">
                We're on a mission to revolutionize skill development through personalized mentorship and AI-powered
                learning.
              </p>
            </div>
            <div className="flex-1">
              <img
                src="/placeholder.svg?height=400&width=500"
                alt="Team Collaboration"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
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

      {/* Story Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Our Story</h2>
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-1/3">
                  <img src="/placeholder.svg?height=200&width=200" alt="Founding" className="rounded-lg shadow-md" />
                </div>
                <div className="md:w-2/3 space-y-4">
                  <h3 className="text-xl font-semibold">The Beginning</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    MentorMatch.ai was founded in 2024 by a team of educators, technologists, and industry experts who
                    recognized a gap in traditional learning models. They saw that while online courses provided
                    content, learners often lacked the guidance and accountability that comes from personalized
                    mentorship.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-1/3 md:order-2">
                  <img src="/placeholder.svg?height=200&width=200" alt="Development" className="rounded-lg shadow-md" />
                </div>
                <div className="md:w-2/3 md:order-1 space-y-4">
                  <h3 className="text-xl font-semibold">The Innovation</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    By integrating AI with human mentorship, we created a platform that could analyze learning patterns,
                    generate personalized roadmaps, and provide continuous feedback while maintaining the irreplaceable
                    human connection of mentor-mentee relationships.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-1/3">
                  <img src="/placeholder.svg?height=200&width=200" alt="Growth" className="rounded-lg shadow-md" />
                </div>
                <div className="md:w-2/3 space-y-4">
                  <h3 className="text-xl font-semibold">Today</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Today, MentorMatch.ai serves thousands of learners across the globe, connecting them with expert
                    mentors in fields ranging from software development to data science, design, and business. Our
                    AI-powered platform continues to evolve, learning from each mentorship relationship to improve the
                    experience for everyone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <TeamMember
              name="Alex Chen"
              role="Founder & CEO"
              image="/placeholder.svg?height=300&width=300"
              bio="Former tech lead with 15+ years of experience in education technology."
            />
            <TeamMember
              name="Sarah Johnson"
              role="Chief Learning Officer"
              image="/placeholder.svg?height=300&width=300"
              bio="PhD in Educational Psychology with expertise in personalized learning."
            />
            <TeamMember
              name="Michael Rodriguez"
              role="CTO"
              image="/placeholder.svg?height=300&width=300"
              bio="AI researcher and engineer with a passion for human-centered technology."
            />
            <TeamMember
              name="Priya Patel"
              role="Head of Mentorship"
              image="/placeholder.svg?height=300&width=300"
              bio="Career coach and mentor with experience at top tech companies."
            />
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 border rounded-lg">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">5,000+</div>
              <p className="text-xl">Mentees</p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Learners who have accelerated their skill development through our platform
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">500+</div>
              <p className="text-xl">Expert Mentors</p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Industry professionals sharing their knowledge and experience
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">85%</div>
              <p className="text-xl">Success Rate</p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Mentees who achieve their learning goals within their target timeframe
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-purple-700">
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
      <img src={image || "/placeholder.svg"} alt={name} className="w-40 h-40 rounded-full mx-auto mb-4 object-cover" />
      <h3 className="text-xl font-semibold">{name}</h3>
      <p className="text-purple-600 dark:text-purple-400">{role}</p>
      <p className="text-gray-600 dark:text-gray-300 mt-2">{bio}</p>
    </div>
  )
}
