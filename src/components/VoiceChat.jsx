import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause,
  Settings,
  Headphones
} from 'lucide-react'

const VoiceChat = () => {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [transcript, setTranscript] = useState('')
  const [voiceSettings, setVoiceSettings] = useState({
    voice: 'male', // 'male' or 'female'
    speed: 1.0,
    pitch: 1.0,
    volume: 0.8
  })
  const [conversation, setConversation] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m Dr. Danger, and I can now talk to you directly. Try saying "Hello Dr. Danger" or ask me anything!',
      timestamp: new Date(),
      hasAudio: true
    }
  ])

  const recognitionRef = useRef(null)
  const synthRef = useRef(null)
  const audioContextRef = useRef(null)

  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        setTranscript(finalTranscript || interimTranscript)

        if (finalTranscript) {
          handleVoiceInput(finalTranscript)
          setTranscript('')
        }
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }

    // Initialize Speech Synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const handleVoiceInput = async (spokenText) => {
    // Add user message to conversation
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: spokenText,
      timestamp: new Date(),
      hasAudio: false
    }

    setConversation(prev => [...prev, userMessage])

    // Get AI response
    try {
      const response = await fetch('https://drdanger-production.up.railway.app/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: spokenText,
          tool: 'chat'
        })
      })

      const data = await response.json()
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: data.response || 'I heard you, but I\'m having trouble responding right now.',
        timestamp: new Date(),
        hasAudio: true
      }

      setConversation(prev => [...prev, botMessage])

      // Speak the response if voice is enabled
      if (voiceEnabled) {
        speakText(botMessage.content)
      }

    } catch (error) {
      console.error('Error getting AI response:', error)
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'I\'m having trouble connecting right now. Please try again.',
        timestamp: new Date(),
        hasAudio: true
      }
      setConversation(prev => [...prev, errorMessage])
    }
  }

  const speakText = (text) => {
    if (!synthRef.current || !voiceEnabled) return

    // Cancel any ongoing speech
    synthRef.current.cancel()

    // Clean text for better speech
    const cleanText = text
      .replace(/[🎯🤖🎨💻📄🔍🧮🎵🎬📁🛒✨]/g, '') // Remove emojis
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
      .replace(/`(.*?)`/g, '$1') // Remove code backticks
      .replace(/#{1,6}\s/g, '') // Remove markdown headers
      .replace(/\n+/g, '. ') // Replace newlines with periods
      .trim()

    const utterance = new SpeechSynthesisUtterance(cleanText)
    
    // Configure voice settings
    const voices = synthRef.current.getVoices()
    const preferredVoice = voices.find(voice => 
      voiceSettings.voice === 'female' 
        ? voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('samantha')
        : voice.name.toLowerCase().includes('male') || voice.name.toLowerCase().includes('daniel')
    ) || voices[0]

    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    utterance.rate = voiceSettings.speed
    utterance.pitch = voiceSettings.pitch
    utterance.volume = voiceSettings.volume

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    synthRef.current.speak(utterance)
  }

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled)
    if (isSpeaking) {
      stopSpeaking()
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-4">
      {/* Voice Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Headphones className="w-5 h-5" />
            <span>Voice Chat with Dr. Danger</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Button
                onClick={isListening ? stopListening : startListening}
                variant={isListening ? "destructive" : "default"}
                size="lg"
                className="flex items-center space-x-2"
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                <span>{isListening ? 'Stop Listening' : 'Start Listening'}</span>
              </Button>

              <Button
                onClick={toggleVoice}
                variant={voiceEnabled ? "default" : "outline"}
                size="lg"
                className="flex items-center space-x-2"
              >
                {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                <span>{voiceEnabled ? 'Voice On' : 'Voice Off'}</span>
              </Button>

              {isSpeaking && (
                <Button
                  onClick={stopSpeaking}
                  variant="outline"
                  size="lg"
                  className="flex items-center space-x-2"
                >
                  <Pause className="w-5 h-5" />
                  <span>Stop Speaking</span>
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant={isListening ? "destructive" : "secondary"}>
                {isListening ? "Listening..." : "Ready"}
              </Badge>
              {isSpeaking && (
                <Badge variant="default">Speaking...</Badge>
              )}
            </div>
          </div>

          {/* Live Transcript */}
          {transcript && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>You're saying:</strong> {transcript}
              </p>
            </div>
          )}

          {/* Voice Settings */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <label className="block text-gray-600 dark:text-gray-300 mb-1">Voice</label>
              <select 
                value={voiceSettings.voice}
                onChange={(e) => setVoiceSettings(prev => ({...prev, voice: e.target.value}))}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="male">Male Voice</option>
                <option value="female">Female Voice</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-600 dark:text-gray-300 mb-1">Speed</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={voiceSettings.speed}
                onChange={(e) => setVoiceSettings(prev => ({...prev, speed: parseFloat(e.target.value)}))}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{voiceSettings.speed}x</span>
            </div>
            <div>
              <label className="block text-gray-600 dark:text-gray-300 mb-1">Pitch</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={voiceSettings.pitch}
                onChange={(e) => setVoiceSettings(prev => ({...prev, pitch: parseFloat(e.target.value)}))}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{voiceSettings.pitch}</span>
            </div>
            <div>
              <label className="block text-gray-600 dark:text-gray-300 mb-1">Volume</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={voiceSettings.volume}
                onChange={(e) => setVoiceSettings(prev => ({...prev, volume: parseFloat(e.target.value)}))}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{Math.round(voiceSettings.volume * 100)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice Conversation */}
      <Card className="h-[500px]">
        <CardHeader>
          <CardTitle>Voice Conversation</CardTitle>
        </CardHeader>
        <CardContent className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {conversation.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.type === 'bot' && (
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-xs text-white font-bold">D</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs opacity-70">
                          {formatTime(message.timestamp)}
                        </span>
                        {message.hasAudio && (
                          <Button
                            onClick={() => speakText(message.content)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <Play className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Voice Instructions */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">How to use Voice Chat:</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Click "Start Listening" and speak naturally</li>
              <li>• Dr. Danger will respond with voice and text</li>
              <li>• Use "Voice Off" for text-only responses</li>
              <li>• Adjust voice settings to your preference</li>
              <li>• Click the play button to replay any message</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default VoiceChat

