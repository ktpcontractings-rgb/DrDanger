import React, { useState, useEffect, useRef } from 'react';
import { Shield, ShieldCheck, ShieldX, Mic, Settings, Code, Database, Eye, EyeOff } from 'lucide-react';

const VoiceAuthentication = ({ onAuthStateChange }) => {
  const [authState, setAuthState] = useState('locked'); // 'locked', 'listening', 'authenticated', 'failed'
  const [isRecording, setIsRecording] = useState(false);
  const [voicePrint, setVoicePrint] = useState(null);
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [developerMode, setDeveloperMode] = useState(false);
  const [authAttempts, setAuthAttempts] = useState(0);
  const [lastAuthTime, setLastAuthTime] = useState(null);

  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const voiceDataRef = useRef([]);

  // Voice authentication phrases
  const AUTH_PHRASES = [
    "Dr Danger developer mode activate",
    "Theodore Pridemore admin access",
    "KTP Contracting owner authentication",
    "Teddy Dangers master key",
    "Construction AI developer unlock"
  ];

  useEffect(() => {
    // Load saved voice print from localStorage
    const savedVoicePrint = localStorage.getItem('drDanger_voicePrint');
    if (savedVoicePrint) {
      setVoicePrint(JSON.parse(savedVoicePrint));
    }

    // Initialize audio context for voice analysis
    initializeAudioContext();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const initializeAudioContext = async () => {
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
    } catch (error) {
      console.error('Audio context initialization failed:', error);
    }
  };

  const extractVoiceFeatures = (audioData) => {
    // Extract voice characteristics for authentication
    const features = {
      pitch: calculatePitch(audioData),
      formants: calculateFormants(audioData),
      spectralCentroid: calculateSpectralCentroid(audioData),
      mfcc: calculateMFCC(audioData),
      timestamp: Date.now()
    };
    return features;
  };

  const calculatePitch = (audioData) => {
    // Simplified pitch detection using autocorrelation
    let maxCorrelation = 0;
    let bestPeriod = 0;
    
    for (let period = 20; period < audioData.length / 2; period++) {
      let correlation = 0;
      for (let i = 0; i < audioData.length - period; i++) {
        correlation += audioData[i] * audioData[i + period];
      }
      if (correlation > maxCorrelation) {
        maxCorrelation = correlation;
        bestPeriod = period;
      }
    }
    
    return bestPeriod > 0 ? 44100 / bestPeriod : 0; // Assuming 44.1kHz sample rate
  };

  const calculateFormants = (audioData) => {
    // Simplified formant detection
    const fft = performFFT(audioData);
    const peaks = findPeaks(fft);
    return peaks.slice(0, 3); // First 3 formants
  };

  const calculateSpectralCentroid = (audioData) => {
    const fft = performFFT(audioData);
    let weightedSum = 0;
    let magnitudeSum = 0;
    
    for (let i = 0; i < fft.length; i++) {
      const magnitude = Math.sqrt(fft[i].real * fft[i].real + fft[i].imag * fft[i].imag);
      weightedSum += i * magnitude;
      magnitudeSum += magnitude;
    }
    
    return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
  };

  const calculateMFCC = (audioData) => {
    // Simplified MFCC calculation
    const fft = performFFT(audioData);
    const melFilters = createMelFilterBank(fft.length);
    const mfcc = [];
    
    for (let i = 0; i < 13; i++) {
      let sum = 0;
      for (let j = 0; j < fft.length; j++) {
        const magnitude = Math.sqrt(fft[j].real * fft[j].real + fft[j].imag * fft[j].imag);
        sum += magnitude * melFilters[i][j];
      }
      mfcc.push(Math.log(sum + 1e-10));
    }
    
    return mfcc;
  };

  const performFFT = (audioData) => {
    // Simplified FFT implementation
    const N = audioData.length;
    const result = [];
    
    for (let k = 0; k < N; k++) {
      let real = 0;
      let imag = 0;
      
      for (let n = 0; n < N; n++) {
        const angle = -2 * Math.PI * k * n / N;
        real += audioData[n] * Math.cos(angle);
        imag += audioData[n] * Math.sin(angle);
      }
      
      result.push({ real, imag });
    }
    
    return result;
  };

  const findPeaks = (fft) => {
    const magnitudes = fft.map(f => Math.sqrt(f.real * f.real + f.imag * f.imag));
    const peaks = [];
    
    for (let i = 1; i < magnitudes.length - 1; i++) {
      if (magnitudes[i] > magnitudes[i - 1] && magnitudes[i] > magnitudes[i + 1]) {
        peaks.push(i);
      }
    }
    
    return peaks.sort((a, b) => magnitudes[b] - magnitudes[a]);
  };

  const createMelFilterBank = (fftSize) => {
    // Simplified mel filter bank
    const numFilters = 13;
    const filters = [];
    
    for (let i = 0; i < numFilters; i++) {
      const filter = new Array(fftSize).fill(0);
      const start = Math.floor(i * fftSize / numFilters);
      const end = Math.floor((i + 1) * fftSize / numFilters);
      
      for (let j = start; j < end; j++) {
        filter[j] = 1 - Math.abs(j - (start + end) / 2) / ((end - start) / 2);
      }
      
      filters.push(filter);
    }
    
    return filters;
  };

  const compareVoicePrints = (current, stored) => {
    if (!stored) return 0;
    
    let similarity = 0;
    let totalFeatures = 0;
    
    // Compare pitch
    const pitchDiff = Math.abs(current.pitch - stored.pitch) / Math.max(current.pitch, stored.pitch, 1);
    similarity += Math.max(0, 1 - pitchDiff);
    totalFeatures++;
    
    // Compare spectral centroid
    const centroidDiff = Math.abs(current.spectralCentroid - stored.spectralCentroid) / 
                        Math.max(current.spectralCentroid, stored.spectralCentroid, 1);
    similarity += Math.max(0, 1 - centroidDiff);
    totalFeatures++;
    
    // Compare MFCC
    if (current.mfcc && stored.mfcc) {
      let mfccSimilarity = 0;
      for (let i = 0; i < Math.min(current.mfcc.length, stored.mfcc.length); i++) {
        const diff = Math.abs(current.mfcc[i] - stored.mfcc[i]);
        mfccSimilarity += Math.max(0, 1 - diff / 10); // Normalize MFCC difference
      }
      similarity += mfccSimilarity / Math.min(current.mfcc.length, stored.mfcc.length);
      totalFeatures++;
    }
    
    return totalFeatures > 0 ? similarity / totalFeatures : 0;
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      setIsRecording(true);
      setAuthState('listening');
      voiceDataRef.current = [];
      
      // Start speech recognition for phrase detection
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript.toLowerCase();
          processAuthenticationAttempt(transcript);
        };
        
        recognitionRef.current.onerror = () => {
          setAuthState('failed');
          setIsRecording(false);
        };
        
        recognitionRef.current.start();
      }
      
      // Record audio data for voice analysis
      const recordAudio = () => {
        if (!isRecording) return;
        
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Float32Array(bufferLength);
        analyserRef.current.getFloatTimeDomainData(dataArray);
        
        voiceDataRef.current.push(...dataArray);
        
        if (voiceDataRef.current.length < 44100 * 3) { // Record for 3 seconds
          requestAnimationFrame(recordAudio);
        }
      };
      
      recordAudio();
      
    } catch (error) {
      console.error('Voice recording failed:', error);
      setAuthState('failed');
    }
  };

  const processAuthenticationAttempt = (transcript) => {
    setIsRecording(false);
    
    // Check if the spoken phrase matches any authentication phrase
    const phraseMatch = AUTH_PHRASES.some(phrase => 
      transcript.includes(phrase.toLowerCase()) || 
      phrase.toLowerCase().includes(transcript)
    );
    
    if (!phraseMatch) {
      setAuthState('failed');
      setAuthAttempts(prev => prev + 1);
      return;
    }
    
    // Extract voice features from recorded audio
    const currentVoiceFeatures = extractVoiceFeatures(voiceDataRef.current);
    
    if (isSetupMode) {
      // Setup mode: Save the voice print
      setVoicePrint(currentVoiceFeatures);
      localStorage.setItem('drDanger_voicePrint', JSON.stringify(currentVoiceFeatures));
      setIsSetupMode(false);
      setAuthState('authenticated');
      setDeveloperMode(true);
      setLastAuthTime(Date.now());
      
      if (onAuthStateChange) {
        onAuthStateChange({
          type: 'voice_setup_complete',
          authenticated: true,
          developerMode: true
        });
      }
    } else {
      // Authentication mode: Compare with stored voice print
      const similarity = compareVoicePrints(currentVoiceFeatures, voicePrint);
      const threshold = 0.7; // 70% similarity threshold
      
      if (similarity >= threshold) {
        setAuthState('authenticated');
        setDeveloperMode(true);
        setLastAuthTime(Date.now());
        setAuthAttempts(0);
        
        if (onAuthStateChange) {
          onAuthStateChange({
            type: 'voice_authenticated',
            authenticated: true,
            developerMode: true,
            similarity: similarity
          });
        }
      } else {
        setAuthState('failed');
        setAuthAttempts(prev => prev + 1);
        
        if (onAuthStateChange) {
          onAuthStateChange({
            type: 'voice_auth_failed',
            authenticated: false,
            similarity: similarity,
            attempts: authAttempts + 1
          });
        }
      }
    }
  };

  const exitDeveloperMode = () => {
    setDeveloperMode(false);
    setAuthState('locked');
    
    if (onAuthStateChange) {
      onAuthStateChange({
        type: 'developer_mode_exit',
        authenticated: false,
        developerMode: false
      });
    }
  };

  const resetVoicePrint = () => {
    localStorage.removeItem('drDanger_voicePrint');
    setVoicePrint(null);
    setIsSetupMode(true);
    setAuthState('locked');
    setDeveloperMode(false);
  };

  const getStatusColor = () => {
    switch (authState) {
      case 'authenticated': return 'text-green-600 bg-green-100';
      case 'listening': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = () => {
    switch (authState) {
      case 'authenticated': return <ShieldCheck size={16} />;
      case 'listening': return <Mic size={16} className="animate-pulse" />;
      case 'failed': return <ShieldX size={16} />;
      default: return <Shield size={16} />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {/* Developer Mode Panel */}
      {developerMode && (
        <div className="bg-black/90 text-green-400 rounded-lg p-4 font-mono text-sm max-w-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-300">DEVELOPER MODE ACTIVE</span>
            <button
              onClick={exitDeveloperMode}
              className="text-red-400 hover:text-red-300"
            >
              <EyeOff size={16} />
            </button>
          </div>
          <div className="space-y-1 text-xs">
            <div>User: Theodore Pridemore</div>
            <div>Access: KTP Contracting Owner</div>
            <div>Auth: Voice Biometric ✓</div>
            <div>Session: {new Date(lastAuthTime).toLocaleTimeString()}</div>
          </div>
          <div className="mt-3 flex gap-2">
            <button className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700">
              <Code size={12} className="inline mr-1" />
              Debug
            </button>
            <button className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700">
              <Database size={12} className="inline mr-1" />
              Logs
            </button>
            <button className="bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700">
              <Settings size={12} className="inline mr-1" />
              Config
            </button>
          </div>
        </div>
      )}

      {/* Voice Authentication Button */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-lg border ${getStatusColor()}`}>
        <button
          onClick={voicePrint && !isSetupMode ? startVoiceRecording : () => setIsSetupMode(true)}
          disabled={isRecording}
          className="flex items-center gap-2"
          title={
            !voicePrint || isSetupMode 
              ? "Setup voice authentication" 
              : "Voice authenticate for developer mode"
          }
        >
          {getStatusIcon()}
          <span className="text-xs font-medium">
            {isSetupMode ? 'Setup Voice' :
             authState === 'authenticated' ? 'Dev Mode' :
             authState === 'listening' ? 'Listening...' :
             authState === 'failed' ? 'Auth Failed' :
             'Voice Auth'}
          </span>
        </button>

        {/* Setup/Reset Button */}
        {voicePrint && !isSetupMode && authState !== 'listening' && (
          <button
            onClick={resetVoicePrint}
            className="text-xs opacity-60 hover:opacity-100"
            title="Reset voice authentication"
          >
            Reset
          </button>
        )}
      </div>

      {/* Authentication Instructions */}
      {(isSetupMode || authState === 'listening') && (
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-xs text-sm">
          <div className="font-medium mb-2">
            {isSetupMode ? 'Voice Setup' : 'Voice Authentication'}
          </div>
          <div className="text-gray-600 text-xs space-y-1">
            <div>Say one of these phrases clearly:</div>
            <ul className="list-disc list-inside space-y-1">
              {AUTH_PHRASES.slice(0, 3).map((phrase, index) => (
                <li key={index} className="text-xs">{phrase}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Failed Attempts Warning */}
      {authAttempts >= 3 && (
        <div className="bg-red-100 text-red-700 rounded-lg p-2 text-xs">
          Multiple failed attempts detected. Voice authentication temporarily disabled.
        </div>
      )}
    </div>
  );
};

export default VoiceAuthentication;

