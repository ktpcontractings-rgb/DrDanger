import React, { useState, useEffect, useRef, createContext, useContext } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Pause,
  Settings as SettingsIcon
} from 'lucide-react'

// Global Voice Context
const VoiceContext = createContext()

export const useVoice = () => {
  const context = useContext(VoiceContext)
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider')
  }
  return context
}

// Global Voice Provider
export const VoiceProvider = ({ children }) => {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [transcript, setTranscript] = useState('')
  const [voiceSettings, setVoiceSettings] = useState({
    voice: 'female', // 'male' or 'female'
    speed: 1.2,
    pitch: 1.0,
    volume: 0.9
  })

  const recognitionRef = useRef(null)
  const synthRef = useRef(null)
  const onVoiceInputRef = useRef(null)

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

        if (finalTranscript && onVoiceInputRef.current) {
          onVoiceInputRef.current(finalTranscript)
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

  const speakText = (text) => {
    if (!synthRef.current || !voiceEnabled) return

    // Cancel any ongoing speech
    synthRef.current.cancel()

    // Clean text for better speech
    const cleanText = text
      .replace(/[🎯🤖🎨💻📄🔍🧮🎵🎬📁🛒✨🎉🚀💰🧠📊🎯]/g, '') // Remove emojis
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
      .replace(/`(.*?)`/g, '$1') // Remove code backticks
      .replace(/#{1,6}\s/g, '') // Remove markdown headers
      .replace(/\n+/g, '. ') // Replace newlines with periods
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()

    if (!cleanText) return

    const utterance = new SpeechSynthesisUtterance(cleanText)
    
    // Configure voice settings
    const voices = synthRef.current.getVoices()
    const preferredVoice = voices.find(voice => 
      voiceSettings.voice === 'female' 
        ? voice.name.toLowerCase().includes('female') || 
          voice.name.toLowerCase().includes('samantha') ||
          voice.name.toLowerCase().includes('karen') ||
          voice.name.toLowerCase().includes('susan')
        : voice.name.toLowerCase().includes('male') || 
          voice.name.toLowerCase().includes('daniel') ||
          voice.name.toLowerCase().includes('david') ||
          voice.name.toLowerCase().includes('mark')
    ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0]

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

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const setVoiceInputHandler = (handler) => {
    onVoiceInputRef.current = handler
  }

  const value = {
    isListening,
    isSpeaking,
    voiceEnabled,
    transcript,
    voiceSettings,
    setVoiceSettings,
    startListening,
    stopListening,
    toggleListening,
    speakText,
    stopSpeaking,
    toggleVoice,
    setVoiceInputHandler
  }

  return (
    <VoiceContext.Provider value={value}>
      {children}
    </VoiceContext.Provider>
  )
}

// Global Voice Controls Component
export const GlobalVoiceControls = ({ className = "" }) => {
  const {
    isListening,
    isSpeaking,
    voiceEnabled,
    transcript,
    voiceSettings,
    setVoiceSettings,
    toggleListening,
    toggleVoice,
    stopSpeaking
  } = useVoice()

  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className={`bg-white dark:bg-gray-800 border rounded-lg p-3 shadow-sm ${className}`}>
      {/* Main Voice Controls */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Button
            onClick={toggleListening}
            variant={isListening ? "destructive" : "default"}
            size="sm"
            className="flex items-center space-x-1"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span className="hidden sm:inline">
              {isListening ? 'Stop' : 'Listen'}
            </span>
          </Button>

          <Button
            onClick={toggleVoice}
            variant={voiceEnabled ? "default" : "outline"}
            size="sm"
            className="flex items-center space-x-1"
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">
              {voiceEnabled ? 'Voice' : 'Muted'}
            </span>
          </Button>

          {isSpeaking && (
            <Button
              onClick={stopSpeaking}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Pause className="w-4 h-4" />
              <span className="hidden sm:inline">Stop</span>
            </Button>
          )}

          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="ghost"
            size="sm"
          >
            <SettingsIcon className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant={isListening ? "destructive" : "secondary"} className="text-xs">
            {isListening ? "Listening..." : "Ready"}
          </Badge>
          {isSpeaking && (
            <Badge variant="default" className="text-xs">Speaking...</Badge>
          )}
        </div>
      </div>

      {/* Live Transcript */}
      {transcript && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-sm text-blue-700 dark:text-blue-300 mb-3">
          <strong>You're saying:</strong> {transcript}
        </div>
      )}

      {/* Voice Settings */}
      {showSettings && (
        <div className="border-t pt-3 mt-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-gray-600 dark:text-gray-300 mb-1">Voice</label>
              <select 
                value={voiceSettings.voice}
                onChange={(e) => setVoiceSettings(prev => ({...prev, voice: e.target.value}))}
                className="w-full p-1 border rounded text-xs dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
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
        </div>
      )}
    </div>
  )
}

// Hook for components to handle voice input
export const useVoiceInput = (handler) => {
  const { setVoiceInputHandler } = useVoice()
  
  useEffect(() => {
    setVoiceInputHandler(handler)
    return () => setVoiceInputHandler(null)
  }, [handler, setVoiceInputHandler])
}

// Hook for components to speak responses
export const useVoiceOutput = () => {
  const { speakText, voiceEnabled } = useVoice()
  
  const speak = (text) => {
    if (voiceEnabled && text) {
      speakText(text)
    }
  }
  
  return { speak, voiceEnabled }
}

