import Footer from "@/components/footer"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { ArrowRight, Award, BookOpen, Calendar, CheckCircle, Users } from "lucide-react"
import Link from "next/link"
import type React from "react"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 py-48">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center gap-12 text-center">
            <div className="space-y-8">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                Find Your Perfect Mentor with <span className="text-purple-600 dark:text-purple-400">AI</span>
              </h1>
              <p className="text-2xl text-gray-600 dark:text-gray-300 max-w-4xl text-center mx-auto leading-relaxed">
                MentorMatch.ai uses artificial intelligence to connect you with mentors who match your goals, learning style, and schedule.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  <Link href="/signup?role=mentee" className="flex items-center gap-2">
                    Join as Mentee <ArrowRight size={16} />
                  </Link>
                </Button>
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  <Link href="/signup?role=mentor" className="flex items-center gap-2">
                    Become a Mentor <ArrowRight size={16} />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How MentorMatch.ai Works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Users className="h-10 w-10 text-purple-600" />}
              title="AI-Powered Matching"
              description="Our algorithm analyzes your goals, learning style, and schedule to find your ideal mentor match."
            />
            <FeatureCard
              icon={<BookOpen className="h-10 w-10 text-purple-600" />}
              title="Personalized Roadmaps"
              description="Get a custom learning path with curated resources based on your commitment timeframe."
            />
            <FeatureCard
              icon={<Calendar className="h-10 w-10 text-purple-600" />}
              title="Flexible Learning"
              description="Learn at your own pace with structured modules and regular check-ins with your mentor."
            />
            <FeatureCard
              icon={<Award className="h-10 w-10 text-purple-600" />}
              title="Skill Certification"
              description="Earn certificates by completing assessments to validate your newly acquired skills."
            />
            <FeatureCard
              icon={<CheckCircle className="h-10 w-10 text-purple-600" />}
              title="AI Interviewer"
              description="Practice with our AI interviewer to identify strengths and areas for improvement."
            />
            <FeatureCard
              icon={<Users className="h-10 w-10 text-purple-600" />}
              title="Mentor Support"
              description="Connect with your mentor via chat or video calls to get personalized guidance."
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <FAQItem
              question="How do I get started with MentorMatch.ai?"
              answer="Sign up as a mentee, complete your profile, and our AI will match you with suitable mentors. You'll then receive a personalized roadmap based on your goals and timeframe."
            />
            <FAQItem
              question="How are mentors vetted?"
              answer="All mentors go through a thorough application process, including verification of their expertise, experience, and teaching ability. We also collect and monitor feedback from mentees."
            />
            <FAQItem
              question="Is there a cost to use MentorMatch.ai?"
              answer="We offer both free and premium tiers. The free tier includes basic matching and limited roadmap features, while premium unlocks full access to all features, including unlimited mentor sessions."
            />
            <FAQItem
              question="How does the AI matching work?"
              answer="Our AI analyzes your skills, goals, learning style, and availability to find mentors who are most compatible with your needs. It considers factors like expertise areas, communication preferences, and personality traits."
            />
            <FAQItem
              question="How much time do I need to commit?"
              answer="You decide your own commitment level. During onboarding, you'll specify how much time you can dedicate weekly, and the AI will generate a roadmap that fits your schedule."
            />
            <FAQItem
              question="What kind of certificates can I earn?"
              answer="You can earn skill-specific certificates at two levels: Standard and Advanced. These certificates validate your knowledge and can be shared on your professional profiles."
            />
            <FAQItem
              question="Can I change my mentor if we're not a good match?"
              answer="Yes, you can request a new mentor match if you feel your current match isn't working out. Our goal is to ensure productive mentorship relationships."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-purple-600 text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Accelerate Your Growth?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join MentorMatch.ai today and start your journey with a personalized roadmap and expert guidance.
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

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  )
}

function TestimonialCard({ quote, author, role }: { quote: string; author: string; role: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
      <p className="italic text-gray-600 dark:text-gray-300 mb-4">"{quote}"</p>
      <div>
        <p className="font-semibold">{author}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{role}</p>
      </div>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
      <h3 className="text-xl font-semibold mb-2">{question}</h3>
      <p className="text-gray-600 dark:text-gray-300">{answer}</p>
    </div>
  )
}
