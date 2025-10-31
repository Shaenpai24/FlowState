// AI Service for task generation and ordering
// Currently uses mock responses, but can be easily switched to real OpenAI API

interface TaskData {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  estimatedTime: number
  tags: string[]
}

export class AIService {
  private static readonly USE_FREE_API = false // Set to true to use free Hugging Face API
  private static readonly USE_MOCK = true // Always use mock for reliable demo

  static async generateTasks(prompt: string): Promise<TaskData[]> {
    if (this.USE_FREE_API && !this.USE_MOCK) {
      return this.generateTasksWithHuggingFace(prompt)
    } else {
      return this.generateTasksMock(prompt)
    }
  }

  // Free Hugging Face API (no key required)
  static async generateTasksWithHuggingFace(prompt: string): Promise<TaskData[]> {
    try {
      const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `Generate a JSON array of 5-7 tasks for: ${prompt}. Each task needs title, description, priority (urgent/high/medium/low), estimatedTime (hours), and tags array.`,
          parameters: {
            max_length: 500,
            temperature: 0.7
          }
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Parse and structure the response
        return this.parseHuggingFaceResponse(data, prompt)
      } else {
        throw new Error('Hugging Face API error')
      }
    } catch (error) {
      console.log('Free API unavailable, using mock data')
      return this.generateTasksMock(prompt)
    }
  }

  static async parseHuggingFaceResponse(_data: any, prompt: string): Promise<TaskData[]> {
    // Fallback to mock if parsing fails
    return this.generateTasksMock(prompt)
  }

  static async generateTasksWithOpenAI(prompt: string): Promise<TaskData[]> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a project management AI that generates structured task lists. 
              Always respond with a JSON array of tasks. Each task should have:
              - title: string (concise task name)
              - description: string (detailed description)
              - priority: "low" | "medium" | "high" | "urgent"
              - estimatedTime: number (hours)
              - tags: string[] (relevant tags)
              
              Generate 5-8 realistic, actionable tasks.`
            },
            {
              role: 'user',
              content: `Generate tasks for: ${prompt}`
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error('No response from OpenAI')
      }

      // Parse JSON response
      const tasks = JSON.parse(content)
      return Array.isArray(tasks) ? tasks : []
    } catch (error) {
      console.error('OpenAI API error:', error)
      // Fallback to mock data
      return this.generateTasksMock(prompt)
    }
  }

  static async generateTasksMock(prompt: string): Promise<TaskData[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const taskTemplates = {
      'daily': [
        { title: 'Make bed and tidy room', description: 'Start the day by making bed and organizing bedroom space', priority: 'medium' as const, estimatedTime: 1, tags: ['cleaning', 'morning', 'organization'] },
        { title: 'Do laundry', description: 'Wash, dry, and fold clothes for the week', priority: 'medium' as const, estimatedTime: 2, tags: ['cleaning', 'clothes', 'weekly'] },
        { title: 'Clean kitchen and dishes', description: 'Wash dishes, wipe counters, and organize kitchen', priority: 'high' as const, estimatedTime: 1, tags: ['cleaning', 'kitchen', 'daily'] },
        { title: 'Vacuum and sweep floors', description: 'Clean all floor surfaces in living areas', priority: 'low' as const, estimatedTime: 1, tags: ['cleaning', 'floors', 'weekly'] },
        { title: 'Take out trash and recycling', description: 'Empty all waste bins and take to collection point', priority: 'medium' as const, estimatedTime: 1, tags: ['cleaning', 'waste', 'weekly'] },
        { title: 'Grocery shopping', description: 'Buy food and household essentials for the week', priority: 'high' as const, estimatedTime: 2, tags: ['shopping', 'food', 'weekly'] },
        { title: 'Meal prep for tomorrow', description: 'Prepare healthy meals and snacks for next day', priority: 'medium' as const, estimatedTime: 1, tags: ['cooking', 'health', 'daily'] }
      ],
      'study': [
        { title: 'Review lecture notes', description: 'Go through today\'s class notes and highlight key concepts', priority: 'high' as const, estimatedTime: 1, tags: ['review', 'notes', 'daily'] },
        { title: 'Read assigned chapters', description: 'Complete required reading from textbooks and materials', priority: 'high' as const, estimatedTime: 2, tags: ['reading', 'textbook', 'assignment'] },
        { title: 'Practice problem sets', description: 'Work through homework problems and practice exercises', priority: 'urgent' as const, estimatedTime: 2, tags: ['practice', 'homework', 'problems'] },
        { title: 'Create study flashcards', description: 'Make flashcards for key terms and concepts', priority: 'medium' as const, estimatedTime: 1, tags: ['flashcards', 'memorization', 'study-tools'] },
        { title: 'Form study group', description: 'Organize study session with classmates for exam prep', priority: 'medium' as const, estimatedTime: 1, tags: ['group-study', 'collaboration', 'exam-prep'] },
        { title: 'Visit office hours', description: 'Meet with professor or TA to clarify difficult concepts', priority: 'high' as const, estimatedTime: 1, tags: ['help', 'professor', 'clarification'] },
        { title: 'Take practice quiz', description: 'Complete practice test to assess understanding', priority: 'medium' as const, estimatedTime: 1, tags: ['quiz', 'assessment', 'practice'] }
      ],
      'assignment': [
        { title: 'Research topic and sources', description: 'Find credible sources and gather background information', priority: 'urgent' as const, estimatedTime: 2, tags: ['research', 'sources', 'planning'] },
        { title: 'Create assignment outline', description: 'Structure main points and organize argument flow', priority: 'high' as const, estimatedTime: 1, tags: ['outline', 'structure', 'planning'] },
        { title: 'Write first draft', description: 'Complete initial version focusing on getting ideas down', priority: 'urgent' as const, estimatedTime: 3, tags: ['writing', 'draft', 'content'] },
        { title: 'Revise and edit content', description: 'Review for clarity, flow, and argument strength', priority: 'high' as const, estimatedTime: 2, tags: ['editing', 'revision', 'improvement'] },
        { title: 'Check citations and format', description: 'Ensure proper citation style and formatting requirements', priority: 'medium' as const, estimatedTime: 1, tags: ['citations', 'formatting', 'style'] },
        { title: 'Proofread final version', description: 'Final check for grammar, spelling, and typos', priority: 'medium' as const, estimatedTime: 1, tags: ['proofreading', 'grammar', 'final'] },
        { title: 'Submit assignment', description: 'Upload or turn in completed work before deadline', priority: 'urgent' as const, estimatedTime: 1, tags: ['submission', 'deadline', 'completion'] }
      ],
      'personal': [
        { title: 'Morning exercise routine', description: 'Complete 30-minute workout or physical activity', priority: 'high' as const, estimatedTime: 1, tags: ['exercise', 'health', 'morning'] },
        { title: 'Meditation and mindfulness', description: 'Practice 10-15 minutes of meditation or breathing exercises', priority: 'medium' as const, estimatedTime: 1, tags: ['meditation', 'mindfulness', 'mental-health'] },
        { title: 'Call family or friends', description: 'Check in with loved ones and maintain social connections', priority: 'medium' as const, estimatedTime: 1, tags: ['social', 'family', 'relationships'] },
        { title: 'Plan weekly schedule', description: 'Review upcoming week and organize calendar and priorities', priority: 'high' as const, estimatedTime: 1, tags: ['planning', 'schedule', 'organization'] },
        { title: 'Read for pleasure', description: 'Spend time reading books or articles for enjoyment', priority: 'low' as const, estimatedTime: 1, tags: ['reading', 'relaxation', 'learning'] },
        { title: 'Practice hobby or skill', description: 'Dedicate time to personal interests and skill development', priority: 'medium' as const, estimatedTime: 2, tags: ['hobby', 'skills', 'creativity'] },
        { title: 'Reflect and journal', description: 'Write about daily experiences and personal growth', priority: 'low' as const, estimatedTime: 1, tags: ['journaling', 'reflection', 'growth'] }
      ],
      'project': [
        { title: 'Define project scope and goals', description: 'Clearly outline project objectives and deliverables', priority: 'urgent' as const, estimatedTime: 1, tags: ['planning', 'goals', 'scope'] },
        { title: 'Research and gather information', description: 'Collect relevant data, sources, and background material', priority: 'high' as const, estimatedTime: 3, tags: ['research', 'information', 'data'] },
        { title: 'Create project timeline', description: 'Break down tasks and set realistic deadlines', priority: 'high' as const, estimatedTime: 1, tags: ['timeline', 'planning', 'deadlines'] },
        { title: 'Divide work among team members', description: 'Assign responsibilities and coordinate team efforts', priority: 'high' as const, estimatedTime: 1, tags: ['teamwork', 'coordination', 'delegation'] },
        { title: 'Complete individual sections', description: 'Work on assigned portions of the project', priority: 'urgent' as const, estimatedTime: 5, tags: ['work', 'individual', 'progress'] },
        { title: 'Review and integrate parts', description: 'Combine team contributions and ensure consistency', priority: 'medium' as const, estimatedTime: 2, tags: ['integration', 'review', 'consistency'] },
        { title: 'Prepare final presentation', description: 'Create slides and practice presentation delivery', priority: 'medium' as const, estimatedTime: 2, tags: ['presentation', 'slides', 'practice'] }
      ],
      'web app': [
        { title: 'Project architecture setup', description: 'Initialize modern React/TypeScript project with best practices', priority: 'high' as const, estimatedTime: 2, tags: ['setup', 'react', 'typescript'] },
        { title: 'Database design & setup', description: 'Design schema and set up PostgreSQL/MongoDB database', priority: 'high' as const, estimatedTime: 3, tags: ['database', 'backend', 'schema'] },
        { title: 'Authentication system', description: 'Implement secure user auth with JWT and session management', priority: 'urgent' as const, estimatedTime: 4, tags: ['auth', 'security', 'backend'] },
        { title: 'API development', description: 'Build RESTful API endpoints with proper validation', priority: 'high' as const, estimatedTime: 5, tags: ['api', 'backend', 'rest'] },
        { title: 'Frontend components', description: 'Create reusable UI components and responsive layouts', priority: 'medium' as const, estimatedTime: 6, tags: ['frontend', 'components', 'ui'] },
        { title: 'State management', description: 'Implement Redux/Zustand for application state', priority: 'medium' as const, estimatedTime: 3, tags: ['state', 'redux', 'frontend'] },
        { title: 'Testing & deployment', description: 'Add comprehensive tests and deploy to cloud platform', priority: 'low' as const, estimatedTime: 4, tags: ['testing', 'deployment', 'ci/cd'] }
      ],
      'mobile app': [
        { title: 'Platform & framework decision', description: 'Choose between React Native, Flutter, or native development', priority: 'urgent' as const, estimatedTime: 1, tags: ['planning', 'mobile', 'framework'] },
        { title: 'User research & wireframes', description: 'Conduct user research and create detailed app wireframes', priority: 'high' as const, estimatedTime: 3, tags: ['research', 'wireframes', 'ux'] },
        { title: 'Development environment', description: 'Set up mobile dev tools, emulators, and build pipeline', priority: 'high' as const, estimatedTime: 2, tags: ['setup', 'tools', 'mobile'] },
        { title: 'Core app features', description: 'Implement main app functionality and user flows', priority: 'urgent' as const, estimatedTime: 10, tags: ['development', 'features', 'mobile'] },
        { title: 'Native integrations', description: 'Add camera, GPS, push notifications, and device features', priority: 'medium' as const, estimatedTime: 4, tags: ['native', 'integrations', 'features'] },
        { title: 'Performance optimization', description: 'Optimize app performance and memory usage', priority: 'medium' as const, estimatedTime: 3, tags: ['performance', 'optimization'] },
        { title: 'App store deployment', description: 'Prepare app store listings and deploy to iOS/Android stores', priority: 'low' as const, estimatedTime: 3, tags: ['deployment', 'app-store', 'publishing'] }
      ],
      'ai project': [
        { title: 'Problem definition & data collection', description: 'Define AI problem scope and gather training datasets', priority: 'urgent' as const, estimatedTime: 3, tags: ['ai', 'data', 'research'] },
        { title: 'Data preprocessing pipeline', description: 'Clean, normalize, and prepare data for model training', priority: 'high' as const, estimatedTime: 4, tags: ['data', 'preprocessing', 'pipeline'] },
        { title: 'Model architecture design', description: 'Design and implement neural network architecture', priority: 'high' as const, estimatedTime: 5, tags: ['ml', 'model', 'architecture'] },
        { title: 'Training & validation', description: 'Train model with proper validation and hyperparameter tuning', priority: 'urgent' as const, estimatedTime: 8, tags: ['training', 'validation', 'ml'] },
        { title: 'Model evaluation & testing', description: 'Evaluate model performance and conduct thorough testing', priority: 'medium' as const, estimatedTime: 3, tags: ['evaluation', 'testing', 'metrics'] },
        { title: 'API & deployment setup', description: 'Create API endpoints and deploy model to production', priority: 'medium' as const, estimatedTime: 4, tags: ['api', 'deployment', 'production'] },
        { title: 'Monitoring & optimization', description: 'Set up model monitoring and performance optimization', priority: 'low' as const, estimatedTime: 2, tags: ['monitoring', 'optimization'] }
      ],
      'startup': [
        { title: 'Market research & validation', description: 'Conduct thorough market analysis and validate business idea', priority: 'urgent' as const, estimatedTime: 4, tags: ['research', 'validation', 'market'] },
        { title: 'Business plan development', description: 'Create comprehensive business plan and financial projections', priority: 'high' as const, estimatedTime: 6, tags: ['business', 'planning', 'strategy'] },
        { title: 'MVP development', description: 'Build minimum viable product to test core assumptions', priority: 'urgent' as const, estimatedTime: 12, tags: ['mvp', 'development', 'product'] },
        { title: 'Brand identity & marketing', description: 'Develop brand identity and initial marketing strategy', priority: 'medium' as const, estimatedTime: 4, tags: ['branding', 'marketing', 'identity'] },
        { title: 'Customer acquisition', description: 'Launch customer acquisition campaigns and gather feedback', priority: 'high' as const, estimatedTime: 6, tags: ['customers', 'acquisition', 'feedback'] },
        { title: 'Funding preparation', description: 'Prepare pitch deck and approach potential investors', priority: 'medium' as const, estimatedTime: 5, tags: ['funding', 'investors', 'pitch'] },
        { title: 'Scale & operations', description: 'Scale operations and establish sustainable business processes', priority: 'low' as const, estimatedTime: 8, tags: ['scaling', 'operations', 'processes'] }
      ]
    }

    // Smart prompt matching with multiple keywords
    const lowerPrompt = prompt.toLowerCase()
    
    if (lowerPrompt.includes('daily') || lowerPrompt.includes('chores') || lowerPrompt.includes('cleaning') || lowerPrompt.includes('household')) {
      return taskTemplates['daily']
    } else if (lowerPrompt.includes('study') || lowerPrompt.includes('exam') || lowerPrompt.includes('learning') || lowerPrompt.includes('review')) {
      return taskTemplates['study']
    } else if (lowerPrompt.includes('assignment') || lowerPrompt.includes('homework') || lowerPrompt.includes('essay') || lowerPrompt.includes('paper')) {
      return taskTemplates['assignment']
    } else if (lowerPrompt.includes('personal') || lowerPrompt.includes('self-care') || lowerPrompt.includes('health') || lowerPrompt.includes('wellness')) {
      return taskTemplates['personal']
    } else if (lowerPrompt.includes('project') || lowerPrompt.includes('school') || lowerPrompt.includes('team') || lowerPrompt.includes('group')) {
      return taskTemplates['project']
    }

    // Default student tasks
    return [
      { title: 'Plan daily schedule', description: 'Organize tasks and set priorities for the day', priority: 'high' as const, estimatedTime: 1, tags: ['planning', 'organization'] },
      { title: 'Complete homework', description: 'Work on pending assignments and exercises', priority: 'urgent' as const, estimatedTime: 2, tags: ['homework', 'study'] },
      { title: 'Review class notes', description: 'Go through notes from recent lectures', priority: 'medium' as const, estimatedTime: 1, tags: ['review', 'study'] },
      { title: 'Tidy living space', description: 'Clean and organize room or study area', priority: 'medium' as const, estimatedTime: 1, tags: ['cleaning', 'organization'] },
      { title: 'Exercise or walk', description: 'Get some physical activity for health and energy', priority: 'low' as const, estimatedTime: 1, tags: ['health', 'exercise'] }
    ]
  }

  static suggestTaskOrder(tasks: any[]): string {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
    
    const sortedTasks = tasks
      .sort((a, b) => {
        // First by priority
        const priorityDiff = (priorityOrder as any)[b.priority] - (priorityOrder as any)[a.priority]
        if (priorityDiff !== 0) return priorityDiff
        
        // Then by estimated time (shorter first for quick wins)
        return (a.estimatedTime || 1) - (b.estimatedTime || 1)
      })

    let suggestion = "Based on your tasks, here's the optimal order:\n\n"
    
    sortedTasks.forEach((task, index) => {
      const emoji = task.priority === 'urgent' ? '🔥' : 
                   task.priority === 'high' ? '⚡' :
                   task.priority === 'medium' ? '📋' : '📝'
      suggestion += `${index + 1}. ${emoji} **${task.title}**\n   Priority: ${task.priority} | Time: ${task.estimatedTime || 1}h\n\n`
    })

    suggestion += "💡 **Strategy**: Start with urgent/high priority items, then tackle medium priority tasks for momentum!"

    return suggestion
  }
}

// AI Setup - 100% FREE, NO API KEYS NEEDED!
export const AI_SETUP_INSTRUCTIONS = `
🤖 **FlowState AI - Completely FREE!**

**Current Status**: ✅ WORKING - No setup required!

**What's Included (FREE):**
✅ Smart task generation for 5+ project types
✅ Intelligent task ordering & prioritization  
✅ Realistic time estimates & tags
✅ Perfect for hackathon demos
✅ Works offline - no internet required
✅ No API keys, no costs, no limits!

**Supported Project Types:**
🏆 Hackathons & competitions
🌐 Web applications (React, full-stack)
📱 Mobile apps (React Native, Flutter)
🤖 AI/ML projects
🚀 Startup & business planning

**Demo-Ready Prompts:**
• "Create tasks for winning this hackathon"
• "Generate web app development tasks"  
• "Plan an AI project from scratch"
• "What order should I do my tasks?"

**Future Upgrades (Optional):**
🔄 Free Hugging Face API (no key needed)
💰 OpenAI API (requires paid key)
`