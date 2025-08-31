// src/frontend/pages/CaseNoteForm.tsx
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface FormValues {
  note_text: string;
  is_private: boolean;
}

const CaseNoteForm: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [values, setValues] = useState<FormValues>({
    note_text: '',
    is_private: false
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
    if (!values.note_text.trim()) {
      errors.note_text = "Note text is required";
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
      navigate(`/cases/${caseId}?tab=notes`);
    }, 1000);
  };
  
  return (
    <div className="container py-4">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h2>Add Case Note</h2>
          <Link to={`/cases/${caseId}?tab=notes`} className="btn btn-outline">
            Cancel
          </Link>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label htmlFor="note_text" className="form-label">Note*</label>
              <textarea 
                className={`form-control ${formErrors.note_text ? 'is-invalid' : ''}`}
                id="note_text"
                value={values.note_text}
                onChange={handleInputChange}
                rows={5}
                placeholder="Enter your note here..."
              ></textarea>
              {formErrors.note_text && (
                <div className="invalid-feedback">{formErrors.note_text}</div>
              )}
            </div>
            
            <div className="form-check mb-3">
              <input 
                type="checkbox" 
                className="form-check-input" 
                id="is_private"
                checked={values.is_private}
                onChange={handleInputChange}
              />
              <label className="form-check-label" htmlFor="is_private">
                Mark as private
              </label>
              <small className="form-text text-muted d-block">
                Private notes are only visible to you and administrators.
              </small>
            </div>
            
            <div className="mt-4">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Note'}
              </button>
              <Link to={`/cases/${caseId}?tab=notes`} className="btn btn-outline ms-2">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CaseNoteForm;
