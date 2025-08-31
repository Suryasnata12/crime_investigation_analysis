import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../components/Spinner.css';

interface SuspectDetailProps {
  isNewSuspect?: boolean;
}

interface CaseOption {
  id: number;
  title: string;
}

interface SuspectFormData {
  name: string;
  status: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  hair_color: string;
  eye_color: string;
  identifying_features: string;
  last_known_location: string;
  occupation: string;
  known_associates: string;
  criminal_history: string;
  notes: string;
  risk_level: string;
  case_id: number;
}

const SuspectDetail: React.FC<SuspectDetailProps> = ({ isNewSuspect = false }) => {
  const { suspectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cases, setCases] = useState<CaseOption[]>([]);
  
  // Form data
  const [formData, setFormData] = useState<SuspectFormData>({
    name: '',
    status: 'Person of Interest',
    age: '',
    gender: '',
    height: '',
    weight: '',
    hair_color: '',
    eye_color: '',
    identifying_features: '',
    last_known_location: '',
    occupation: '',
    known_associates: '',
    criminal_history: '',
    notes: '',
    risk_level: 'Medium',
    case_id: 0
  });
  
  // Form validation
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  // Suspect statuses and risk levels
  const suspectStatuses = [
    'Person of Interest', 'Witness', 'Suspect', 'Cleared', 'Arrested', 'Convicted', 'Unknown'
  ];
  
  const genderOptions = ['Male', 'Female', 'Other', 'Unknown'];
  
  const riskLevels = ['Low', 'Medium', 'High'];
  
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
        
        // If editing existing suspect, load the suspect data
        if (!isNewSuspect && suspectId) {
          // In a real app, this would fetch from the API
          // For demo, we'll use mock data
          if (suspectId === '1') {
            setFormData({
              name: 'Robert Anderson',
              status: 'Person of Interest',
              age: '34',
              gender: 'Male',
              height: '6\'1"',
              weight: '190 lbs',
              hair_color: 'Brown',
              eye_color: 'Blue',
              identifying_features: 'Scar on left cheek, tattoo on right forearm',
              last_known_location: '157 Oak Street, Apartment 3B',
              occupation: 'Construction Worker',
              known_associates: '',
              criminal_history: 'Prior arrests for burglary and assault',
              notes: 'Last person seen with victim before disappearance',
              risk_level: 'Medium',
              case_id: 1
            });
          } else if (suspectId === '3') {
            setFormData({
              name: 'James Miller',
              status: 'Suspect',
              age: '27',
              gender: 'Male',
              height: '5\'10"',
              weight: '170 lbs',
              hair_color: 'Black',
              eye_color: 'Brown',
              identifying_features: 'Neck tattoo, pierced left ear',
              last_known_location: '',
              occupation: '',
              known_associates: '',
              criminal_history: 'Multiple prior arrests for burglary and theft',
              notes: 'Known to operate in the area, matches description from security footage',
              risk_level: 'High',
              case_id: 2
            });
          } else {
            // Default for any other ID
            setFormData({
              ...formData,
              name: `Suspect #${suspectId}`,
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
  }, [isNewSuspect, suspectId]);
  
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
    
    if (!formData.name.trim()) errors.name = 'Name is required';
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
      
      if (isNewSuspect) {
        // In a real app, you would post to create a new suspect
        // For demo, just redirect back to the list
        navigate('/suspects');
      } else {
        // In a real app, you would put/patch to update an existing suspect
        // For demo, just redirect back to the list
        navigate('/suspects');
      }
    } catch (err) {
      console.error('Error saving suspect:', err);
      setError('Failed to save suspect. Please try again.');
      setSaving(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/suspects');
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
    <div className="suspect-detail-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
          {isNewSuspect ? 'Add New Suspect' : `Suspect: ${formData.name}`}
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
              <div className="col-md-6">
                <label htmlFor="name" className="form-label">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter suspect's full name"
                />
                {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
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
                  {suspectStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="row mb-3">
              <div className="col-md-3">
                <label htmlFor="age" className="form-label">Age</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  className="form-control"
                  value={formData.age}
                  onChange={handleChange}
                  min="0"
                  max="120"
                />
              </div>
              
              <div className="col-md-3">
                <label htmlFor="gender" className="form-label">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  className="form-control"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  {genderOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              <div className="col-md-3">
                <label htmlFor="height" className="form-label">Height</label>
                <input
                  type="text"
                  id="height"
                  name="height"
                  className="form-control"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="e.g. 5'10&quot;"
                />
              </div>
              
              <div className="col-md-3">
                <label htmlFor="weight" className="form-label">Weight</label>
                <input
                  type="text"
                  id="weight"
                  name="weight"
                  className="form-control"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="e.g. 170 lbs"
                />
              </div>
            </div>
            
            <div className="row mb-3">
              <div className="col-md-3">
                <label htmlFor="hair_color" className="form-label">Hair Color</label>
                <input
                  type="text"
                  id="hair_color"
                  name="hair_color"
                  className="form-control"
                  value={formData.hair_color}
                  onChange={handleChange}
                />
              </div>
              
              <div className="col-md-3">
                <label htmlFor="eye_color" className="form-label">Eye Color</label>
                <input
                  type="text"
                  id="eye_color"
                  name="eye_color"
                  className="form-control"
                  value={formData.eye_color}
                  onChange={handleChange}
                />
              </div>
              
              <div className="col-md-6">
                <label htmlFor="risk_level" className="form-label">Risk Level</label>
                <select
                  id="risk_level"
                  name="risk_level"
                  className="form-control"
                  value={formData.risk_level}
                  onChange={handleChange}
                >
                  {riskLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mb-3">
              <label htmlFor="identifying_features" className="form-label">Identifying Features</label>
              <textarea
                id="identifying_features"
                name="identifying_features"
                className="form-control"
                value={formData.identifying_features}
                onChange={handleChange}
                rows={2}
                placeholder="Tattoos, scars, birthmarks, etc."
              />
            </div>
            
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="occupation" className="form-label">Occupation</label>
                <input
                  type="text"
                  id="occupation"
                  name="occupation"
                  className="form-control"
                  value={formData.occupation}
                  onChange={handleChange}
                />
              </div>
              
              <div className="col-md-6">
                <label htmlFor="last_known_location" className="form-label">Last Known Location</label>
                <input
                  type="text"
                  id="last_known_location"
                  name="last_known_location"
                  className="form-control"
                  value={formData.last_known_location}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="mb-3">
              <label htmlFor="known_associates" className="form-label">Known Associates</label>
              <textarea
                id="known_associates"
                name="known_associates"
                className="form-control"
                value={formData.known_associates}
                onChange={handleChange}
                rows={2}
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="criminal_history" className="form-label">Criminal History</label>
              <textarea
                id="criminal_history"
                name="criminal_history"
                className="form-control"
                value={formData.criminal_history}
                onChange={handleChange}
                rows={2}
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="notes" className="form-label">Notes</label>
              <textarea
                id="notes"
                name="notes"
                className="form-control"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Additional information about this suspect"
              />
            </div>
            
            <div className="mb-3">
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
                    {isNewSuspect ? 'Adding Suspect...' : 'Updating Suspect...'}
                  </>
                ) : (
                  isNewSuspect ? 'Add Suspect' : 'Update Suspect'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SuspectDetail;
