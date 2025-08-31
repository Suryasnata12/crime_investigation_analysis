// src/frontend/pages/TimelineEventForm.tsx
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface FormValues {
  event_time: string;
  event_description: string;
  event_location: string;
  is_verified: boolean;
}

const TimelineEventForm: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [values, setValues] = useState<FormValues>({
    event_time: new Date().toISOString().slice(0, 16),
    event_description: '',
    event_location: '',
    is_verified: false
  });
  
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setValues({
      ...values,
      [id]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when user types
    if (formErrors[id]) {
      setFormErrors({
        ...formErrors,
        [id]: ''
      });
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors: {[key: string]: string} = {};
    if (!values.event_description.trim()) {
      errors.event_description = "Event description is required";
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    // In a real app, this would be an API call
    // For demo purposes, we'll simulate it
    setTimeout(() => {
      // Navigate back to case detail page
      navigate(`/cases/${caseId}?tab=timeline`);
    }, 1000);
  };
  
  return (
    <div className="container py-4">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h2>Add Timeline Event</h2>
          <Link to={`/cases/${caseId}?tab=timeline`} className="btn btn-outline">
            Cancel
          </Link>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label htmlFor="event_time" className="form-label">Event Time</label>
              <input 
                type="datetime-local" 
                className="form-control" 
                id="event_time"
                value={values.event_time}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group mb-3">
              <label htmlFor="event_description" className="form-label">Description*</label>
              <textarea 
                className={`form-control ${formErrors.event_description ? 'is-invalid' : ''}`}
                id="event_description"
                value={values.event_description}
                onChange={handleInputChange}
                rows={3}
              ></textarea>
              {formErrors.event_description && (
                <div className="invalid-feedback">{formErrors.event_description}</div>
              )}
            </div>
            
            <div className="form-group mb-3">
              <label htmlFor="event_location" className="form-label">Location</label>
              <input 
                type="text" 
                className="form-control" 
                id="event_location"
                value={values.event_location}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-check mb-3">
              <input 
                type="checkbox" 
                className="form-check-input" 
                id="is_verified"
                checked={values.is_verified}
                onChange={handleInputChange}
              />
              <label className="form-check-label" htmlFor="is_verified">
                Mark as verified
              </label>
            </div>
            
            <div className="mt-4">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Event'}
              </button>
              <Link to={`/cases/${caseId}?tab=timeline`} className="btn btn-outline ms-2">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TimelineEventForm;
