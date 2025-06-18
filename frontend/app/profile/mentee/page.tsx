'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { User, Edit, ArrowLeft } from 'lucide-react';

// Define the shape of the onboarding data
interface MenteeProfile {
  careerGoal: string;
  skillLevel: string;
  timeCommitment: number;
  learningStyle: string;
  interests: string[];
}

export default function MenteeProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<MenteeProfile | null>(null);
  const [userName, setUserName] = useState<string>('User'); // Placeholder for user name
  const [userEmail, setUserEmail] = useState<string>('user@example.com'); // Placeholder for user email

  // Fetch profile data (placeholder: localStorage or API)
  useEffect(() => {
    // Example: Retrieve from localStorage (replace with API call in production)
    const storedProfile = localStorage.getItem('menteeProfile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
    // Placeholder: Fetch user name and email (e.g., from auth context or API)
    setUserName('John Doe'); // Replace with actual user data
    setUserEmail('john.doe@example.com'); // Replace with actual user data
  }, []);

  // Format career goal and other fields for display
  const formatCareerGoal = (goal: string) => {
    const goalMap: { [key: string]: string } = {
      frontend: 'Frontend Developer',
      backend: 'Backend Developer',
      fullstack: 'Full Stack Developer',
      data: 'Data Scientist',
      ai: 'AI/ML Engineer',
      devops: 'DevOps Engineer',
      mobile: 'Mobile Developer',
      other: 'Other',
    };
    return goalMap[goal] || goal;
  };

  const formatSkillLevel = (level: string) => {
    const levelMap: { [key: string]: string } = {
      beginner: 'Beginner - Just starting out',
      intermediate: 'Intermediate - Some experience',
      advanced: 'Advanced - Experienced but looking to grow',
      expert: 'Expert - Looking for specialized guidance',
    };
    return levelMap[level] || level;
  };

  const formatLearningStyle = (style: string) => {
    const styleMap: { [key: string]: string } = {
      visual: 'Visual - Diagrams, videos, demonstrations',
      reading: 'Reading - Documentation and tutorials',
      practical: 'Practical - Building projects',
      social: 'Social - Discussion and collaboration',
    };
    return styleMap[style] || style;
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading Profile...</CardTitle>
            <CardDescription>Please wait while we fetch your profile.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Link href="/dashboard/mentee" className="flex items-center text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        {/* Profile Card */}
        <Card className="w-full">
          <CardHeader className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-gray-200 dark:bg-gray-700">
                <User className="h-12 w-12 text-gray-600 dark:text-gray-300" />
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <CardTitle className="text-2xl font-bold">{userName}</CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">{userEmail}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Career Goal */}
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Career Goal</Label>
              <p className="text-lg text-gray-900 dark:text-gray-100">{formatCareerGoal(profile.careerGoal)}</p>
            </div>

            {/* Skill Level */}
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Skill Level</Label>
              <p className="text-lg text-gray-900 dark:text-gray-100">{formatSkillLevel(profile.skillLevel)}</p>
            </div>

            {/* Time Commitment */}
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Commitment</Label>
              <p className="text-lg text-gray-900 dark:text-gray-100">{profile.timeCommitment} hours per week</p>
            </div>

            {/* Learning Style */}
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Learning Style</Label>
              <p className="text-lg text-gray-900 dark:text-gray-100">{formatLearningStyle(profile.learningStyle)}</p>
            </div>

            {/* Interests */}
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Interests</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.interests.length > 0 ? (
                  profile.interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                      {interest}
                    </Badge>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No interests selected</p>
                )}
              </div>
            </div>

            {/* Edit Profile Button */}
            <div className="flex justify-end">
              <Button
                onClick={() => router.push('/onboarding/mentee')} // Redirect to onboarding for editing
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Edit className="h-5 w-5 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}