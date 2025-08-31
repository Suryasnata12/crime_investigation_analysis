// src/frontend/pages/CaseDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Case {
  id: number;
  case_number: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  crime_type: string;
  crime_date: string;
  crime_location: string;
  opened_date: string;
  closed_date: string | null;
  investigator_id: number;
  investigator_name: string;
  department: string;
}

interface TimelineEvent {
  id: number;
  event_time: string;
  event_description: string;
  event_location: string | null;
  evidence_id: number | null;
  created_by: string;
  is_verified: boolean;
}

interface Note {
  id: number;
  note_text: string;
  created_at: string;
  updated_at: string | null;
  user_name: string;
  is_private: boolean;
}

interface Evidence {
  id: number;
  evidence_number: string;
  type: string;
  description: string;
  location_found: string;
  status: string;
  reliability: string;
  collection_date: string;
}

interface Suspect {
  id: number;
  name: string;
  status: string;
  match_score: number;
}

interface Report {
  id: number;
  title: string;
  created_at: string;
  analyst_name: string;
  analysis_type: string;
  is_final: boolean;
}

const CaseDetail: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const { hasPermission, user } = useAuth();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [suspects, setSuspects] = useState<Suspect[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCaseDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API call with timeout
        setTimeout(() => {
          // Sample case data
          const sampleCase: Case = {
            id: 1,
            case_number: "CR-2025-0421",
            title: "Downtown Robbery Investigation",
            description: "Investigation into the armed robbery at First National Bank on Main Street",
            status: "active",
            priority: "high",
            crime_type: "Robbery",
            crime_date: "2025-03-15T14:30:00",
            crime_location: "First National Bank, 123 Main St.",
            opened_date: "2025-03-15T15:15:00",
            closed_date: null,
            investigator_id: 1,
            investigator_name: "Det. Sarah Johnson",
            department: "Criminal Investigation Division"
          };
          
          // Sample timeline events
          const sampleEvents: TimelineEvent[] = [
            {
              id: 1,
              event_time: "2025-03-15T14:30:00",
              event_description: "Incident reported",
              event_location: "First National Bank",
              evidence_id: null,
              created_by: "Dispatch",
              is_verified: true
            },
            {
              id: 2,
              event_time: "2025-03-15T15:15:00",
              event_description: "First responders arrived at scene",
              event_location: "First National Bank",
              evidence_id: null,
              created_by: "Det. Sarah Johnson",
              is_verified: true
            },
            {
              id: 3,
              event_time: "2025-03-15T16:45:00",
              event_description: "Evidence collection began",
              event_location: "First National Bank",
              evidence_id: null,
              created_by: "Det. Sarah Johnson",
              is_verified: true
            }
          ];
          
          // Sample notes
          const sampleNotes: Note[] = [
            {
              id: 1,
              note_text: "Case opened following the robbery report.",
              created_at: "2025-03-15T15:30:00",
              updated_at: null,
              user_name: "Det. Sarah Johnson",
              is_private: false
            },
            {
              id: 2,
              note_text: "Initial witness interviews suggest 2 suspects, both male, one carrying a handgun.",
              created_at: "2025-03-15T17:45:00",
              updated_at: null,
              user_name: "Det. Sarah Johnson",
              is_private: false
            }
          ];
          
          // Sample evidence
          const sampleEvidence: Evidence[] = [
            {
              id: 1,
              evidence_number: "E001",
              type: "Fingerprint",
              description: "Fingerprint found on door handle",
              location_found: "Door handle",
              status: "analyzed",
              reliability: "high",
              collection_date: "2025-03-15T16:45:00"
            },
            {
              id: 2,
              evidence_number: "E002",
              type: "DNA Sample",
              description: "DNA sample collected from counter surface",
              location_found: "Counter surface",
              status: "processing",
              reliability: "unknown",
              collection_date: "2025-03-15T16:50:00"
            },
            {
              id: 3,
              evidence_number: "E003",
              type: "Surveillance Video",
              description: "Video footage from street camera",
              location_found: "Street camera",
              status: "analyzed",
              reliability: "medium",
              collection_date: "2025-03-16T09:15:00"
            }
          ];
          
          // Sample suspects
          const sampleSuspects: Suspect[] = [
            {
              id: 1,
              name: "John Doe",
              status: "Primary Suspect",
              match_score: 76
            },
            {
              id: 2,
              name: "Michael Smith",
              status: "Person of Interest",
              match_score: 42
            }
          ];
          
          // Sample reports
          const sampleReports: Report[] = [
            {
              id: 1,
              title: "Initial Analysis Report",
              created_at: "2025-03-17T14:30:00",
              analyst_name: "Dr. Emily Chen",
              analysis_type: "Fingerprint Analysis",
              is_final: true
            },
            {
              id: 2,
              title: "Witness Statement Analysis",
              created_at: "2025-03-18T09:45:00",
              analyst_name: "Dr. James Wilson",
              analysis_type: "Behavioral Analysis",
              is_final: false
            }
          ];
          
          setCaseData(sampleCase);
          setTimelineEvents(sampleEvents);
          setNotes(sampleNotes);
          setEvidence(sampleEvidence);
          setSuspects(sampleSuspects);
          setReports(sampleReports);
          setLoading(false);
        }, 1000);
        
        // When connected to real API:
        // const caseResponse = await axios.get(`/api/case/${caseId}`);
        // setCaseData(caseResponse.data);
        
        // const timelineResponse = await axios.get(`/api/case/${caseId}/timeline`);
        // setTimelineEvents(timelineResponse.data);
        
        // const notesResponse = await axios.get(`/api/case/${caseId}/notes`);
        // setNotes(notesResponse.data);
        
        // const evidenceResponse = await axios.get(`/api/evidence?case_id=${caseId}`);
        // setEvidence(evidenceResponse.data);
        
        // const suspectsResponse = await axios.get(`/api/suspect?case_id=${caseId}`);
        // setSuspects(suspectsResponse.data);
        
        // const reportsResponse = await axios.get(`/api/analysis/reports?case_id=${caseId}`);
        // setReports(reportsResponse.data);
        
        // setLoading(false);
      } catch (error) {
        console.error('Error fetching case details:', error);
        setError('Failed to load case details. Please try again.');
        setLoading(false);
      }
    };
    
    if (caseId) {
      fetchCaseDetails();
    }
  }, [caseId]);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const tabParam = queryParams.get('tab');
    
    if (tabParam && ['overview', 'timeline', 'evidence', 'suspects', 'notes', 'reports', 'collaboration'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
      case 'critical':
        return 'badge-danger';
      case 'medium':
        return 'badge-warning';
      default:
        return 'badge-info';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'badge-primary';
      case 'closed':
        return 'badge-success';
      case 'pending_analysis':
      case 'processing':
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  };

  const getReliabilityClass = (reliability: string) => {
    switch (reliability) {
      case 'high':
        return 'badge-success';
      case 'medium':
        return 'badge-warning';
      case 'low':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ 
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }}></div>
        <p style={{ marginTop: '1rem' }}>Loading case details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-body" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'var(--danger-color)' }}>{error}</p>
          <button 
            className="btn btn-primary" 
            style={{ marginTop: '1rem' }}
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="card">
        <div className="card-body" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Case not found.</p>
          <Link to="/cases" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Back to Cases
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="case-detail-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            {caseData.title}
          </h1>
          <div style={{ color: 'var(--text-secondary)' }}>
            Case #{caseData.case_number}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {hasPermission('case:update') && (
            <Link to={`/cases/${caseId}/edit`} className="btn btn-outline">
              Edit Case
            </Link>
          )}
          
          <Link to="/cases" className="btn btn-outline">
            Back to Cases
          </Link>
        </div>
      </div>
      
      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </div>
        <div 
          className={`tab ${activeTab === 'evidence' ? 'active' : ''}`}
          onClick={() => setActiveTab('evidence')}
        >
          Evidence
        </div>
        <div 
          className={`tab ${activeTab === 'suspects' ? 'active' : ''}`}
          onClick={() => setActiveTab('suspects')}
        >
          Suspects
        </div>
        <div 
          className={`tab ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          Timeline
        </div>
        <div 
          className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          Notes
        </div>
        <div 
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reports
        </div>
        <div 
          className={`tab ${activeTab === 'collaboration' ? 'active' : ''}`}
          onClick={() => setActiveTab('collaboration')}
        >
          Collaboration
        </div>
      </div>
      
      {activeTab === 'overview' && (
        <div className="case-overview">
          <div className="dashboard-grid">
            <div className="card">
              <div className="card-header">
                <h2>Case Details</h2>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.5rem 1rem' }}>
                  <div style={{ fontWeight: 500 }}>Status:</div>
                  <div>
                    <span className={`badge ${getStatusClass(caseData.status)}`}>
                      {caseData.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div style={{ fontWeight: 500 }}>Priority:</div>
                  <div>
                    <span className={`badge ${getPriorityClass(caseData.priority)}`}>
                      {caseData.priority}
                    </span>
                  </div>
                  
                  <div style={{ fontWeight: 500 }}>Crime Type:</div>
                  <div>{caseData.crime_type}</div>
                  
                  <div style={{ fontWeight: 500 }}>Crime Date:</div>
                  <div>{formatDate(caseData.crime_date)}</div>
                  
                  <div style={{ fontWeight: 500 }}>Location:</div>
                  <div>{caseData.crime_location}</div>
                  
                  <div style={{ fontWeight: 500 }}>Date Opened:</div>
                  <div>{formatDate(caseData.opened_date)}</div>
                  
                  {caseData.closed_date && (
                    <>
                      <div style={{ fontWeight: 500 }}>Date Closed:</div>
                      <div>{formatDate(caseData.closed_date)}</div>
                    </>
                  )}
                  
                  <div style={{ fontWeight: 500 }}>Investigator:</div>
                  <div>{caseData.investigator_name}</div>
                  
                  <div style={{ fontWeight: 500 }}>Department:</div>
                  <div>{caseData.department}</div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-header">
                <h2>Description</h2>
              </div>
              <div className="card-body">
                <p>{caseData.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'evidence' && (
        <div className="evidence-container">
          <div className="card">
            <div className="card-header">
              <h2>Evidence Items</h2>
              {hasPermission('evidence:create') && (
                <Link to={`/evidence/new?case_id=${caseId}`} className="btn btn-outline">
                  Add Evidence
                </Link>
              )}
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {evidence.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Type</th>
                      <th>Description</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Reliability</th>
                      <th>Collection Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evidence.map(item => (
                      <tr key={item.id}>
                        <td>
                          <Link to={`/evidence/${item.id}`}>
                            {item.evidence_number}
                          </Link>
                        </td>
                        <td>{item.type}</td>
                        <td>{item.description}</td>
                        <td>{item.location_found}</td>
                        <td>
                          <span className={`badge ${getStatusClass(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getReliabilityClass(item.reliability)}`}>
                            {item.reliability}
                          </span>
                        </td>
                        <td>{formatDate(item.collection_date)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Link to={`/evidence/${item.id}`} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                              View
                            </Link>
                            {hasPermission('evidence:update') && (
                              <Link to={`/evidence/${item.id}/edit`} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                                Edit
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No evidence items found for this case.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'suspects' && (
        <div className="suspects-container">
          <div className="card">
            <div className="card-header">
              <h2>Suspects</h2>
              {hasPermission('suspect:create') && (
                <Link to={`/suspects/new?case_id=${caseId}`} className="btn btn-outline">
                  Add Suspect
                </Link>
              )}
            </div>
            <div className="card-body">
              {suspects.length > 0 ? (
                <div>
                  {suspects.map(suspect => (
                    <div key={suspect.id} style={{ 
                      marginBottom: '1rem', 
                      padding: '1rem',
                      borderRadius: '0.25rem',
                      backgroundColor: 'white',
                      border: '1px solid var(--border-color)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Link to={`/suspects/${suspect.id}`} style={{ fontWeight: 600, fontSize: '1.125rem' }}>
                            {suspect.name}
                          </Link>
                          <div style={{ color: 'var(--text-secondary)' }}>
                            {suspect.status}
                          </div>
                        </div>
                        <div style={{ 
                          width: '60px', 
                          height: '60px', 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          backgroundColor: suspect.match_score > 70 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: suspect.match_score > 70 ? 'var(--danger-color)' : 'var(--warning-color)',
                          fontWeight: 'bold',
                          fontSize: '1.25rem'
                        }}>
                          {suspect.match_score}%
                        </div>
                      </div>
                      
                      <div style={{ marginTop: '1rem' }}>
                        <div style={{ marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Evidence Match Score</span>
                          <span>{suspect.match_score}%</span>
                        </div>
                        <div style={{ 
                          width: '100%', 
                          height: '8px', 
                          backgroundColor: '#e2e8f0', 
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{ 
                            width: `${suspect.match_score}%`, 
                            height: '100%', 
                            backgroundColor: suspect.match_score > 70 ? 'var(--danger-color)' : 'var(--warning-color)'
                          }}></div>
                        </div>
                      </div>
                      
                      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <Link to={`/suspects/${suspect.id}`} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem' }}>
                          View Details
                        </Link>
                        {hasPermission('suspect:update') && (
                          <Link to={`/suspects/${suspect.id}/edit`} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem' }}>
                            Edit
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No suspects have been added to this case.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'timeline' && (
        <div className="timeline-container">
          <div className="card">
            <div className="card-header">
              <h2>Case Timeline</h2>
              {hasPermission('timeline:add') && (
                <Link 
                  to={`/cases/${caseId}/events/add`}
                  className="btn btn-outline"
                >
                  Add Event
                </Link>
              )}
            </div>
            <div className="card-body">
              <div className="timeline">
                {timelineEvents.length > 0 ? (
                  timelineEvents.map(event => (
                    <div key={event.id} className="timeline-item">
                      <div className="timeline-time">
                        {formatDate(event.event_time)}
                      </div>
                      <div className="timeline-content">
                        <div>{event.event_description}</div>
                        {event.event_location && (
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Location: {event.event_location}
                          </div>
                        )}
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          Recorded by: {event.created_by}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1rem' }}>
                    No timeline events have been added to this case.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'notes' && (
        <div className="notes-container">
          <div className="card">
            <div className="card-header">
              <h2>Case Notes</h2>
              {hasPermission('note:add') && (
                <Link 
                  to={`/cases/${caseId}/notes/add`}
                  className="btn btn-outline"
                >
                  Add Note
                </Link>
              )}
            </div>
            <div className="card-body">
              {notes.length > 0 ? (
                <div>
                  {notes.map(note => (
                    <div key={note.id} style={{ 
                      borderBottom: '1px solid var(--border-color)', 
                      padding: '1rem 0',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div style={{ fontWeight: 500 }}>{note.user_name}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          {formatDate(note.created_at)}
                        </div>
                      </div>
                      <div>{note.note_text}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No notes have been added to this case.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'reports' && (
        <div className="reports-container">
          <div className="card">
            <div className="card-header">
              <h2>Analysis Reports</h2>
              {hasPermission('analysis:create') && (
                <Link 
                  to={`/cases/${caseId}/reports/add`}
                  className="btn btn-outline"
                >
                  Create Report
                </Link>
              )}
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {reports.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Analysis Type</th>
                      <th>Analyst</th>
                      <th>Created</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(report => (
                      <tr key={report.id}>
                        <td>
                          <Link to={`/analysis/${report.id}`}>
                            {report.title}
                          </Link>
                        </td>
                        <td>{report.analysis_type}</td>
                        <td>{report.analyst_name}</td>
                        <td>{formatDate(report.created_at)}</td>
                        <td>
                          <span className={`badge ${report.is_final ? 'badge-success' : 'badge-warning'}`}>
                            {report.is_final ? 'Final' : 'Draft'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Link to={`/analysis/${report.id}`} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                              View
                            </Link>
                            {hasPermission('analysis:update') && !report.is_final && (
                              <Link to={`/analysis/${report.id}/edit`} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                                Edit
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No analysis reports have been created for this case.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'collaboration' && (
        <div className="collaboration-container">
          <div className="card">
            <div className="card-header">
              <h2>Case Collaboration</h2>
              <div className="action-buttons">
                <Link to={`/cases/${caseId}/collaboration`} className="btn btn-primary">
                  Go to Collaboration Dashboard
                </Link>
              </div>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-body text-center">
                      <div className="feature-icon mb-3">
                        <i className="fas fa-users" style={{ fontSize: '2rem', color: 'var(--primary-color)' }}></i>
                      </div>
                      <h5>Team Members</h5>
                      <p>View and manage team members assigned to this case</p>
                      <Link to={`/cases/${caseId}/collaboration`} className="btn btn-sm btn-outline">
                        View Team
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-body text-center">
                      <div className="feature-icon mb-3">
                        <i className="fas fa-comments" style={{ fontSize: '2rem', color: 'var(--primary-color)' }}></i>
                      </div>
                      <h5>Discussion Board</h5>
                      <p>Threaded conversations with @mentions and attachments</p>
                      <Link to={`/cases/${caseId}/discussions`} className="btn btn-sm btn-outline">
                        View Discussions
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-body text-center">
                      <div className="feature-icon mb-3">
                        <i className="fas fa-tasks" style={{ fontSize: '2rem', color: 'var(--primary-color)' }}></i>
                      </div>
                      <h5>Task Tracker</h5>
                      <p>Kanban-style board for tracking investigation tasks</p>
                      <Link to={`/cases/${caseId}/tasks`} className="btn btn-sm btn-outline">
                        View Tasks
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mt-3">
                <div className="col-12">
                  <div className="card">
                    <div className="card-body">
                      <h5>Recent Activity</h5>
                      <div className="activity-preview">
                        <div className="activity-item d-flex align-items-center py-2">
                          <div className="avatar me-3">
                            <img 
                              src="https://randomuser.me/api/portraits/women/41.jpg" 
                              alt="User" 
                              className="rounded-circle"
                              width="32" 
                              height="32"
                            />
                          </div>
                          <div>
                            <strong>Det. Sarah Johnson</strong> created a new discussion thread <a href="#">"Key Evidence Found at Crime Scene"</a>
                            <div className="text-muted small">10 minutes ago</div>
                          </div>
                        </div>
                        <div className="activity-item d-flex align-items-center py-2">
                          <div className="avatar me-3">
                            <img 
                              src="https://randomuser.me/api/portraits/men/44.jpg" 
                              alt="User" 
                              className="rounded-circle"
                              width="32" 
                              height="32"
                            />
                          </div>
                          <div>
                            <strong>Captain David Wilson</strong> assigned a new task to <strong>Emily Rodriguez</strong>
                            <div className="text-muted small">25 minutes ago</div>
                          </div>
                        </div>
                        <div className="activity-item d-flex align-items-center py-2">
                          <div className="avatar me-3">
                            <img 
                              src="https://randomuser.me/api/portraits/men/42.jpg" 
                              alt="User" 
                              className="rounded-circle"
                              width="32" 
                              height="32"
                            />
                          </div>
                          <div>
                            <strong>Det. Michael Chen</strong> added a comment on discussion <a href="#">"Witness Statement Inconsistencies"</a>
                            <div className="text-muted small">45 minutes ago</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseDetail;