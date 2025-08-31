import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaUserPlus, FaMapMarkerAlt, FaClock, FaSave, FaTimes } from 'react-icons/fa';

interface InterviewSchedulerProps {
  witnessId?: string;
  caseId?: string;
  onInterviewScheduled?: (interview: Interview) => void;
}

export interface Interview {
  id?: number;
  witness_id: number;
  case_id: number;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  location: string;
  interviewer_id: number;
  interviewer_name: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  interview_type: 'initial' | 'followup' | 'statement_verification' | 'evidence_review';
  notes: string;
  preparation_complete: boolean;
  recording_authorized: boolean;
}

interface Investigator {
  id: number;
  name: string;
  role: string;
  available: boolean;
}

interface Location {
  id: number;
  name: string;
  address: string;
  room: string;
  has_recording_equipment: boolean;
}

const InterviewScheduler: React.FC<InterviewSchedulerProps> = ({ witnessId, caseId, onInterviewScheduled }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const actualWitnessId = witnessId || id || '';
  
  const [interview, setInterview] = useState<Interview>({
    witness_id: parseInt(actualWitnessId),
    case_id: caseId ? parseInt(caseId) : 0,
    scheduled_date: '',
    scheduled_time: '',
    duration_minutes: 60,
    location: '',
    interviewer_id: 0,
    interviewer_name: '',
    status: 'scheduled',
    interview_type: 'initial',
    notes: '',
    preparation_complete: false,
    recording_authorized: false
  });
  
  const [availableInterviewers, setAvailableInterviewers] = useState<Investigator[]>([]);
  const [availableLocations, setAvailableLocations] = useState<Location[]>([]);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // In a real app, we would fetch available interviewers and locations based on the selected date/time
    // For now, we'll use mock data
    setAvailableInterviewers([
      { id: 1, name: 'Det. Sarah Johnson', role: 'Lead Investigator', available: true },
      { id: 2, name: 'Det. Michael Chen', role: 'Investigator', available: true },
      { id: 3, name: 'Officer Robert Davis', role: 'Patrol Officer', available: false },
      { id: 4, name: 'Sgt. Amanda Wilson', role: 'Interview Specialist', available: true },
    ]);
    
    setAvailableLocations([
      { id: 1, name: 'Police HQ', address: '123 Main St', room: 'Interview Room 1', has_recording_equipment: true },
      { id: 2, name: 'Police HQ', address: '123 Main St', room: 'Interview Room 2', has_recording_equipment: true },
      { id: 3, name: 'Police HQ', address: '123 Main St', room: 'Conference Room A', has_recording_equipment: false },
      { id: 4, name: 'District Office', address: '456 Park Ave', room: 'Interview Room', has_recording_equipment: true },
    ]);
  }, []);
  
  useEffect(() => {
    // Check for scheduling conflicts when date/time changes
    if (interview.scheduled_date && interview.scheduled_time) {
      // In a real app, this would be an API call to check for conflicts
      // For demo purposes, we'll simulate some conflicts
      const conflictCheck = Math.random() > 0.7;
      
      if (conflictCheck) {
        setConflicts(['The selected interviewer has another appointment at this time.']);
      } else {
        setConflicts([]);
      }
    }
  }, [interview.scheduled_date, interview.scheduled_time, interview.interviewer_id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInterview({ ...interview, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setInterview({ ...interview, [name]: checked });
  };

  const handleInterviewerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(e.target.value);
    const selectedInterviewer = availableInterviewers.find(i => i.id === selectedId);
    
    if (selectedInterviewer) {
      setInterview({
        ...interview,
        interviewer_id: selectedId,
        interviewer_name: selectedInterviewer.name
      });
    }
  };
  
  const handleLocationSelect = (locationId: number) => {
    const selectedLocation = availableLocations.find(l => l.id === locationId);
    
    if (selectedLocation) {
      setInterview({
        ...interview,
        location: `${selectedLocation.name} - ${selectedLocation.room}`
      });
    }
  };

  const validateForm = () => {
    if (!interview.scheduled_date) return false;
    if (!interview.scheduled_time) return false;
    if (!interview.location) return false;
    if (!interview.interviewer_id) return false;
    if (conflicts.length > 0) return false;
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    
    // In a real app, this would be an API call
    setTimeout(() => {
      const newInterview = {
        ...interview,
        id: Math.floor(Math.random() * 1000) // Mock ID generation
      };
      
      // Call the callback if provided
      if (onInterviewScheduled) {
        onInterviewScheduled(newInterview);
      }
      
      // Navigate back to witness detail or show success message
      setLoading(false);
      
      // Navigate back if we came from a detail page
      if (witnessId && !onInterviewScheduled) {
        navigate(`/witnesses/${witnessId}`);
      }
    }, 1000);
  };

  return (
    <div className="interview-scheduler card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h2 className="mb-0"><FaCalendarAlt className="me-2" /> Schedule Witness Interview</h2>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="scheduled_date" className="form-label">Interview Date</label>
                <input
                  type="date"
                  className="form-control"
                  id="scheduled_date"
                  name="scheduled_date"
                  value={interview.scheduled_date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="mb-3">
                <label htmlFor="scheduled_time" className="form-label">Start Time</label>
                <input
                  type="time"
                  className="form-control"
                  id="scheduled_time"
                  name="scheduled_time"
                  value={interview.scheduled_time}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="mb-3">
                <label htmlFor="duration_minutes" className="form-label">Duration (minutes)</label>
                <select
                  className="form-select"
                  id="duration_minutes"
                  name="duration_minutes"
                  value={interview.duration_minutes}
                  onChange={handleInputChange}
                  required
                >
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
              </div>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="interviewer_id" className="form-label">Interviewer</label>
                <select
                  className="form-select"
                  id="interviewer_id"
                  name="interviewer_id"
                  value={interview.interviewer_id}
                  onChange={handleInterviewerChange}
                  required
                >
                  <option value="">Select an interviewer</option>
                  {availableInterviewers.map(interviewer => (
                    <option 
                      key={interviewer.id} 
                      value={interviewer.id}
                      disabled={!interviewer.available}
                    >
                      {interviewer.name} ({interviewer.role})
                      {!interviewer.available ? ' - Unavailable' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="interview_type" className="form-label">Interview Type</label>
                <select
                  className="form-select"
                  id="interview_type"
                  name="interview_type"
                  value={interview.interview_type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="initial">Initial Interview</option>
                  <option value="followup">Follow-up Interview</option>
                  <option value="statement_verification">Statement Verification</option>
                  <option value="evidence_review">Evidence Review</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Interview Location</label>
            <div className="row">
              {availableLocations.map(location => (
                <div className="col-md-6 mb-2" key={location.id}>
                  <div 
                    className={`card location-card ${interview.location === `${location.name} - ${location.room}` ? 'border-primary' : ''}`}
                    onClick={() => handleLocationSelect(location.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-body py-2">
                      <div className="d-flex align-items-center">
                        <div className="location-icon me-3">
                          <FaMapMarkerAlt size={24} className={interview.location === `${location.name} - ${location.room}` ? 'text-primary' : 'text-secondary'} />
                        </div>
                        <div>
                          <h6 className="mb-0">{location.name} - {location.room}</h6>
                          <small className="text-muted">{location.address}</small>
                          {location.has_recording_equipment && (
                            <div className="badge bg-success mt-1">Recording Equipment</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="notes" className="form-label">Preparation Notes</label>
            <textarea
              className="form-control"
              id="notes"
              name="notes"
              rows={3}
              value={interview.notes}
              onChange={handleInputChange}
              placeholder="Enter any notes for interview preparation, topics to cover, evidence to review, etc."
            ></textarea>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="preparation_complete"
                  name="preparation_complete"
                  checked={interview.preparation_complete}
                  onChange={handleCheckboxChange}
                />
                <label className="form-check-label" htmlFor="preparation_complete">
                  Interview preparation materials ready
                </label>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="recording_authorized"
                  name="recording_authorized"
                  checked={interview.recording_authorized}
                  onChange={handleCheckboxChange}
                />
                <label className="form-check-label" htmlFor="recording_authorized">
                  Recording authorized
                </label>
              </div>
            </div>
          </div>

          {conflicts.length > 0 && (
            <div className="alert alert-warning mb-3">
              <h6>Scheduling Conflicts:</h6>
              <ul className="mb-0">
                {conflicts.map((conflict, index) => (
                  <li key={index}>{conflict}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="d-flex justify-content-end gap-2">
            <button 
              type="button" 
              className="btn btn-outline-secondary" 
              onClick={() => witnessId ? navigate(`/witnesses/${witnessId}`) : navigate(-1)}
            >
              <FaTimes className="me-2" /> Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={!validateForm() || loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Scheduling...
                </>
              ) : (
                <>
                  <FaSave className="me-2" /> Schedule Interview
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterviewScheduler;
