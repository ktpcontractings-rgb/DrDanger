import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

const GlobalVoiceToggle = ({ onVoiceStateChange }) => {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({
    voice: 'female',
    speed: 1,
    pitch: 1,
    volume: 0.8
  });

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        
        if (event.results[event.results.length - 1].isFinal) {
          handleVoiceInput(transcript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        if (isVoiceEnabled) {
          // Restart listening if voice is enabled
          setTimeout(() => {
            if (recognitionRef.current && isVoiceEnabled) {
              recognitionRef.current.start();
            }
          }, 100);
        }
      };
    }

    // Initialize speech synthesis
    synthRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [isVoiceEnabled]);

  const handleVoiceInput = async (transcript) => {
    if (!transcript.trim()) return;

    try {
      // Send voice input to Dr. Danger's AI
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://drdanger-production.up.railway.app'}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: transcript,
          tool: 'voice_chat'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        speakResponse(data.response || data.message || "I heard you, but I'm having trouble responding right now.");
        
        // Notify parent component of voice interaction
        if (onVoiceStateChange) {
          onVoiceStateChange({
            type: 'voice_interaction',
            input: transcript,
            output: data.response || data.message
          });
        }
      } else {
        speakResponse("I'm having trouble connecting right now. Please try again.");
      }
    } catch (error) {
      console.error('Voice chat error:', error);
      speakResponse("I'm having trouble connecting right now. Please try again.");
    }
  };

  const speakResponse = (text) => {
    if (!synthRef.current || !isVoiceEnabled) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply voice settings
    const voices = synthRef.current.getVoices();
    const selectedVoice = voices.find(voice => 
      voiceSettings.voice === 'female' 
        ? voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('zira') || voice.name.toLowerCase().includes('samantha')
        : voice.name.toLowerCase().includes('male') || voice.name.toLowerCase().includes('david') || voice.name.toLowerCase().includes('alex')
    );
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = voiceSettings.speed;
    utterance.pitch = voiceSettings.pitch;
    utterance.volume = voiceSettings.volume;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const toggleVoice = () => {
    const newVoiceState = !isVoiceEnabled;
    setIsVoiceEnabled(newVoiceState);

    if (newVoiceState) {
      // Start listening
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      }
      speakResponse("Voice assistant activated. I'm listening and ready to help you with anything!");
    } else {
      // Stop listening and speaking
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
      if (synthRef.current) {
        synthRef.current.cancel();
        setIsSpeaking(false);
      }
    }

    // Notify parent component
    if (onVoiceStateChange) {
      onVoiceStateChange({
        type: 'voice_toggle',
        enabled: newVoiceState
      });
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-200">
      {/* Voice Toggle Button */}
      <button
        onClick={toggleVoice}
        className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 ${
          isVoiceEnabled
            ? 'bg-blue-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        title={isVoiceEnabled ? 'Turn off voice assistant' : 'Turn on voice assistant'}
      >
        {isVoiceEnabled ? (
          <>
            <Volume2 size={16} />
            <span className="text-sm font-medium">Voice ON</span>
          </>
        ) : (
          <>
            <VolumeX size={16} />
            <span className="text-sm font-medium">Voice OFF</span>
          </>
        )}
      </button>

      {/* Voice Status Indicators */}
      {isVoiceEnabled && (
        <div className="flex items-center gap-1">
          {/* Listening Indicator */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
            isListening ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            <Mic size={12} />
            {isListening ? 'Listening' : 'Idle'}
          </div>

          {/* Speaking Indicator */}
          {isSpeaking && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              Speaking
            </div>
          )}
        </div>
      )}

      {/* Quick Voice Settings */}
      {isVoiceEnabled && (
        <div className="flex items-center gap-1">
          <select
            value={voiceSettings.voice}
            onChange={(e) => setVoiceSettings(prev => ({ ...prev, voice: e.target.value }))}
            className="text-xs bg-transparent border-none outline-none cursor-pointer"
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default GlobalVoiceToggle;

