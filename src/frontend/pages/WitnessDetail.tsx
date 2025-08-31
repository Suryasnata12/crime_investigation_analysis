import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  FaEdit, 
  FaTrash, 
  FaCalendarAlt, 
  FaFileAlt, 
  FaUserPlus, 
  FaMapMarkerAlt,
  FaMicrophone,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCommentDots,
  FaHistory,
  FaArrowLeft,
  FaBalanceScale,
  FaPhone,
  FaUserShield
} from 'react-icons/fa';
import StatementComparison, { Statement } from '../components/witnesses/StatementComparison';
import StatementRecording from '../components/witnesses/StatementRecording';
import CredibilityAssessment from '../components/witnesses/CredibilityAssessment';
import WitnessTimeline from '../components/witnesses/WitnessTimeline';
import ContactLogger from '../components/witnesses/ContactLogger';

type Interview = {
  id: number;
  scheduled_date: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  location: string;
  interviewer: string;
  notes: string;
};

type Witness = {
  id: number;
  name: string;
  contact: string;
  alternate_contact: string;
  relationship: string;
  status: string;
  reliability: string;
  age: number;
  gender: string;
  address: string;
  occupation: string;
  case_id: number;
  case_name: string;
  notes: string;
  statements: Statement[];
  interviews: Interview[];
  last_contact: string;
  background_check_complete: boolean;
  credibility_factors: {
    prior_criminal_history: boolean;
    known_associates: string[];
    previous_testimonies: number;
    inconsistencies_noted: boolean;
    relationship_to_case: string;
    bias_concerns: string[];
  };
  location_data: {
    lat: number;
    lng: number;
    description: string;
  } | null;
};

interface WitnessDetailProps {
  isNewWitness?: boolean;
}

const WitnessDetail: React.FC<WitnessDetailProps> = ({ isNewWitness = false }) => {
  const { witnessId } = useParams<{ witnessId: string }>();
  const navigate = useNavigate();
  const [witness, setWitness] = useState<Witness | null>(null);
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [loading, setLoading] = useState(true);
  const [showRecordingInterface, setShowRecordingInterface] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState('');
  const [transcription, setTranscription] = useState('');
  const [selectedStatementIds, setSelectedStatementIds] = useState<number[]>([]);
  const [contactHistory, setContactHistory] = useState<{id: number, date: string, time: string, type: string, description: string, user: string}[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [showContactLogger, setShowContactLogger] = useState(false);

  useEffect(() => {
    // Simulate API fetch
    setLoading(true);
    setTimeout(() => {
      // Mock data for a witness
      const mockWitness: Witness = {
        id: parseInt(witnessId || '1'),
        name: 'Jane Smith',
        contact: '555-123-4567',
        alternate_contact: '555-987-6543',
        relationship: 'Bystander',
        status: 'Cooperative',
        reliability: 'High',
        age: 34,
        gender: 'Female',
        address: '123 Main St, Anytown, USA',
        occupation: 'Accountant',
        case_id: 1,
        case_name: 'Downtown Robbery',
        notes: 'Witnessed the suspect fleeing the scene. Has provided consistent statements so far.',
        last_contact: '2025-04-01',
        background_check_complete: true,
        statements: [
          {
            id: 1,
            date: '2025-03-15',
            content: 'I saw a man wearing a black hoodie running from the bank at approximately 3:45 PM. He was carrying a small bag and got into a dark sedan waiting across the street.',
            recorded_by: 'Officer Johnson',
            location: 'Police Station',
            verified: true,
            inconsistencies: null
          },
          {
            id: 2,
            date: '2025-03-20',
            content: 'Upon viewing the security footage, I can confirm the man I saw was the same individual shown in the footage. I remember he had distinctive red shoes.',
            recorded_by: 'Detective Williams',
            location: 'Police Station',
            verified: true,
            inconsistencies: null
          }
        ],
        interviews: [
          {
            id: 1,
            scheduled_date: '2025-03-15 10:00 AM',
            status: 'completed',
            location: 'Police Station, Room 3B',
            interviewer: 'Officer Johnson',
            notes: 'Witness was cooperative and provided clear details.'
          },
          {
            id: 2,
            scheduled_date: '2025-03-20 2:30 PM',
            status: 'completed',
            location: 'Police Station, Room 2A',
            interviewer: 'Detective Williams',
            notes: 'Follow-up interview with security footage review.'
          },
          {
            id: 3,
            scheduled_date: '2025-04-10 10:00 AM',
            status: 'scheduled',
            location: 'Police Station, Room 1C',
            interviewer: 'Detective Williams',
            notes: 'Follow-up interview to clarify vehicle details.'
          }
        ],
        credibility_factors: {
          prior_criminal_history: false,
          known_associates: [],
          previous_testimonies: 1,
          inconsistencies_noted: false,
          relationship_to_case: 'direct_witness',
          bias_concerns: []
        },
        location_data: {
          lat: 40.7128,
          lng: -74.0060,
          description: 'Corner of Main St. and 5th Ave, approximately 100 feet from bank entrance'
        }
      };
      setWitness(mockWitness);

      // Generate mock contact history
      const mockContactHistory = [
        {
          id: 1,
          date: '2025-03-15',
          time: '10:15:00',
          type: 'phone',
          description: 'Initial contact to request witness statement',
          user: 'Officer Johnson'
        },
        {
          id: 2,
          date: '2025-03-18',
          time: '14:30:00',
          type: 'email',
          description: 'Follow-up regarding interview scheduling',
          user: 'Detective Williams'
        },
        {
          id: 3,
          date: '2025-04-01',
          time: '09:45:00',
          type: 'phone',
          description: 'Reminder for upcoming interview on April 10',
          user: 'Office Admin Sarah'
        }
      ];
      setContactHistory(mockContactHistory);

      // Generate mock timeline events
      const mockTimelineEvents = [
        {
          id: 1,
          date: '2025-03-15',
          time: '10:00:00',
          type: 'interview',
          description: 'Initial interview conducted. Witness was cooperative and provided detailed account.',
          user: 'Officer Johnson',
          relatedId: 1
        },
        {
          id: 2,
          date: '2025-03-15',
          time: '11:30:00',
          type: 'statement',
          description: 'First statement recorded regarding suspect description and timeline of events.',
          user: 'Officer Johnson',
          relatedId: 1
        },
        {
          id: 3,
          date: '2025-03-20',
          time: '14:00:00',
          type: 'interview',
          description: 'Follow-up interview with security footage review.',
          user: 'Detective Williams',
          relatedId: 2
        },
        {
          id: 4,
          date: '2025-03-20',
          time: '15:45:00',
          type: 'statement',
          description: 'Second statement recorded confirming identification of suspect in security footage.',
          user: 'Detective Williams',
          relatedId: 2
        },
        {
          id: 5,
          date: '2025-04-01',
          time: '09:45:00',
          type: 'contact',
          description: 'Phone call to confirm upcoming interview on April 10.',
          user: 'Office Admin Sarah'
        },
        {
          id: 6,
          date: '2025-04-03',
          time: '16:30:00',
          type: 'status_change',
          description: 'Witness status updated to "Cooperative" based on consistent availability and willingness to assist.',
          user: 'Detective Williams'
        }
      ];
      setTimelineEvents(mockTimelineEvents);

      setLoading(false);
    }, 800);
  }, [witnessId]);

  const handleStatementRecorded = (newStatement: Statement) => {
    if (!witness) return;
    
    // Add the new statement to the witness statements array
    const updatedWitness = {
      ...witness,
      statements: [...witness.statements, newStatement]
    };
    
    setWitness(updatedWitness);
    setShowRecordingInterface(false);
    
    // Add to timeline events
    const newEvent = {
      id: timelineEvents.length + 1,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0],
      type: 'statement',
      description: `New statement recorded: ${newStatement.content.substring(0, 50)}...`,
      user: 'Current User',
      relatedId: newStatement.id
    };
    setTimelineEvents([...timelineEvents, newEvent]);
  };

  const handleContactLogged = (newContact: any) => {
    // Add to contact history
    setContactHistory([...contactHistory, newContact]);
    setShowContactLogger(false);
    
    // Add to timeline events
    const newEvent = {
      id: timelineEvents.length + 1,
      date: newContact.date,
      time: newContact.time,
      type: 'contact',
      description: newContact.description,
      user: newContact.user
    };
    setTimelineEvents([...timelineEvents, newEvent]);
  };
  
  const handleCredibilityUpdate = (updatedFactors: any) => {
    if (!witness) return;
    
    const updatedWitness = {
      ...witness,
      credibility_factors: updatedFactors
    };
    setWitness(updatedWitness);
    
    // Add to timeline events
    const newEvent = {
      id: timelineEvents.length + 1,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0],
      type: 'credibility_change',
      description: `Witness credibility assessment updated. New reliability score: ${updatedFactors.reliability_score || 'N/A'}`,
      user: 'Current User'
    };
    setTimelineEvents([...timelineEvents, newEvent]);
  };

  const toggleStatementSelection = (statementId: number) => {
    setSelectedStatementIds(prev => {
      if (prev.includes(statementId)) {
        return prev.filter(id => id !== statementId);
      } else {
        return [...prev, statementId];
      }
    });
  };

  const getSelectedStatements = () => {
    if (!witness) return [];
    return witness.statements.filter(statement => selectedStatementIds.includes(statement.id));
  };

  const scheduleInterview = () => {
    navigate(`/witnesses/${witnessId}/schedule-interview`);
  };

  return (
    <div className="witness-detail">
      <div className="container py-4">
        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading witness information...</p>
          </div>
        ) : witness ? (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center">
                <h2 className="mb-0">{witness.name}</h2>
                <span className={`badge ms-3 ${witness.status === 'Cooperative' ? 'bg-success' : 'bg-warning text-dark'}`}>
                  {witness.status}
                </span>
              </div>
              <div>
                <button className="btn btn-outline-primary me-2">
                  <FaEdit className="me-2" /> Edit Witness
                </button>
                <button className="btn btn-outline-danger">
                  <FaTrash className="me-2" /> Remove
                </button>
              </div>
            </div>

            <ul className="nav nav-tabs mb-4">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  Profile
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'statements' ? 'active' : ''}`}
                  onClick={() => setActiveTab('statements')}
                >
                  Statements
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'interviews' ? 'active' : ''}`}
                  onClick={() => setActiveTab('interviews')}
                >
                  Interviews
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'location' ? 'active' : ''}`}
                  onClick={() => setActiveTab('location')}
                >
                  Location
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'credibility' ? 'active' : ''}`}
                  onClick={() => setActiveTab('credibility')}
                >
                  Credibility
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'contact_history' ? 'active' : ''}`}
                  onClick={() => setActiveTab('contact_history')}
                >
                  Contact History
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'timeline' ? 'active' : ''}`}
                  onClick={() => setActiveTab('timeline')}
                >
                  Timeline
                </button>
              </li>
            </ul>

            {activeTab === 'profile' && (
              <div className="witness-profile">
                <div className="row">
                  <div className="col-md-6">
                    <div className="card mb-4">
                      <div className="card-header">
                        <h5 className="mb-0">Personal Information</h5>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <strong>Name:</strong> {witness.name}
                        </div>
                        <div className="mb-3">
                          <strong>Contact:</strong> {witness.contact}
                        </div>
                        <div className="mb-3">
                          <strong>Alternate Contact:</strong> {witness.alternate_contact || 'N/A'}
                        </div>
                        <div className="mb-3">
                          <strong>Age:</strong> {witness.age}
                        </div>
                        <div className="mb-3">
                          <strong>Gender:</strong> {witness.gender}
                        </div>
                        <div className="mb-3">
                          <strong>Address:</strong> {witness.address}
                        </div>
                        <div className="mb-3">
                          <strong>Occupation:</strong> {witness.occupation}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card mb-4">
                      <div className="card-header">
                        <h5 className="mb-0">Case Information</h5>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <strong>Case:</strong> <Link to={`/cases/${witness.case_id}`}>{witness.case_name}</Link>
                        </div>
                        <div className="mb-3">
                          <strong>Relationship to Case:</strong> {witness.relationship}
                        </div>
                        <div className="mb-3">
                          <strong>Status:</strong> <span className={`badge ${witness.status === 'Cooperative' ? 'bg-success' : 'bg-warning text-dark'}`}>{witness.status}</span>
                        </div>
                        <div className="mb-3">
                          <strong>Reliability:</strong> <span className={`badge ${witness.reliability === 'High' ? 'bg-success' : witness.reliability === 'Medium' ? 'bg-warning text-dark' : 'bg-danger'}`}>{witness.reliability}</span>
                        </div>
                        <div className="mb-3">
                          <strong>Statements:</strong> {witness.statements.length}
                        </div>
                        <div className="mb-3">
                          <strong>Last Contact:</strong> {new Date(witness.last_contact).toLocaleDateString()}
                        </div>
                        <div className="mb-3">
                          <strong>Background Check:</strong> {witness.background_check_complete ? <FaCheckCircle className="text-success" /> : <FaExclamationTriangle className="text-warning" />}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">Notes</h5>
                  </div>
                  <div className="card-body">
                    <p>{witness.notes}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'statements' && (
              <div className="witness-statements">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="mb-0">Witness Statements</h4>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowRecordingInterface(!showRecordingInterface)}
                  >
                    <FaMicrophone className="me-2" /> {showRecordingInterface ? 'Cancel Recording' : 'Record New Statement'}
                  </button>
                </div>

                {showRecordingInterface ? (
                  <div className="mb-4">
                    <StatementRecording 
                      witnessId={witnessId || ''}
                      witnessName={witness?.name || ''}
                      onStatementSaved={handleStatementRecorded}
                      onCancel={() => setShowRecordingInterface(false)}
                    />
                  </div>
                ) : (
                  <>
                    {witness.statements.length === 0 ? (
                      <div className="alert alert-info">
                        <p className="mb-0">No statements have been recorded for this witness yet.</p>
                      </div>
                    ) : (
                      <div className="statement-list mb-4">
                        {witness.statements.map((statement) => (
                          <div key={statement.id} className="card mb-3">
                            <div className="card-header d-flex align-items-center">
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`select-statement-${statement.id}`}
                                  checked={selectedStatementIds.includes(statement.id)}
                                  onChange={() => toggleStatementSelection(statement.id)}
                                />
                                <label className="form-check-label" htmlFor={`select-statement-${statement.id}`}>
                                  Select for comparison
                                </label>
                              </div>
                              <div className="ms-auto d-flex align-items-center">
                                <span className="badge bg-secondary me-2">
                                  {new Date(statement.date).toLocaleDateString()}
                                </span>
                                {statement.verified ? (
                                  <span className="badge bg-success"><FaCheckCircle className="me-1" /> Verified</span>
                                ) : (
                                  <span className="badge bg-warning text-dark"><FaExclamationTriangle className="me-1" /> Unverified</span>
                                )}
                              </div>
                            </div>
                            <div className="card-body">
                              <p className="mb-3">{statement.content}</p>
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
                              
                              {statement.recording_url && (
                                <div className="mt-2">
                                  <strong>Recording:</strong>
                                  <audio src={statement.recording_url} controls className="mt-1" style={{height: '30px'}}></audio>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5>Statement Comparison</h5>
                      <div>
                        <span className="badge bg-secondary">
                          {selectedStatementIds.length} statements selected
                        </span>
                      </div>
                    </div>
                    
                    {selectedStatementIds.length >= 2 ? (
                      <StatementComparison 
                        statements={getSelectedStatements()}
                        preSelectedStatementIds={selectedStatementIds}
                      />
                    ) : (
                      <div className="alert alert-info">
                        <p className="mb-0">Select at least two statements to compare them for inconsistencies.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'interviews' && (
              <div className="witness-interviews">
                <div className="card mb-4">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Interviews</h5>
                    <button className="btn btn-primary" onClick={scheduleInterview}>
                      <FaCalendarAlt className="me-2" /> Schedule Interview
                    </button>
                  </div>
                  <div className="card-body">
                    {witness.interviews.length === 0 ? (
                      <div className="alert alert-info">
                        No interviews have been scheduled for this witness yet.
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Date & Time</th>
                              <th>Status</th>
                              <th>Location</th>
                              <th>Interviewer</th>
                              <th>Notes</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {witness.interviews.map(interview => (
                              <tr key={interview.id}>
                                <td>{interview.scheduled_date}</td>
                                <td>
                                  <span className={`badge ${
                                    interview.status === 'completed' ? 'bg-success' : 
                                    interview.status === 'cancelled' ? 'bg-danger' : 
                                    'bg-primary'
                                  }`}>
                                    {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                                  </span>
                                </td>
                                <td>{interview.location}</td>
                                <td>{interview.interviewer}</td>
                                <td>{interview.notes.substring(0, 50)}{interview.notes.length > 50 ? '...' : ''}</td>
                                <td>
                                  <div className="btn-group btn-group-sm">
                                    <button className="btn btn-outline-primary">
                                      <FaEdit />
                                    </button>
                                    {interview.status === 'scheduled' && (
                                      <>
                                        <button className="btn btn-outline-success">
                                          <FaCheckCircle />
                                        </button>
                                        <button className="btn btn-outline-danger">
                                          <FaTrash />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'location' && (
              <div className="witness-location">
                {witness.location_data ? (
                  <div className="card mb-4">
                    <div className="card-header">
                      <h5 className="mb-0">Witness Location</h5>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <strong>Description:</strong> {witness.location_data.description}
                      </div>
                      <div className="mb-3">
                        <strong>Coordinates:</strong> {witness.location_data.lat}, {witness.location_data.lng}
                      </div>
                      <div className="location-map" style={{ height: '400px', backgroundColor: '#eee' }}>
                        <div className="d-flex justify-content-center align-items-center h-100">
                          <p className="text-muted">Map would be displayed here</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="alert alert-info">
                    No location data is available for this witness.
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'credibility' && (
              <div className="witness-credibility">
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">Credibility Assessment</h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="card mb-3">
                          <div className="card-header bg-light">
                            <h6 className="mb-0">Background Factors</h6>
                          </div>
                          <div className="card-body">
                            <div className="mb-2">
                              <strong>Prior Criminal History:</strong> {witness.credibility_factors.prior_criminal_history ? 'Yes' : 'No'}
                            </div>
                            <div className="mb-2">
                              <strong>Previous Testimonies:</strong> {witness.credibility_factors.previous_testimonies}
                            </div>
                            <div className="mb-2">
                              <strong>Known Associates:</strong> {witness.credibility_factors.known_associates.length ? 
                                witness.credibility_factors.known_associates.join(', ') : 'None'}
                            </div>
                            <div className="mb-2">
                              <strong>Inconsistencies Noted:</strong> {witness.credibility_factors.inconsistencies_noted ? 'Yes' : 'No'}
                            </div>
                            <div className="mb-2">
                              <strong>Relationship to Case:</strong> {witness.credibility_factors.relationship_to_case}
                            </div>
                            <div className="mb-2">
                              <strong>Bias Concerns:</strong> {witness.credibility_factors.bias_concerns.length ? 
                                witness.credibility_factors.bias_concerns.join(', ') : 'None'}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card mb-3">
                          <div className="card-header bg-light">
                            <h6 className="mb-0">Reliability Assessment</h6>
                          </div>
                          <div className="card-body">
                            <div className="mb-3">
                              <strong>Overall Reliability Rating:</strong> 
                              <div className="mt-2">
                                <div className="progress">
                                  <div 
                                    className={`progress-bar ${
                                      witness.reliability === 'High' ? 'bg-success' : 
                                      witness.reliability === 'Medium' ? 'bg-warning' : 
                                      'bg-danger'
                                    }`} 
                                    role="progressbar" 
                                    style={{ 
                                      width: `${
                                        witness.reliability === 'High' ? '85%' : 
                                        witness.reliability === 'Medium' ? '50%' : 
                                        '25%'
                                      }`
                                    }}
                                    aria-valuenow={
                                      witness.reliability === 'High' ? 85 : 
                                      witness.reliability === 'Medium' ? 50 : 
                                      25
                                    }
                                    aria-valuemin={0} 
                                    aria-valuemax={100}
                                  >
                                    {witness.reliability}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div>
                              <strong>Factors Affecting Reliability:</strong>
                              <ul className="mt-2">
                                {witness.reliability === 'High' ? (
                                  <>
                                    <li>Consistent statements</li>
                                    <li>Detailed descriptions</li>
                                    <li>No personal interest in case outcome</li>
                                  </>
                                ) : witness.reliability === 'Medium' ? (
                                  <>
                                    <li>Some minor inconsistencies</li>
                                    <li>Limited view of events</li>
                                  </>
                                ) : (
                                  <>
                                    <li>Significant inconsistencies</li>
                                    <li>Potential bias or personal interest</li>
                                    <li>Credibility concerns</li>
                                  </>
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <CredibilityAssessment 
                      witnessId={witnessId || "0"} 
                      initialFactors={witness.credibility_factors} 
                      onSave={handleCredibilityUpdate} 
                    />
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'contact_history' && (
              <div className="witness-contact-history">
                <div className="card mb-4">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Contact History</h5>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowContactLogger(!showContactLogger)}
                    >
                      <FaCommentDots className="me-2" /> Log Contact
                    </button>
                  </div>
                  <div className="card-body">
                    {contactHistory.length === 0 ? (
                      <div className="alert alert-info">
                        No contact history is available for this witness.
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Time</th>
                              <th>Type</th>
                              <th>Description</th>
                              <th>User</th>
                            </tr>
                          </thead>
                          <tbody>
                            {contactHistory.map(contact => (
                              <tr key={contact.id}>
                                <td>{contact.date}</td>
                                <td>{contact.time}</td>
                                <td>{contact.type}</td>
                                <td>{contact.description.substring(0, 50)}{contact.description.length > 50 ? '...' : ''}</td>
                                <td>{contact.user}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
                {showContactLogger && (
                  <ContactLogger 
                    witnessId={witnessId || "0"} 
                    witnessName={witness?.name || "Unknown Witness"}
                    onContactLogged={handleContactLogged} 
                    onCancel={() => setShowContactLogger(false)} 
                  />
                )}
              </div>
            )}
            
            {activeTab === 'timeline' && (
              <div className="witness-timeline">
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">Timeline</h5>
                  </div>
                  <div className="card-body">
                    {timelineEvents.length === 0 ? (
                      <div className="alert alert-info">
                        No timeline events are available for this witness.
                      </div>
                    ) : (
                      <WitnessTimeline 
                        witnessId={witnessId || "0"} 
                        events={timelineEvents} 
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="alert alert-danger">
            Witness not found. Please check the witness ID and try again.
          </div>
        )}
      </div>
    </div>
  );
};

export default WitnessDetail;
