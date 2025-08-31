import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../components/Spinner.css';

interface EvidenceDetailProps {
  isNewEvidence?: boolean;
}

interface CaseOption {
  id: number;
  title: string;
}

interface EvidenceFormData {
  name: string;
  type: string;
  description: string;
  location_found: string;
  date_collected: string;
  collected_by: string;
  status: string;
  case_id: number;
  tags: string;
}

const EvidenceDetail: React.FC<EvidenceDetailProps> = ({ isNewEvidence = false }) => {
  const { evidenceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cases, setCases] = useState<CaseOption[]>([]);
  
  // Form data
  const [formData, setFormData] = useState<EvidenceFormData>({
    name: '',
    type: 'Physical',
    description: '',
    location_found: '',
    date_collected: new Date().toISOString().slice(0, 16),
    collected_by: user?.full_name || '',
    status: 'New',
    case_id: 0,
    tags: ''
  });
  
  // Form validation
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  // Evidence types and statuses
  const evidenceTypes = [
    'Physical', 'Digital', 'Biological', 'Documentary', 'Testimonial', 'Other'
  ];
  
  const evidenceStatuses = [
    'New', 'In Analysis', 'Analyzed', 'Documented', 'Sent to Lab', 'Archived'
  ];
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load case data for dropdown
        // In a real app, this would be a real API call
        const demoCaseData: CaseOption[] = [
          { id: 1, title: 'Missing Person - John Doe' },
          { id: 2, title: 'Burglary at 123 Main St' },
          { id: 3, title: 'Pharmacy Robbery' },
        ];
        
        setCases(demoCaseData);
        
        // If editing existing evidence, load the evidence data
        if (!isNewEvidence && evidenceId) {
          // In a real app, this would fetch from the API
          // For demo, we'll use mock data
          if (evidenceId === '1') {
            setFormData({
              name: 'Fingerprints on Doorknob',
              type: 'Physical',
              description: 'Partial fingerprints found on victim\'s front door',
              location_found: 'Front entrance',
              date_collected: '2025-03-15T10:30',
              collected_by: 'Det. Sarah Johnson',
              status: 'In Analysis',
              case_id: 1,
              tags: 'Fingerprints, Front Door'
            });
          } else if (evidenceId === '2') {
            setFormData({
              name: 'Security Camera Footage',
              type: 'Digital',
              description: 'Footage from street camera showing suspect',
              location_found: 'Municipal Camera #342',
              date_collected: '2025-03-15T14:45',
              collected_by: 'Tech Analyst Mike Chen',
              status: 'Analyzed',
              case_id: 1,
              tags: 'Key Evidence, Time Sensitive'
            });
          } else {
            // Default for any other ID - could also show an error
            setFormData({
              ...formData,
              name: `Evidence Item #${evidenceId}`,
              case_id: 1
            });
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };
    
    loadData();
  }, [isNewEvidence, evidenceId, user?.full_name]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is updated
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) errors.name = 'Evidence name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.location_found.trim()) errors.location_found = 'Location found is required';
    if (!formData.date_collected) errors.date_collected = 'Collection date is required';
    if (!formData.collected_by.trim()) errors.collected_by = 'Collector name is required';
    if (!formData.case_id) errors.case_id = 'Case is required';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      window.scrollTo(0, 0);
      return;
    }
    
    try {
      setSaving(true);
      
      // In a real app, this would be a call to an API
      // For demo, simulate an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (isNewEvidence) {
        // In a real app, you would post to create a new evidence item
        // For demo, just redirect back to the list
        navigate('/evidence');
      } else {
        // In a real app, you would put/patch to update an existing evidence item
        // For demo, just redirect back to the list
        navigate('/evidence');
      }
    } catch (err) {
      console.error('Error saving evidence:', err);
      setError('Failed to save evidence. Please try again.');
      setSaving(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/evidence');
  };
  
  if (loading) {
    return (
      <div className="spinner-container" style={{ height: '50vh' }}>
        <div className="spinner"></div>
        <p className="spinner-text">Loading...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4>Error</h4>
        <p>{error}</p>
        <button 
          className="btn btn-danger" 
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="evidence-detail-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
          {isNewEvidence ? 'Add New Evidence' : `Evidence: ${formData.name}`}
        </h1>
      </div>
      
      <div className="card">
        <div className="card-body">
          {Object.keys(formErrors).length > 0 && (
            <div className="alert alert-danger mb-4">
              <h4>Please fix the following errors:</h4>
              <ul style={{ marginBottom: 0, paddingLeft: '1.25rem' }}>
                {Object.values(formErrors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-8">
                <label htmlFor="name" className="form-label">Evidence Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter a descriptive name for this evidence"
                />
                {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
              </div>
              
              <div className="col-md-4">
                <label htmlFor="type" className="form-label">Evidence Type *</label>
                <select
                  id="type"
                  name="type"
                  className="form-control"
                  value={formData.type}
                  onChange={handleChange}
                >
                  {evidenceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mb-3">
              <label htmlFor="description" className="form-label">Description *</label>
              <textarea
                id="description"
                name="description"
                className={`form-control ${formErrors.description ? 'is-invalid' : ''}`}
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Detailed description of the evidence"
              />
              {formErrors.description && <div className="invalid-feedback">{formErrors.description}</div>}
            </div>
            
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="location_found" className="form-label">Location Found *</label>
                <input
                  type="text"
                  id="location_found"
                  name="location_found"
                  className={`form-control ${formErrors.location_found ? 'is-invalid' : ''}`}
                  value={formData.location_found}
                  onChange={handleChange}
                  placeholder="Where the evidence was discovered"
                />
                {formErrors.location_found && <div className="invalid-feedback">{formErrors.location_found}</div>}
              </div>
              
              <div className="col-md-6">
                <label htmlFor="date_collected" className="form-label">Date & Time Collected *</label>
                <input
                  type="datetime-local"
                  id="date_collected"
                  name="date_collected"
                  className={`form-control ${formErrors.date_collected ? 'is-invalid' : ''}`}
                  value={formData.date_collected}
                  onChange={handleChange}
                />
                {formErrors.date_collected && <div className="invalid-feedback">{formErrors.date_collected}</div>}
              </div>
            </div>
            
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="collected_by" className="form-label">Collected By *</label>
                <input
                  type="text"
                  id="collected_by"
                  name="collected_by"
                  className={`form-control ${formErrors.collected_by ? 'is-invalid' : ''}`}
                  value={formData.collected_by}
                  onChange={handleChange}
                  placeholder="Name of person who collected the evidence"
                />
                {formErrors.collected_by && <div className="invalid-feedback">{formErrors.collected_by}</div>}
              </div>
              
              <div className="col-md-6">
                <label htmlFor="status" className="form-label">Status *</label>
                <select
                  id="status"
                  name="status"
                  className="form-control"
                  value={formData.status}
                  onChange={handleChange}
                >
                  {evidenceStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="case_id" className="form-label">Related Case *</label>
                <select
                  id="case_id"
                  name="case_id"
                  className={`form-control ${formErrors.case_id ? 'is-invalid' : ''}`}
                  value={formData.case_id}
                  onChange={handleChange}
                >
                  <option value="">Select a case</option>
                  {cases.map(caseOption => (
                    <option key={caseOption.id} value={caseOption.id}>
                      {caseOption.title}
                    </option>
                  ))}
                </select>
                {formErrors.case_id && <div className="invalid-feedback">{formErrors.case_id}</div>}
              </div>
              
              <div className="col-md-6">
                <label htmlFor="tags" className="form-label">Tags (comma separated)</label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  className="form-control"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="e.g. Fingerprint, Blood Sample, Priority"
                />
              </div>
            </div>
            
            <div className="d-flex justify-content-end mt-4">
              <button
                type="button"
                className="btn btn-outline me-2"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="spinner" style={{ width: '20px', height: '20px', display: 'inline-block', marginRight: '8px' }}></div>
                    {isNewEvidence ? 'Adding Evidence...' : 'Updating Evidence...'}
                  </>
                ) : (
                  isNewEvidence ? 'Add Evidence' : 'Update Evidence'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EvidenceDetail;
