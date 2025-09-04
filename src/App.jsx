import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import StepByStepGuide from './components/StepByStepGuide'
import ScreenShare from './components/ScreenShare'
import VoiceChat from './components/VoiceChat'
import GlobalVoiceToggle from './components/GlobalVoiceToggle'
import VoiceAuthentication from './components/VoiceAuthentication'
import { VoiceProvider, GlobalVoiceControls, useVoice, useVoiceInput, useVoiceOutput } from './components/GlobalVoiceSystem'
import { 
  Bot, 
  User, 
  Send, 
  Image, 
  Code, 
  FileText, 
  Search, 
  Calculator,
  Palette,
  Music,
  Video,
  Download,
  Settings,
  Sparkles,
  MessageSquare,
  Zap,
  Target,
  Mic,
  Headphones
} from 'lucide-react'
import './App.css'

const API_BASE_URL = 'https://drdanger-production.up.railway.app/api'

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m Dr. Danger, your super AI agent. I can help you with advanced image generation, sophisticated code writing, document creation, web research, complex calculations, voice synthesis, file processing, and much more. I\'m equipped with cutting-edge AI capabilities to handle any challenge you throw at me. What dangerous task shall we tackle today?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTool, setSelectedTool] = useState(null)
  const messagesEndRef = useRef(null)

  const tools = [
    { id: 'chat', name: 'Chat', icon: MessageSquare, description: 'Advanced conversation and assistance' },
    { id: 'voice-chat', name: 'Voice Chat', icon: Headphones, description: 'Talk to Dr. Danger with voice' },
    { id: 'screen-share', name: 'Screen Share', icon: Settings, description: 'Share your screen for visual assistance' },
    { id: 'step-guide', name: 'Step-by-Step Guide', icon: Target, description: 'Interactive business setup and automation' },
    { id: 'image', name: 'Image Generation', icon: Image, description: 'Create stunning images with DALL-E' },
    { id: 'code', name: 'Code Writing', icon: Code, description: 'Write, debug, and execute code' },
    { id: 'document', name: 'Document Creation', icon: FileText, description: 'Create documents, reports, and presentations' },
    { id: 'search', name: 'Web Research', icon: Search, description: 'Advanced web search and research' },
    { id: 'calculator', name: 'Calculator', icon: Calculator, description: 'Complex mathematical calculations' },
    { id: 'design', name: 'Design Studio', icon: Palette, description: 'Create designs and visual content' },
    { id: 'audio', name: 'Audio Lab', icon: Music, description: 'Generate and process audio content' },
    { id: 'video', name: 'Video Studio', icon: Video, description: 'Create and edit video content' },
    { id: 'files', name: 'File Manager', icon: Download, description: 'Upload, process, and manage files' },
    { id: 'teddy-dangers', name: 'Teddy Dangers Store', icon: Zap, description: 'Autonomous affiliate marketing store' }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const newMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      tool: selectedTool,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setInputMessage('')
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        type: 'bot',
        content: generateBotResponse(inputMessage, selectedTool),
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botResponse])
      setIsLoading(false)
    }, 1000 + Math.random() * 2000)
  }

  const generateBotResponse = (message, tool) => {
    const responses = {
      'screen-share': `👁️ Dr. Danger's Vision System activated! I can now see your screen and provide real-time visual assistance for: "${message}". I'll analyze what you're looking at and provide contextual guidance, step-by-step instructions, and help you navigate through any interface. This is perfect for getting help with websites, applications, forms, or any visual task!`,
      'step-guide': `🎯 Dr. Danger's Step-by-Step Business Guide activated! I'll walk you through: "${message}". This interactive system provides automated execution, real-time validation, and comprehensive guidance for complex business tasks. From domain setup to affiliate marketing, I'll handle the technical complexity while you focus on growing your business. Ready to automate your success?`,
      image: `🎨 Dr. Danger here! I\'ll create a spectacular image for you: "${message}". Using advanced DALL-E technology, I\'ll generate a high-quality, detailed image that perfectly captures your vision. In the full implementation, this connects to OpenAI\'s image generation API for stunning results.`,
      code: `💻 Dr. Danger\`s Code Lab activated! For your request: "${message}", here\`s what I\`ll provide:\n\n\`\`\`javascript\n// Advanced code solution by Dr. Danger\nfunction dangerouslyGoodCode() {\n  console.log("Dr. Danger delivers exceptional code!");\n  return "Production-ready implementation here";\n}\n\`\`\`\n\nIn the full version, I connect to advanced code generation APIs and provide executable, tested code with documentation.`,
      document: `📄 Dr. Danger\'s Document Studio engaged! I\'ll craft a professional document for: "${message}". This includes structured content, advanced formatting, charts, and all necessary sections. The full implementation generates documents in multiple formats (PDF, DOCX, HTML) with professional styling.`,
      search: `🔍 Dr. Danger\'s Research Division activated! Searching for: "${message}". I\'ll provide comprehensive, up-to-date information from multiple sources with fact-checking and analysis. The full version connects to real-time search APIs and provides cited, verified information.`,
      calculator: `🧮 Dr. Danger\'s Mathematical Engine online! Processing: "${message}". I can handle everything from basic arithmetic to complex calculus, statistics, and advanced mathematical modeling. Results computed with precision and detailed explanations.`,
      design: `🎨 Dr. Danger\'s Design Studio ready! Creating visual solutions for: "${message}". This includes color theory, typography, layout design, and brand consistency. The full version integrates with design tools and generates production-ready assets.`,
      audio: `🎵 Dr. Danger\'s Audio Lab operational! Processing audio request: "${message}". I can generate music, voice synthesis, sound effects, and audio editing. The full implementation includes advanced audio processing and AI-generated content.`,
      video: `🎬 Dr. Danger\'s Video Studio rolling! Creating video content for: "${message}". This includes video generation, editing, effects, and post-production. The full version provides professional-grade video creation capabilities.`,
      files: `📁 Dr. Danger\'s File Management System active! Handling: "${message}". I can process, analyze, convert, and manage files of all types. The full implementation includes OCR, data extraction, format conversion, and intelligent file organization.`,
      'teddy-dangers': `🛒 Dr. Danger\'s Teddy Dangers Store operational! Processing: "${message}". Welcome to your autonomous affiliate marketing empire! I\'m analyzing trending products, optimizing campaigns, and generating content to maximize your profits. Current store performance: $15,847 monthly revenue with 3.2% conversion rate. I\'ve identified 23 high-potential products in tech and home categories. Ready to scale your affiliate empire!`,
      default: `🤖 Dr. Danger at your service! I understand you need help with: "${message}". As your super AI agent, I\'m equipped with cutting-edge capabilities to tackle any challenge. In the full implementation, I leverage multiple AI models and advanced algorithms to provide exceptional results.`
    }

    return responses[tool] || responses.default
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Global Voice Toggle */}
      <GlobalVoiceToggle onVoiceStateChange={(state) => {
        console.log('Voice state changed:', state);
        // Handle voice state changes globally
      }} />
      
      {/* Voice Authentication System */}
      <VoiceAuthentication onAuthStateChange={(state) => {
        console.log('Auth state changed:', state);
        // Handle authentication state changes
        if (state.type === 'voice_authenticated') {
          console.log('Developer mode activated via voice authentication');
        }
      }} />
      
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dr. Danger</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Your super AI agent</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tools Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>AI Tools</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {tools.map((tool) => (
                  <Button
                    key={tool.id}
                    variant={selectedTool === tool.id ? "default" : "ghost"}
                    className="w-full justify-start h-auto p-3"
                    onClick={() => setSelectedTool(tool.id)}
                  >
                    <tool.icon className="w-4 h-4 mr-3 flex-shrink-0" />
                    <div className="text-left">
                      <div className="font-medium">{tool.name}</div>
                      <div className="text-xs text-muted-foreground">{tool.description}</div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface, Voice Chat, Step-by-Step Guide, or Screen Share */}
          <div className="lg:col-span-3">
            {selectedTool === 'step-guide' ? (
              <StepByStepGuide />
            ) : selectedTool === 'screen-share' ? (
              <ScreenShare />
            ) : selectedTool === 'voice-chat' ? (
              <VoiceChat />
            ) : (
              <Card className="h-[calc(100vh-200px)]">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle>Chat Interface</CardTitle>
                    {selectedTool && (
                      <Badge variant="secondary" className="flex items-center space-x-1">
                        {tools.find(t => t.id === selectedTool)?.icon && 
                          React.createElement(tools.find(t => t.id === selectedTool).icon, { className: "w-3 h-3" })
                        }
                        <span>{tools.find(t => t.id === selectedTool)?.name}</span>
                      </Badge>
                    )}
                  </div>
                </CardHeader>
              
              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: 'calc(100% - 140px)' }}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    }`}>
                      {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`flex-1 max-w-[80%] ${message.type === 'user' ? 'text-right' : ''}`}>
                      <div className={`rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-blue-500 text-white ml-auto'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        {message.tool && (
                          <div className="mt-2 text-xs opacity-75">
                            Tool: {tools.find(t => t.id === message.tool)?.name}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Input Area */}
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={selectedTool ? `Ask me anything about ${tools.find(t => t.id === selectedTool)?.name.toLowerCase()}...` : "Ask me anything..."}
                    className="flex-1 min-h-[40px] max-h-[120px] resize-none"
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!inputMessage.trim() || isLoading}
                    className="px-4"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                {selectedTool && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Using: {tools.find(t => t.id === selectedTool)?.name} - {tools.find(t => t.id === selectedTool)?.description}
                  </div>
                )}
              </div>
            </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App


