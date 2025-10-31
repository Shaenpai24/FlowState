# 🚀 FlowState - Proactive Workflow Orchestrator

**The AI-powered productivity system that adapts to your workflow and protects your focus.**

FlowState isn't just another to-do app—it's a comprehensive productivity orchestrator that uses AI to plan your work, a browser extension to protect your focus, and real-time analytics to optimize your workflow.

## ✨ Key Features

### 🧠 AI Task Decomposition
- **Smart Breakdown**: Automatically decompose complex tasks into manageable, actionable steps
- **Context-Aware**: AI understands your project context and creates relevant subtasks
- **One-Click Magic**: Transform overwhelming projects into clear action items instantly

### ⚡ Flow Sessions
- **Focus Protection**: Browser extension blocks distracting websites during work sessions
- **Real-Time Monitoring**: Track your focus score and productivity in real-time
- **Smart Nudges**: Gentle reminders when you drift off-track, with options to snooze or refocus

### 📊 Intelligent Analytics
- **Productivity Insights**: Understand your peak performance hours and patterns
- **Focus Metrics**: Track distraction patterns and focus improvement over time
- **AI Recommendations**: Get personalized suggestions to optimize your workflow

### 🎯 Multi-View Workspace
- **Kanban Board**: Visual task management with drag-and-drop functionality
- **List View**: Detailed task overview with advanced filtering and sorting
- **Calendar View**: Timeline-based planning with deadline tracking
- **Analytics Dashboard**: Comprehensive productivity metrics and insights

### ⌨️ Command Palette
- **Universal Search**: Find anything instantly with Cmd+K
- **Quick Actions**: Create tasks, start flow sessions, switch views without lifting your hands
- **Smart Suggestions**: Context-aware commands based on your current workflow

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Modern Stack**: Vite + React 18 + TypeScript for blazing-fast development
- **Beautiful UI**: Tailwind CSS + Radix UI for accessible, polished components
- **Smooth Animations**: Framer Motion for delightful micro-interactions
- **State Management**: Zustand for predictable, performant state handling

### Browser Extension
- **Manifest V3**: Modern Chrome extension with service worker architecture
- **Cross-Tab Communication**: Seamless integration between web app and extension
- **Smart Blocking**: Intelligent distraction detection with customizable allow-lists
- **Persistent Sessions**: Session state survives browser restarts

### AI Integration
- **Task Decomposition**: OpenAI API integration for intelligent task breakdown
- **Smart Suggestions**: Context-aware recommendations for workflow optimization
- **Productivity Insights**: AI-powered analysis of work patterns and focus metrics

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Install Browser Extension
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `extension` folder
4. The FlowState Focus Guardian extension is now active!

### 4. Create Your First Project
1. Open the app at `http://localhost:5173`
2. Complete the onboarding flow
3. Create your first project and tasks
4. Start a Flow Session and experience the magic!

### 5. Import Sample Tasks (Optional)
- Use the sample `sample-tasks.json` file to quickly populate your project
- Click the Import button in the top bar or use Cmd+K → "Import Tasks"

## 🎨 New Features

### ✅ **Dark Mode Support**
- Beautiful dark theme with optimized color palette
- Automatic system theme detection
- Toggle with the theme button in top bar

### ✅ **Task Import/Export**
- Import tasks from JSON files
- Export your tasks for backup or sharing
- Sample JSON format provided

### ✅ **Enhanced Profile Menu**
- Dropdown menu with profile options
- Quick access to settings and import
- Professional user experience

## 🎯 Demo Flow (Perfect for Hackathon Judges)

### The 3-Minute "Wow" Demo

1. **The Problem** (30s)
   - "We're all distracted. Our productivity tools are just dumb lists."

2. **The Solution** (60s)
   - Show the dashboard
   - Add a big task: "Win this hackathon"
   - Click "AI Decompose" → BAM! Auto-populated subtasks
   - *Judges are impressed* ✨

3. **The "Awe" Moment** (90s)
   - Click "Start Flow Session" on a coding task
   - Show productive browsing (GitHub, docs)
   - Switch to YouTube → BAM! Focus overlay appears
   - *This is your biggest "wow" moment* 🤯

4. **The Polish** (30s)
   - Show the analytics dashboard with focus metrics
   - "It's not just a to-do list; it's a proactive partner"

## 🛠️ Technical Highlights

### High-Velocity Integration
- **Multi-layered Architecture**: Web app + Browser extension + AI services
- **Real-time Communication**: WebSocket-like messaging between components
- **Persistent State**: Survives page refreshes and browser restarts

### Enterprise-Grade UX
- **Micro-interactions**: Every action feels fluid and responsive
- **Progressive Disclosure**: Complex features revealed contextually
- **Anticipatory Design**: UI predicts and adapts to user needs
- **Accessibility First**: Full keyboard navigation and screen reader support

### Performance Optimizations
- **Code Splitting**: Lazy-loaded routes and components
- **Optimistic Updates**: Instant UI feedback with background sync
- **Efficient Rendering**: Virtualized lists and memoized components
- **Smart Caching**: Intelligent data persistence and retrieval

## 🎨 Design Philosophy

### Emotional Design
- **Delightful Moments**: Subtle animations that create joy
- **Confidence Building**: Clear feedback and progress indicators
- **Flow State**: Minimal cognitive load, maximum focus

### Spatial Memory
- **Consistent Layouts**: Users develop muscle memory
- **Logical Grouping**: Related features stay together
- **Visual Hierarchy**: Important actions are prominent

## 🔮 Future Roadmap

### Phase 1: Core Enhancement
- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] Team collaboration features
- [ ] Mobile companion app
- [ ] Advanced AI insights

### Phase 2: Ecosystem Expansion
- [ ] Slack/Discord integration
- [ ] GitHub/GitLab project sync
- [ ] Time tracking integrations
- [ ] Custom AI model training

### Phase 3: Enterprise Features
- [ ] Team analytics and reporting
- [ ] Admin dashboard and controls
- [ ] SSO and enterprise security
- [ ] Custom workflow templates

## 🏆 Why FlowState Wins

### Innovation
- **First-of-its-kind**: Proactive workflow orchestration with AI + browser integration
- **Technical Complexity**: Multi-layered system that "just works"
- **Real Problem**: Addresses genuine productivity pain points

### Execution
- **Polished UX**: Feels like a mature product, not a hackathon demo
- **Technical Depth**: Sophisticated architecture with real-world applicability
- **Demo Impact**: Immediate "wow" factor that judges remember

### Market Potential
- **Huge TAM**: Every knowledge worker needs better productivity tools
- **Monetization Ready**: Clear path to SaaS business model
- **Scalable Architecture**: Built to handle millions of users

---

**Built with ❤️ for the hackathon by the FlowState team**

*Ready to enter your flow state? Let's build the future of productivity together.*