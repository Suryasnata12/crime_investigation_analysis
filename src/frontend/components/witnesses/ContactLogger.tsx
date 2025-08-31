import React, { useState } from 'react';
import { FaPhone, FaEnvelope, FaComments, FaUser, FaCalendarAlt, FaClock, FaSave, FaTimes } from 'react-icons/fa';

interface ContactLogEntry {
  id?: number;
  date: string;
  time: string;
  type: 'phone' | 'email' | 'in_person' | 'other';
  description: string;
  user: string;
  witness_id: string;
  case_id?: string;
  duration_minutes?: number;
  followup_required?: boolean;
  followup_date?: string;
}

interface ContactLoggerProps {
  witnessId: string;
  caseName?: string;
  witnessName: string;
  onContactLogged: (contact: ContactLogEntry) => void;
  onCancel: () => void;
}

const ContactLogger: React.FC<ContactLoggerProps> = ({
  witnessId,
  caseName,
  witnessName,
  onContactLogged,
  onCancel
}) => {
  const currentDate = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toTimeString().split(' ')[0].substring(0, 5);
  
  const [contact, setContact] = useState<ContactLogEntry>({
    date: currentDate,
    time: currentTime,
    type: 'phone',
    description: '',
    user: 'Current User', // Would be replaced with actual logged in user in a real app
    witness_id: witnessId,
    followup_required: false
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContact({ ...contact, [name]: value });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setContact({ ...contact, [name]: checked });
  };
  
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!contact.date) newErrors.date = "Date is required";
    if (!contact.time) newErrors.time = "Time is required";
    if (!contact.description) newErrors.description = "Description is required";
    if (contact.followup_required && !contact.followup_date) {
      newErrors.followup_date = "Followup date is required when followup is needed";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // In a real app, this would make an API call
      onContactLogged({
        ...contact,
        id: Date.now() // Temporary ID generation for mock data
      });
    }
  };
  
  return (
    <div className="contact-logger">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Log Contact with {witnessName}</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="date" className="form-label">Date</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <FaCalendarAlt />
                  </span>
                  <input
                    type="date"
                    className={`form-control ${errors.date ? 'is-invalid' : ''}`}
                    id="date"
                    name="date"
                    value={contact.date}
                    onChange={handleInputChange}
                  />
                  {errors.date && <div className="invalid-feedback">{errors.date}</div>}
                </div>
              </div>
              <div className="col-md-6">
                <label htmlFor="time" className="form-label">Time</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <FaClock />
                  </span>
                  <input
                    type="time"
                    className={`form-control ${errors.time ? 'is-invalid' : ''}`}
                    id="time"
                    name="time"
                    value={contact.time}
                    onChange={handleInputChange}
                  />
                  {errors.time && <div className="invalid-feedback">{errors.time}</div>}
                </div>
              </div>
            </div>
            
            <div className="mb-3">
              <label htmlFor="type" className="form-label">Contact Type</label>
              <select
                className="form-select"
                id="type"
                name="type"
                value={contact.type}
                onChange={handleInputChange}
              >
                <option value="phone">Phone Call</option>
                <option value="email">Email</option>
                <option value="in_person">In Person</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="mb-3">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                id="description"
                name="description"
                rows={4}
                value={contact.description}
                onChange={handleInputChange}
                placeholder="Enter details about the contact"
              ></textarea>
              {errors.description && <div className="invalid-feedback">{errors.description}</div>}
            </div>
            
            <div className="mb-3">
              <label htmlFor="duration_minutes" className="form-label">Duration (minutes)</label>
              <input
                type="number"
                className="form-control"
                id="duration_minutes"
                name="duration_minutes"
                value={contact.duration_minutes || ''}
                onChange={handleInputChange}
                min="1"
              />
            </div>
            
            <div className="mb-3 form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="followup_required"
                name="followup_required"
                checked={contact.followup_required}
                onChange={handleCheckboxChange}
              />
              <label className="form-check-label" htmlFor="followup_required">
                Follow-up Required
              </label>
            </div>
            
            {contact.followup_required && (
              <div className="mb-3">
                <label htmlFor="followup_date" className="form-label">Follow-up Date</label>
                <input
                  type="date"
                  className={`form-control ${errors.followup_date ? 'is-invalid' : ''}`}
                  id="followup_date"
                  name="followup_date"
                  value={contact.followup_date || ''}
                  onChange={handleInputChange}
                  min={currentDate}
                />
                {errors.followup_date && <div className="invalid-feedback">{errors.followup_date}</div>}
              </div>
            )}
            
            <div className="d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-outline-secondary me-2"
                onClick={onCancel}
              >
                <FaTimes className="me-1" /> Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <FaSave className="me-1" /> Save Contact
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactLogger;
