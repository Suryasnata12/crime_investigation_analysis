import React, { useState, useEffect, useRef } from 'react';
import { 
  FaMicrophone, 
  FaStop, 
  FaSave, 
  FaTrash, 
  FaPause,
  FaPlay,
  FaFileAudio,
  FaFileAlt,
  FaCloudUploadAlt,
  FaCheck
} from 'react-icons/fa';
import { Statement } from './StatementComparison';

interface StatementRecordingProps {
  witnessId: string;
  witnessName: string;
  onStatementSaved: (statement: Statement) => void;
  onCancel: () => void;
}

const StatementRecording: React.FC<StatementRecordingProps> = ({ 
  witnessId, 
  witnessName, 
  onStatementSaved, 
  onCancel 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingStatus, setRecordingStatus] = useState('Ready to record');
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [statementData, setStatementData] = useState<Partial<Statement>>({
    date: new Date().toISOString().split('T')[0],
    content: '',
    recorded_by: 'Current User', // In a real app, get the current user
    location: 'Interview Room 1',
    verified: false
  });
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visualizerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up audio URL when component unmounts
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (recordingTimer) {
        clearInterval(recordingTimer);
      }
      if (visualizerIntervalRef.current) {
        clearInterval(visualizerIntervalRef.current);
      }
    };
  }, [audioUrl, recordingTimer]);

  // Handle recording timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setRecordingTimer(timer);
    } else if (recordingTimer) {
      clearInterval(recordingTimer);
      setRecordingTimer(null);
    }
    
    return () => {
      if (recordingTimer) {
        clearInterval(recordingTimer);
      }
    };
  }, [isRecording, isPaused]);

  // Audio visualization when recording
  useEffect(() => {
    if (isRecording && !isPaused && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Clear any existing interval
        if (visualizerIntervalRef.current) {
          clearInterval(visualizerIntervalRef.current);
        }
        
        const drawVisualizer = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Number of bars
          const bars = 20;
          const barWidth = canvas.width / bars;
          
          for (let i = 0; i < bars; i++) {
            // In a real implementation, these values would come from audio analysis
            // Here we're just simulating with random values
            const barHeight = Math.random() * (canvas.height - 10) + 10;
            
            // Draw bar
            const hue = (360 / bars) * i;
            ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
            
            ctx.fillRect(
              i * barWidth, 
              canvas.height - barHeight, 
              barWidth - 2, 
              barHeight
            );
          }
        };
        
        // Draw on interval
        visualizerIntervalRef.current = setInterval(drawVisualizer, 100);
      }
    } else if (visualizerIntervalRef.current) {
      clearInterval(visualizerIntervalRef.current);
      visualizerIntervalRef.current = null;
    }
    
    return () => {
      if (visualizerIntervalRef.current) {
        clearInterval(visualizerIntervalRef.current);
      }
    };
  }, [isRecording, isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    setRecordingStatus('Recording in progress...');
    
    // In a real implementation, this would use the MediaRecorder API
    // For this mock, we'll just simulate the recording process
  };

  const pauseRecording = () => {
    setIsPaused(true);
    setRecordingStatus('Recording paused');
    
    // In a real implementation, this would pause the MediaRecorder
  };

  const resumeRecording = () => {
    setIsPaused(false);
    setRecordingStatus('Recording resumed...');
    
    // In a real implementation, this would resume the MediaRecorder
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    setRecordingStatus('Processing recording...');
    
    // Simulate creating an audio blob
    setTimeout(() => {
      // This would be an actual audio blob in a real implementation
      const mockAudioBlob = new Blob([], { type: 'audio/wav' });
      setAudioBlob(mockAudioBlob);
      
      // Create a URL for the audio blob
      const url = URL.createObjectURL(mockAudioBlob);
      setAudioUrl(url);
      
      setRecordingStatus('Recording processed. Ready for transcription.');
    }, 1500);
  };

  const resetRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    setRecordingStatus('Ready to record');
    
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    
    setAudioBlob(null);
    setTranscription('');
    setIsProcessed(false);
  };

  const generateTranscription = () => {
    setIsTranscribing(true);
    setRecordingStatus('Transcribing audio...');
    
    // In a real implementation, this would call a speech-to-text API
    // For this mock, we'll simulate the process with sample responses
    setTimeout(() => {
      const sampleTranscriptions = [
        "I was at the corner store when I heard a loud noise from the direction of the bank. When I looked over, I saw a man running out of the bank entrance. He was wearing a black hoodie and had a small bag in his hand. He ran to a dark sedan that was waiting across the street with the engine running. The car looked like it might have been a Toyota or Honda, definitely a Japanese make. It had tinted windows and I couldn't see the driver. The whole thing happened really fast, maybe 15-20 seconds total.",
        
        "I was walking my dog past the bank around 3:15 PM when I noticed a suspicious man standing by the entrance. He was wearing dark clothes and kept looking around nervously. About ten minutes later, I heard shouting coming from inside the bank, and then the same man ran out holding something. He jumped into a car that was parked across the street - I think it was dark blue or black. The car drove away very fast, heading north on Main Street.",
        
        "I was coming out of the coffee shop when I heard some commotion from the bank. I saw someone wearing a black hoodie run out of the building. They were carrying what looked like a small bag. The person ran to a dark-colored sedan that was waiting across the street. I remember the car had out-of-state license plates, but I couldn't make out which state. The whole incident happened very quickly, maybe 30 seconds at most from when I first noticed something was wrong."
      ];
      
      const selectedTranscription = sampleTranscriptions[Math.floor(Math.random() * sampleTranscriptions.length)];
      
      setTranscription(selectedTranscription);
      setStatementData(prev => ({
        ...prev,
        content: selectedTranscription
      }));
      
      setIsTranscribing(false);
      setIsProcessed(true);
      setRecordingStatus('Transcription complete');
    }, 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStatementData(prev => ({...prev, [name]: value}));
  };

  const handleSaveStatement = () => {
    if (!statementData.content || !statementData.location) {
      alert("Please fill in all required fields");
      return;
    }
    
    // In a real implementation, this would save to an API
    // For this mock, we'll simulate the process
    const newStatement: Statement = {
      id: Date.now(),
      date: statementData.date || new Date().toISOString().split('T')[0],
      content: statementData.content || '',
      recorded_by: statementData.recorded_by || 'Current User',
      location: statementData.location || '',
      verified: false,
      inconsistencies: null,
      keywords: extractKeywords(statementData.content || ''),
      sentiment_analysis: analyzeSentiment(statementData.content || ''),
      recording_url: audioUrl || undefined
    };
    
    onStatementSaved(newStatement);
  };

  // Simple keyword extraction simulation
  const extractKeywords = (text: string): string[] => {
    const words = text.toLowerCase().split(/\s+/);
    const keywords: string[] = [];
    
    // Simplified keyword extraction - in a real app, this would use NLP
    const potentialKeywords = [
      'bank', 'car', 'vehicle', 'gun', 'weapon', 'mask', 'face', 'run', 'running',
      'dark', 'black', 'hoodie', 'jacket', 'bag', 'money', 'loud', 'noise', 'shout',
      'time', 'afternoon', 'morning', 'night', 'license', 'plate', 'sedan', 'suv',
      'toyota', 'honda', 'window', 'tinted', 'driver', 'passenger', 'door', 'color'
    ];
    
    potentialKeywords.forEach(keyword => {
      if (words.includes(keyword) && !keywords.includes(keyword)) {
        keywords.push(keyword);
      }
    });
    
    return keywords;
  };

  // Simple sentiment analysis simulation
  const analyzeSentiment = (text: string): Statement['sentiment_analysis'] => {
    const lowerText = text.toLowerCase();
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    let confidence = 0.7;
    const key_concerns: string[] = [];
    
    const negativeWords = ['not', 'no', 'never', 'unsure', 'uncertain', 'maybe', 'possibly', 'don\'t know'];
    const positiveWords = ['clearly', 'definitely', 'certainly', 'sure', 'absolutely', 'precisely'];
    
    let negativeCount = 0;
    let positiveCount = 0;
    
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) {
        negativeCount++;
        if (!key_concerns.includes('Uncertainty in statement')) {
          key_concerns.push('Uncertainty in statement');
        }
      }
    });
    
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) {
        positiveCount++;
      }
    });
    
    if (negativeCount > positiveCount) {
      sentiment = 'negative';
      confidence = 0.5 + (negativeCount * 0.1);
    } else if (positiveCount > negativeCount) {
      sentiment = 'positive';
      confidence = 0.5 + (positiveCount * 0.1);
    }
    
    // Check for potential memory concerns
    if (lowerText.includes('think') || lowerText.includes('believe') || lowerText.includes('guess')) {
      key_concerns.push('Memory reliability concerns');
    }
    
    // Check for observation vs inference
    if (lowerText.includes('looked like') || lowerText.includes('seemed to be') || lowerText.includes('appeared')) {
      key_concerns.push('Inference rather than direct observation');
    }
    
    return {
      sentiment,
      confidence: Math.min(confidence, 0.95),
      key_concerns
    };
  };

  return (
    <div className="statement-recording-component">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Record Witness Statement</h5>
          <div>
            <span className="badge bg-secondary">{witnessName}</span>
          </div>
        </div>
        <div className="card-body">
          {!isProcessed ? (
            <div className="recording-section">
              <div className="row mb-4">
                <div className="col-md-12 text-center">
                  <div className="audio-visualizer-container mb-3">
                    <canvas 
                      ref={canvasRef} 
                      width="600" 
                      height="100" 
                      className="audio-visualizer"
                      style={{ 
                        display: (isRecording && !isPaused) ? 'block' : 'none',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px'
                      }}
                    ></canvas>
                    
                    {!isRecording && !audioUrl && (
                      <div className="visualizer-placeholder d-flex justify-content-center align-items-center" style={{ height: '100px' }}>
                        <FaMicrophone size={40} className="text-secondary opacity-50" />
                      </div>
                    )}
                    
                    {audioUrl && (
                      <div className="audio-player mb-3">
                        <audio 
                          ref={audioRef} 
                          src={audioUrl} 
                          controls 
                          className="w-100"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="recording-info mb-3">
                    <div className="recording-timer h3 mb-0">{formatTime(recordingTime)}</div>
                    <div className="recording-status text-muted">{recordingStatus}</div>
                  </div>
                  
                  <div className="recording-controls">
                    {!isRecording && !audioUrl && (
                      <button 
                        className="btn btn-danger btn-lg rounded-circle p-3 mx-2"
                        onClick={startRecording}
                      >
                        <FaMicrophone size={24} />
                      </button>
                    )}
                    
                    {isRecording && !isPaused && (
                      <>
                        <button 
                          className="btn btn-outline-secondary btn-lg rounded-circle p-3 mx-2"
                          onClick={pauseRecording}
                        >
                          <FaPause size={24} />
                        </button>
                        
                        <button 
                          className="btn btn-outline-danger btn-lg rounded-circle p-3 mx-2"
                          onClick={stopRecording}
                        >
                          <FaStop size={24} />
                        </button>
                      </>
                    )}
                    
                    {isRecording && isPaused && (
                      <>
                        <button 
                          className="btn btn-outline-primary btn-lg rounded-circle p-3 mx-2"
                          onClick={resumeRecording}
                        >
                          <FaPlay size={24} />
                        </button>
                        
                        <button 
                          className="btn btn-outline-danger btn-lg rounded-circle p-3 mx-2"
                          onClick={stopRecording}
                        >
                          <FaStop size={24} />
                        </button>
                      </>
                    )}
                    
                    {audioUrl && !isTranscribing && (
                      <>
                        <button 
                          className="btn btn-primary mx-2"
                          onClick={generateTranscription}
                          disabled={isTranscribing}
                        >
                          <FaFileAlt className="me-2" /> Transcribe Audio
                        </button>
                        
                        <button 
                          className="btn btn-outline-secondary mx-2"
                          onClick={resetRecording}
                        >
                          <FaTrash className="me-2" /> Discard
                        </button>
                      </>
                    )}
                    
                    {isTranscribing && (
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="statement-form">
              <div className="alert alert-success mb-4">
                <FaCheck className="me-2" /> Audio successfully transcribed
              </div>
              
              <form>
                <div className="mb-3">
                  <label htmlFor="date" className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    id="date"
                    name="date"
                    value={statementData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="content" className="form-label">Statement Content</label>
                  <textarea
                    className="form-control"
                    id="content"
                    name="content"
                    rows={6}
                    value={statementData.content}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                  <div className="form-text">Review and edit the transcribed statement if needed.</div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="recorded_by" className="form-label">Recorded By</label>
                    <input
                      type="text"
                      className="form-control"
                      id="recorded_by"
                      name="recorded_by"
                      value={statementData.recorded_by}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="location" className="form-label">Location</label>
                    <input
                      type="text"
                      className="form-control"
                      id="location"
                      name="location"
                      value={statementData.location}
                      onChange={handleInputChange}
                      placeholder="e.g., Police Station, Room 3B"
                      required
                    />
                  </div>
                </div>
                
                {audioUrl && (
                  <div className="mb-3">
                    <label className="form-label">Audio Recording</label>
                    <div className="d-flex align-items-center">
                      <FaFileAudio className="me-2 text-primary" size={20} />
                      <span>Audio recording attached</span>
                      <audio 
                        className="ms-3" 
                        controls 
                        src={audioUrl} 
                        style={{ height: '30px' }}
                      />
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
        <div className="card-footer d-flex justify-content-between">
          <button 
            className="btn btn-outline-secondary" 
            onClick={onCancel}
          >
            Cancel
          </button>
          
          {isProcessed && (
            <button 
              className="btn btn-primary" 
              onClick={handleSaveStatement}
            >
              <FaSave className="me-2" /> Save Statement
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatementRecording;
