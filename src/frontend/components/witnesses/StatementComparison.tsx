import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaSync, FaCheckCircle, FaExclamationTriangle, FaMicrophone, FaStop } from 'react-icons/fa';

export interface Statement {
  id: number;
  date: string;
  content: string;
  recorded_by: string;
  location: string;
  verified: boolean;
  inconsistencies: string[] | null;
  keywords?: string[];
  sentiment_analysis?: {
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    key_concerns: string[];
  } | null;
  recording_url?: string;
}

interface ComparisonResult {
  matches: Array<{
    text: string;
    confidence: number;
  }>;
  inconsistencies: Array<{
    text: string;
    severity: 'low' | 'medium' | 'high';
    statements: number[];
  }>;
  timelineConsistency: 'low' | 'medium' | 'high';
  detailConsistency: 'low' | 'medium' | 'high';
  suggestedFollowupQuestions: string[];
}

interface StatementComparisonProps {
  statements: Statement[];
  preSelectedStatementIds?: number[];
}

const StatementComparison: React.FC<StatementComparisonProps> = ({ 
  statements,
  preSelectedStatementIds = []
}) => {
  const [selectedStatements, setSelectedStatements] = useState<number[]>(preSelectedStatementIds);
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult | null>(null);
  const [showRecordingInterface, setShowRecordingInterface] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null);
  const [transcription, setTranscription] = useState('');
  
  // Form state for new statement
  const [newStatement, setNewStatement] = useState<Partial<Statement>>({
    date: new Date().toISOString().split('T')[0],
    content: '',
    recorded_by: '',
    location: '',
    verified: false
  });

  // Initialize selected statements from preSelectedStatementIds
  useEffect(() => {
    if (preSelectedStatementIds.length > 0) {
      setSelectedStatements(preSelectedStatementIds);
      
      // If two or more statements are pre-selected, trigger comparison
      if (preSelectedStatementIds.length >= 2) {
        handleCompareStatements();
      }
    }
  }, [preSelectedStatementIds]);

  // Update timer when recording
  useEffect(() => {
    if (isRecording) {
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
  }, [isRecording]);

  const handleToggleStatementSelection = (statementId: number) => {
    setSelectedStatements(prev => {
      if (prev.includes(statementId)) {
        return prev.filter(id => id !== statementId);
      } else {
        return [...prev, statementId];
      }
    });
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingStatus('Recording in progress...');
    
    // Simulate recording process
    // In a real app, this would use the Web Audio API or a similar library
  };

  const stopRecording = () => {
    setIsRecording(false);
    setRecordingStatus('Processing audio...');
    
    // Simulate transcription process
    setTimeout(() => {
      setRecordingStatus('Transcription complete');
      const simulatedTranscripts = [
        "I was walking my dog near the bank around 3:30 PM when I heard a loud noise that sounded like shouting. I saw a man in dark clothing running out of the bank entrance. He was carrying what looked like a bag and got into a black car that was parked across the street.",
        "I was at the coffee shop across from the bank. I heard some commotion and looked up to see someone running out of the bank. They were wearing dark clothes, maybe a hoodie, and jumped into a car that was waiting with the engine running.",
        "I was walking back from lunch around 3:45 when I noticed someone exit the bank in a hurry. It was a man in dark clothes who ran to a car waiting nearby. The car looked like a sedan, possibly dark blue or black.",
        "I was standing at the bus stop when I saw someone run out of the bank. They were moving very quickly and got into a car across the street. Everything happened so fast, but I think the person was wearing a dark jacket or hoodie."
      ];
      
      const randomStatement = simulatedTranscripts[Math.floor(Math.random() * simulatedTranscripts.length)];
      setTranscription(randomStatement);
      setNewStatement(prev => ({...prev, content: randomStatement}));
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCompareStatements = () => {
    if (selectedStatements.length < 2) return;
    
    // In a real app, this would be an API call to a natural language processing service
    // For now, we'll simulate results
    setComparisonResults({
      matches: [
        { text: "Man in dark clothing/hoodie", confidence: 0.92 },
        { text: "Running from the bank", confidence: 0.87 },
        { text: "Got into a dark/black car", confidence: 0.78 }
      ],
      inconsistencies: [
        { 
          text: "Time of incident varies between 3:30 PM and 3:45 PM", 
          severity: "low", 
          statements: [0, 2] 
        },
        { 
          text: "Description of the car differs (sedan vs. unspecified)", 
          severity: "medium", 
          statements: [0, 1] 
        }
      ],
      timelineConsistency: "high",
      detailConsistency: "medium",
      suggestedFollowupQuestions: [
        "Can you describe the car in more detail?",
        "Did you notice the license plate?",
        "Could you identify the suspect from a lineup?",
        "Were there any other distinguishing features of the suspect?"
      ]
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewStatement(prev => ({...prev, [name]: value}));
  };

  const handleSubmitStatement = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newStatement.content || !newStatement.location) {
      alert("Please fill in all required fields");
      return;
    }
    
    // In a real app, this would be an API call
    const statementToAdd: Statement = {
      id: Date.now(), // Simulating a unique ID
      date: newStatement.date || new Date().toISOString().split('T')[0],
      content: newStatement.content || '',
      recorded_by: newStatement.recorded_by || '',
      location: newStatement.location || '',
      verified: false,
      inconsistencies: null,
      keywords: extractKeywords(newStatement.content || ''),
      sentiment_analysis: analyzeSentiment(newStatement.content || '')
    };
    
    // Reset form and recording interface
    setShowRecordingInterface(false);
    setTranscription('');
    setNewStatement({
      date: new Date().toISOString().split('T')[0],
      content: '',
      recorded_by: '',
      location: '',
      verified: false
    });
  };

  // Simple sentiment analysis simulation
  const analyzeSentiment = (text: string): Statement['sentiment_analysis'] => {
    const lowerText = text.toLowerCase();
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    let confidence = 0.7;
    const key_concerns: string[] = [];
    
    // Very simple rule-based analysis for demonstration
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

  // Simple keyword extraction simulation
  const extractKeywords = (text: string): string[] => {
    const words = text.toLowerCase().split(/\s+/);
    const keywords: string[] = [];
    
    // Simplified keyword extraction - in a real app, this would use NLP
    const potentialKeywords = [
      'bank', 'car', 'vehicle', 'gun', 'weapon', 'mask', 'face', 'run', 'running',
      'dark', 'black', 'hoodie', 'jacket', 'bag', 'money', 'loud', 'noise', 'shout',
      'time', 'afternoon', 'morning', 'night', 'license', 'plate', 'sedan', 'suv'
    ];
    
    potentialKeywords.forEach(keyword => {
      if (words.includes(keyword) && !keywords.includes(keyword)) {
        keywords.push(keyword);
      }
    });
    
    return keywords;
  };

  return (
    <div className="statement-comparison">
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Witness Statements</h5>
          <div>
            <button
              className="btn btn-primary me-2"
              onClick={() => setShowRecordingInterface(!showRecordingInterface)}
            >
              <FaFileAlt className="me-2" /> Record New Statement
            </button>
            <button
              className="btn btn-outline-primary"
              onClick={handleCompareStatements}
              disabled={selectedStatements.length < 2}
            >
              <FaSync className="me-2" /> Compare Selected
            </button>
          </div>
        </div>
        <div className="card-body">
          {statements.length === 0 ? (
            <div className="alert alert-info">
              No statements have been recorded for this witness yet.
            </div>
          ) : (
            <div className="statement-list">
              {statements.map((statement, index) => (
                <div key={statement.id} className="card mb-3">
                  <div className="card-header d-flex align-items-center">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`statement-${statement.id}`}
                        checked={selectedStatements.includes(statement.id)}
                        onChange={() => handleToggleStatementSelection(statement.id)}
                      />
                      <label className="form-check-label" htmlFor={`statement-${statement.id}`}>
                        Select for comparison
                      </label>
                    </div>
                    <div className="ms-auto d-flex align-items-center">
                      <span className="badge bg-secondary me-2">Statement #{index + 1}</span>
                      <span className="me-3">{new Date(statement.date).toLocaleDateString()}</span>
                      {statement.verified ? (
                        <span className="badge bg-success"><FaCheckCircle className="me-1" /> Verified</span>
                      ) : (
                        <span className="badge bg-warning text-dark"><FaExclamationTriangle className="me-1" /> Unverified</span>
                      )}
                    </div>
                  </div>
                  <div className="card-body">
                    <p className="statement-content">{statement.content}</p>
                    <div className="d-flex justify-content-between statement-meta">
                      <div><strong>Recorded by:</strong> {statement.recorded_by}</div>
                      <div><strong>Location:</strong> {statement.location}</div>
                    </div>
                    
                    {statement.keywords && statement.keywords.length > 0 && (
                      <div className="mt-2">
                        <strong>Keywords:</strong>
                        <div>
                          {statement.keywords.map((keyword, i) => (
                            <span key={i} className="badge bg-info text-dark me-1 mb-1">{keyword}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {statement.sentiment_analysis && (
                      <div className="mt-2">
                        <strong>Analysis:</strong>
                        <div className="d-flex align-items-center mb-1">
                          <span className="me-2">Confidence:</span>
                          <div className="progress flex-grow-1" style={{ height: '8px' }}>
                            <div 
                              className="progress-bar" 
                              role="progressbar" 
                              style={{ width: `${statement.sentiment_analysis.confidence * 100}%` }}
                              aria-valuenow={statement.sentiment_analysis.confidence * 100}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            ></div>
                          </div>
                          <span className="ms-2">{Math.round(statement.sentiment_analysis.confidence * 100)}%</span>
                        </div>
                        
                        {statement.sentiment_analysis.key_concerns.length > 0 && (
                          <div>
                            <span className="text-warning"><FaExclamationTriangle className="me-1" /> Concerns:</span>
                            <ul className="mb-0 ps-4">
                              {statement.sentiment_analysis.key_concerns.map((concern, i) => (
                                <li key={i}>{concern}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {statement.inconsistencies && statement.inconsistencies.length > 0 && (
                      <div className="mt-2">
                        <strong className="text-danger">Inconsistencies:</strong>
                        <ul className="mb-0">
                          {statement.inconsistencies.map((inconsistency, i) => (
                            <li key={i}>{inconsistency}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {showRecordingInterface && (
            <div className="recording-interface card mt-4">
              <div className="card-header">
                <h5 className="mb-0">Record New Statement</h5>
              </div>
              <div className="card-body">
                {!transcription ? (
                  <div className="recording-controls text-center py-4">
                    <div className="recording-visualization mb-3">
                      {isRecording && (
                        <div className="audio-visualizer d-flex justify-content-center align-items-center">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <div 
                              key={i} 
                              className="audio-bar"
                              style={{ 
                                height: `${20 + Math.random() * 60}px`,
                                animationDelay: `${i * 0.1}s`
                              }}
                            ></div>
                          ))}
                        </div>
                      )}
                      <div className="recording-timer">{formatTime(recordingTime)}</div>
                      <div className="recording-status">{recordingStatus}</div>
                    </div>
                    
                    {!isRecording ? (
                      <button 
                        className="btn btn-danger btn-lg rounded-circle p-3"
                        onClick={startRecording}
                      >
                        <FaMicrophone size={24} />
                      </button>
                    ) : (
                      <button 
                        className="btn btn-outline-danger btn-lg rounded-circle p-3"
                        onClick={stopRecording}
                      >
                        <FaStop size={24} />
                      </button>
                    )}
                    <p className="mt-3">
                      {!isRecording ? 'Click to start recording' : 'Click to stop recording'}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitStatement}>
                    <div className="mb-3">
                      <label htmlFor="date" className="form-label">Date</label>
                      <input
                        type="date"
                        className="form-control"
                        id="date"
                        name="date"
                        value={newStatement.date}
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
                        rows={5}
                        value={newStatement.content}
                        onChange={handleInputChange}
                        required
                      ></textarea>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="recorded_by" className="form-label">Recorded By</label>
                        <input
                          type="text"
                          className="form-control"
                          id="recorded_by"
                          name="recorded_by"
                          value={newStatement.recorded_by}
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
                          value={newStatement.location}
                          onChange={handleInputChange}
                          placeholder="e.g., Police Station, Room 3B"
                          required
                        />
                      </div>
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setShowRecordingInterface(false);
                          setTranscription('');
                        }}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Save Statement
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {comparisonResults && selectedStatements.length >= 2 && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Statement Comparison Results</h5>
          </div>
          <div className="card-body">
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-header bg-success bg-opacity-10">
                    <h6 className="mb-0 text-success"><FaCheckCircle className="me-2" /> Consistent Elements</h6>
                  </div>
                  <div className="card-body">
                    {comparisonResults.matches.length > 0 ? (
                      <ul className="consistent-elements mb-0">
                        {comparisonResults.matches.map((match, index) => (
                          <li key={index} className="mb-2">
                            <div>{match.text}</div>
                            <div className="progress mt-1" style={{ height: '6px' }}>
                              <div 
                                className="progress-bar bg-success" 
                                role="progressbar" 
                                style={{ width: `${match.confidence * 100}%` }}
                                aria-valuenow={match.confidence * 100}
                                aria-valuemin={0}
                                aria-valuemax={100}
                              ></div>
                            </div>
                            <small className="text-muted">{Math.round(match.confidence * 100)}% confidence</small>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted">No consistent elements found between statements.</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-header bg-danger bg-opacity-10">
                    <h6 className="mb-0 text-danger"><FaExclamationTriangle className="me-2" /> Inconsistencies</h6>
                  </div>
                  <div className="card-body">
                    {comparisonResults.inconsistencies.length > 0 ? (
                      <ul className="inconsistent-elements mb-0">
                        {comparisonResults.inconsistencies.map((inconsistency, index) => (
                          <li key={index} className="mb-3">
                            <div className="d-flex align-items-center mb-1">
                              <span className={`badge bg-${inconsistency.severity === 'high' ? 'danger' : inconsistency.severity === 'medium' ? 'warning' : 'info'} me-2`}>
                                {inconsistency.severity.toUpperCase()}
                              </span>
                              <span>{inconsistency.text}</span>
                            </div>
                            <small className="text-muted">
                              Found in statements {inconsistency.statements.map(s => `#${s+1}`).join(', ')}
                            </small>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted">No inconsistencies found between statements.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <h6 className="mb-0">Timeline Consistency</h6>
                  </div>
                  <div className="card-body d-flex align-items-center">
                    <div className="consistency-indicator me-3">
                      {comparisonResults.timelineConsistency === 'high' ? (
                        <FaCheckCircle className="text-success" size={24} />
                      ) : comparisonResults.timelineConsistency === 'medium' ? (
                        <FaExclamationTriangle className="text-warning" size={24} />
                      ) : (
                        <FaExclamationTriangle className="text-danger" size={24} />
                      )}
                    </div>
                    <div>
                      <div className="fw-bold text-capitalize">{comparisonResults.timelineConsistency} Consistency</div>
                      <div className="text-muted small">
                        {comparisonResults.timelineConsistency === 'high' 
                          ? 'Timeline events are consistently described across statements'
                          : comparisonResults.timelineConsistency === 'medium'
                          ? 'Some minor timeline discrepancies exist between statements'
                          : 'Significant timeline inconsistencies detected across statements'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <h6 className="mb-0">Detail Consistency</h6>
                  </div>
                  <div className="card-body d-flex align-items-center">
                    <div className="consistency-indicator me-3">
                      {comparisonResults.detailConsistency === 'high' ? (
                        <FaCheckCircle className="text-success" size={24} />
                      ) : comparisonResults.detailConsistency === 'medium' ? (
                        <FaExclamationTriangle className="text-warning" size={24} />
                      ) : (
                        <FaExclamationTriangle className="text-danger" size={24} />
                      )}
                    </div>
                    <div>
                      <div className="fw-bold text-capitalize">{comparisonResults.detailConsistency} Consistency</div>
                      <div className="text-muted small">
                        {comparisonResults.detailConsistency === 'high' 
                          ? 'Details are consistently described across statements'
                          : comparisonResults.detailConsistency === 'medium'
                          ? 'Some detail variations exist between statements'
                          : 'Significant detail inconsistencies detected across statements'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">Suggested Follow-up Questions</h6>
              </div>
              <div className="card-body">
                {comparisonResults.suggestedFollowupQuestions.length > 0 ? (
                  <ul className="follow-up-questions mb-0">
                    {comparisonResults.suggestedFollowupQuestions.map((question, index) => (
                      <li key={index}>{question}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">No follow-up questions suggested.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatementComparison;
