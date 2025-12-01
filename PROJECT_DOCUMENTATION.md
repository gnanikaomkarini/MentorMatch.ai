# MentorMatch.ai - Project Documentation

## 📋 Overview

MentorMatch.ai is a sophisticated **AI-powered mentorship platform** that connects mentees with mentors and provides intelligent features to enhance the learning experience. The platform leverages advanced AI capabilities to automate and personalize the mentorship journey.

## 🏗️ Architecture

### Frontend (Next.js + TypeScript)
- **Framework**: Next.js 15.2.4 with React 18
- **Styling**: Tailwind CSS with Radix UI components
- **Language**: TypeScript for type safety
- **Features**: Theme support (light/dark mode), responsive design

### Backend (Flask + Python)
- **Framework**: Flask 2.3.3 REST API
- **Database**: MongoDB with PyMongo
- **Authentication**: JWT-based authentication
- **CORS**: Enabled for frontend communication

### AI Integration
- **Gemini 2.5 Flash**: AI-powered features and content generation
- **AssemblyAI**: Speech transcription and NLP
- **Serper API**: Web search enrichment for learning resources
- **gTTS**: Text-to-speech functionality

## 🚀 Core Features

### 1. AI-Powered Mentor Matching
```python
def match_mentor_mentee(mentee_skills, mentee_experience):
    # Uses Gemini AI to analyze mentee requirements
    # Compares with mentor profiles (skills, experience, style)
    # Returns best match with reasoning
```
- Analyzes mentee goals, skills, and learning preferences
- Matches with mentors based on expertise and compatibility
- Provides reasoning for match recommendations

### 2. Real-Time Chat System
- WebSocket-like polling for real-time messaging
- Mentor-mentee communication platform
- **AI Assistant Integration**: Type `@AI Assistant` to trigger AI features
- Message history with pagination
- File attachment support

### 3. AI-Generated Personalized Roadmaps
```python
def create_roadmap(skill):
    # Generates 6-8 learning modules
    # Each module has objectives and subtopics
    # Uses Serper API for resource enrichment
    # Customized based on experience level
```
- Creates structured learning paths with 6-8 modules
- Each module includes objectives and subtopics
- Enriched with web resources via Serper API
- Customized based on mentee's experience level

### 4. Dynamic Roadmap Updates
- Mentors can trigger updates via chat using `@AI Assistant`
- AI analyzes conversation history to adjust learning paths
- Real-time module modifications based on progress
- Adaptive content based on mentee feedback

### 5. AI-Powered Mock Interviews
- **Scheduled at key milestones** (midpoint and completion)
- **Voice-based interviews** using speech recognition
- **Dynamic question generation** based on learning goals
- **AI feedback reports** sent privately to mentors
- Simulates real-world interview scenarios

### 6. Module-Based Assessments
- AI-generated quizzes after each module completion
- Progress tracking and retention measurement
- Adaptive difficulty based on performance
- Comprehensive learning analytics

### 7. Notifications System
- Real-time alerts for messages and updates
- Session reminders and milestone notifications
- Roadmap update notifications
- Interview scheduling alerts

## 🗄️ Database Structure

### MongoDB Collections

#### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  username: String (unique),
  role: "mentor" | "mentee",
  profile: {
    skills: [String],
    experience: String,
    bio: String,
    availability: [String],
    languages: [String],
    // Role-specific fields
  },
  mentees: [ObjectId], // For mentors
  mentors: [ObjectId], // For mentees
  roadmap_id: ObjectId,
  created_at: Date,
  updated_at: Date
}
```

#### Roadmaps Collection
```javascript
{
  _id: ObjectId,
  menteeId: ObjectId,
  status: "in-progress" | "completed",
  durationWeeks: Number,
  approvalStatus: {
    mentorId: ObjectId,
    status: "pending" | "approved",
    comments: String
  },
  interviewTrigger: {
    type: String,
    triggerPoint: String
  },
  modules: [{
    title: String,
    objective: String,
    subtopics: [String],
    resources: [Object],
    completed: Boolean
  }],
  interview_theme_1: String,
  interview_theme_2: String,
  interview_feedback_1: String,
  interview_feedback_2: String,
  created_at: Date,
  updated_at: Date
}
```

#### Messages Collection
```javascript
{
  _id: ObjectId,
  sender_id: ObjectId,
  receiver_id: ObjectId,
  content: String,
  timestamp: Date,
  read: Boolean
}
```

#### Other Collections
- `meetings` - Scheduled sessions
- `notifications` - System notifications
- `interview_questions` - AI-generated interview content
- `ai_learning_data` - Learning analytics

## 🔐 Authentication & Security

### JWT Authentication
- Token-based authentication system
- Secure API endpoints with middleware protection
- Role-based access control (mentor/mentee)
- Session management with refresh tokens

### Security Features
- Environment-based configuration
- CORS protection
- Input validation and sanitization
- Password hashing with Werkzeug

## 🎯 User Journey

### For Mentees
1. **Sign up** and complete profile with goals/skills
2. **AI matches** with suitable mentor based on compatibility
3. **Receive personalized roadmap** generated by AI
4. **Chat with mentor** and get real-time guidance
5. **Complete modules** with AI-generated assessments
6. **Take AI mock interviews** at key milestones
7. **Track progress** through comprehensive dashboard

### For Mentors
1. **Sign up** with expertise and availability details
2. **Get matched** with mentees by AI algorithm
3. **Review/approve AI-generated roadmaps**
4. **Guide mentees** through real-time chat
5. **Trigger roadmap updates** using `@AI Assistant`
6. **Receive AI interview feedback** about mentee progress
7. **Schedule meetings** and track mentee growth

## 🤖 AI Integration Points

### 1. Mentor-Mentee Matching
- Gemini analyzes compatibility factors
- Considers skills, experience, and learning styles
- Provides match reasoning and confidence scores

### 2. Roadmap Generation
- Creates structured learning paths
- Generates module objectives and subtopics
- Enriches content with relevant resources

### 3. Chat Assistant
- Responds to `@AI Assistant` mentions
- Provides contextual help and guidance
- Triggers roadmap updates based on conversations

### 4. Interview Conductor
- Generates dynamic interview questions
- Evaluates responses using NLP
- Provides detailed feedback reports

### 5. Assessment Creator
- Builds module-specific quizzes
- Adapts difficulty based on performance
- Tracks learning progress and retention

### 6. Progress Analysis
- Provides insights and recommendations
- Identifies learning gaps and strengths
- Suggests optimization strategies

## 🛠️ Technology Stack

### Frontend Dependencies
```json
{
  "next": "15.2.4",
  "react": "^18.2.0",
  "typescript": "^5.4.5",
  "tailwindcss": "^3.4.17",
  "@radix-ui/react-*": "Various versions",
  "lucide-react": "^0.454.0",
  "react-hook-form": "^7.54.1",
  "zod": "^3.24.1"
}
```

### Backend Dependencies
```txt
Flask==2.3.3
Flask-CORS==4.0.0
pymongo==4.5.0
python-dotenv==1.0.0
PyJWT==2.8.0
assemblyai
gTTS
```

### Development Tools
- Docker support with docker-compose.yml
- Environment-based configuration
- Git version control
- IDE configuration (.idea folder)

## 📁 Project Structure

```
MentorMatch.ai/
├── frontend/                 # Next.js frontend
│   ├── app/                 # App router pages
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utility functions
│   └── types/               # TypeScript definitions
├── backend/                 # Flask backend
│   ├── routes/              # API route handlers
│   ├── models/              # Database models
│   ├── services/            # Business logic
│   ├── utils/               # Helper utilities
│   ├── middleware/          # Authentication middleware
│   └── database/            # Database configuration
├── .env                     # Environment variables
├── docker-compose.yml       # Docker configuration
└── requirements.txt         # Python dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB instance
- API keys for Gemini, AssemblyAI, and Serper

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/mentormatch.ai.git
cd mentormatch.ai
```

2. **Install frontend dependencies**
```bash
cd frontend
npm ci
```

3. **Install backend dependencies**
```bash
cd ../backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

4. **Set up environment variables**
Create a `.env` file with:
```env
MONGO_URI=your-mongodb-uri
DB_NAME=your-db-name
JWT_SECRET_KEY=your-jwt-secret
FLASK_DEBUG=True
SECRET_KEY=your-secret-key
PORT=5000
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=your-gemini-api-key
ASSEMBLYAI_API_KEY=your-assemblyai-api-key
SERPER_API_KEY=your-serper-api-key
```

5. **Run the application**

Frontend:
```bash
cd frontend
npm run dev
```

Backend:
```bash
cd backend
source .venv/bin/activate
python app.py
```

Access the application at `http://localhost:3000`

## 💡 Unique Value Proposition

MentorMatch.ai stands out by:

- **Automating repetitive mentor tasks** (roadmap creation, assessments)
- **Providing personalized learning paths** for every mentee
- **Creating a continuous feedback loop** to track growth
- **Blending human mentorship with AI scalability**
- **Offering voice-based interview practice** with AI evaluation
- **Real-time adaptive learning** based on progress and feedback

## 🔮 Future Enhancements

- Video calling integration
- Advanced analytics dashboard
- Mobile application
- Multi-language support
- Integration with learning platforms
- Gamification features
- Community features and forums

## 📄 License

This project is built with ❤️ to make mentorship smarter and more accessible.

---

*Last updated: December 1, 2025*
