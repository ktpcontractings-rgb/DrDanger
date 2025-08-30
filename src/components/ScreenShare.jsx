import React, { useState, useRef, useEffect } from 'react';
import { Camera, Monitor, Smartphone, Eye, Square, Play, Pause, X } from 'lucide-react';

const ScreenShare = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [stream, setStream] = useState(null);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [shareMode, setShareMode] = useState('screen'); // 'screen', 'camera', 'mobile'
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  // Start screen/camera sharing
  const startSharing = async () => {
    try {
      let mediaStream;
      
      if (shareMode === 'screen') {
        // Screen sharing
        mediaStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            mediaSource: 'screen',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
      } else if (shareMode === 'camera') {
        // Camera sharing
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      }

      if (mediaStream) {
        setStream(mediaStream);
        setIsSharing(true);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        // Start automatic analysis every 3 seconds
        intervalRef.current = setInterval(() => {
          if (!isAnalyzing) {
            captureAndAnalyze();
          }
        }, 3000);

        // Handle stream end
        mediaStream.getVideoTracks()[0].addEventListener('ended', () => {
          stopSharing();
        });
      }
    } catch (error) {
      console.error('Error starting screen share:', error);
      alert('Screen sharing not supported or permission denied. Please ensure you\'re using a modern browser and grant permission.');
    }
  };

  // Stop sharing
  const stopSharing = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsSharing(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Capture current frame and analyze
  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current || isAnalyzing) return;

    setIsAnalyzing(true);
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to base64 image
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      // Simulate AI analysis (in real implementation, this would call your backend)
      const analysis = await simulateAIAnalysis(imageData);
      
      // Add to analysis results
      setAnalysisResults(prev => [
        {
          id: Date.now(),
          timestamp: new Date(),
          analysis: analysis,
          image: imageData
        },
        ...prev.slice(0, 9) // Keep only last 10 analyses
      ]);
      
    } catch (error) {
      console.error('Error capturing and analyzing:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Simulate AI analysis (replace with actual API call)
  const simulateAIAnalysis = async (imageData) => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simulate different types of analysis based on what might be on screen
    const analyses = [
      {
        type: 'webpage',
        confidence: 0.95,
        description: 'I can see you\'re on a website. The page appears to have a form with input fields. Would you like me to help you fill it out or navigate through the process?',
        suggestions: [
          'I can guide you through filling out this form step-by-step',
          'I notice there are required fields - let me help you identify them',
          'Would you like me to explain what each field is asking for?'
        ]
      },
      {
        type: 'application',
        confidence: 0.88,
        description: 'I can see you\'re using an application interface. There are several buttons and menu options visible. What would you like to accomplish?',
        suggestions: [
          'I can help you navigate through the menu options',
          'Let me explain what each button does',
          'I can provide step-by-step instructions for common tasks'
        ]
      },
      {
        type: 'document',
        confidence: 0.92,
        description: 'I can see a document or text editor on your screen. The content appears to be editable. How can I assist you with this document?',
        suggestions: [
          'I can help you format and structure your content',
          'Would you like me to review and suggest improvements?',
          'I can assist with writing, editing, or organizing your text'
        ]
      },
      {
        type: 'settings',
        confidence: 0.85,
        description: 'I can see you\'re in a settings or configuration screen. There are various options and toggles visible. What are you trying to configure?',
        suggestions: [
          'I can explain what each setting does',
          'Let me guide you to the specific setting you need',
          'I can help you optimize these configurations'
        ]
      },
      {
        type: 'general',
        confidence: 0.75,
        description: 'I can see your screen content. It looks like you\'re working on something. How can Dr. Danger assist you with what you\'re currently viewing?',
        suggestions: [
          'Tell me what you\'re trying to accomplish and I\'ll provide guidance',
          'I can help explain any interface elements you see',
          'Let me know if you need step-by-step instructions for any task'
        ]
      }
    ];
    
    // Return a random analysis for simulation
    return analyses[Math.floor(Math.random() * analyses.length)];
  };

  // Manual capture
  const manualCapture = () => {
    if (isSharing && !isAnalyzing) {
      captureAndAnalyze();
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopSharing();
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          👁️ Dr. Danger Vision System
        </h2>
        <p className="text-lg text-gray-600">
          Share your screen or camera so Dr. Danger can see what you're working on and provide real-time visual assistance.
        </p>
      </div>

      {/* Share Mode Selection */}
      {!isSharing && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Choose Sharing Mode</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => setShareMode('screen')}
              className={`p-4 rounded-lg border-2 transition-all ${
                shareMode === 'screen' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Monitor className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-medium text-gray-900">Screen Share</h4>
              <p className="text-sm text-gray-600">Share your entire screen or specific window</p>
            </button>
            
            <button
              onClick={() => setShareMode('camera')}
              className={`p-4 rounded-lg border-2 transition-all ${
                shareMode === 'camera' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Camera className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-medium text-gray-900">Camera Share</h4>
              <p className="text-sm text-gray-600">Share your device camera view</p>
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <button
              onClick={startSharing}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Play className="w-5 h-5" />
              Start {shareMode === 'screen' ? 'Screen' : 'Camera'} Sharing
            </button>
          </div>
        </div>
      )}

      {/* Active Sharing Interface */}
      {isSharing && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Video Preview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Eye className="w-5 h-5 text-green-600" />
                Live {shareMode === 'screen' ? 'Screen' : 'Camera'} View
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={manualCapture}
                  disabled={isAnalyzing}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Now'}
                </button>
                <button
                  onClick={stopSharing}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Stop
                </button>
              </div>
            </div>
            
            <div className="relative bg-gray-900 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-auto max-h-96 object-contain"
              />
              {isAnalyzing && (
                <div className="absolute inset-0 bg-blue-600 bg-opacity-20 flex items-center justify-center">
                  <div className="bg-white rounded-lg p-3 flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-medium">Dr. Danger is analyzing...</span>
                  </div>
                </div>
              )}
            </div>
            
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Analysis Results */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              🧠 Dr. Danger's Analysis
            </h3>
            
            {analysisResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Dr. Danger is ready to analyze your screen...</p>
                <p className="text-sm mt-2">Analysis will start automatically every 3 seconds</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {analysisResults.map((result) => (
                  <div key={result.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">
                        {result.timestamp.toLocaleTimeString()}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        result.analysis.confidence > 0.9 ? 'bg-green-100 text-green-800' :
                        result.analysis.confidence > 0.8 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {Math.round(result.analysis.confidence * 100)}% confident
                      </span>
                    </div>
                    
                    <p className="text-gray-900 mb-3">{result.analysis.description}</p>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 text-sm">💡 Suggestions:</h4>
                      {result.analysis.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">🔒 Privacy & Security</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">What Dr. Danger Can See:</h4>
            <ul className="space-y-1">
              <li>• Your screen content or camera view</li>
              <li>• UI elements and text on screen</li>
              <li>• Applications and websites you're using</li>
              <li>• Forms, buttons, and interactive elements</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Privacy Protection:</h4>
            <ul className="space-y-1">
              <li>• No data is stored permanently</li>
              <li>• Analysis happens in real-time only</li>
              <li>• You control when sharing starts/stops</li>
              <li>• No audio is captured or transmitted</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Browser Compatibility */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
        <h4 className="font-medium text-yellow-800 mb-2">📱 Device Compatibility</h4>
        <p className="text-sm text-yellow-700">
          Screen sharing works best on desktop browsers (Chrome, Firefox, Safari, Edge). 
          On mobile devices, camera sharing is recommended. Some features may require permissions.
        </p>
      </div>
    </div>
  );
};

export default ScreenShare;

