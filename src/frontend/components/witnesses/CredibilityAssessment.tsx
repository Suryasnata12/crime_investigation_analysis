import React, { useState } from 'react';
import { FaCheck, FaTimes, FaExclamationTriangle, FaShieldAlt, FaBalanceScale } from 'react-icons/fa';

interface CredibilityFactors {
  prior_criminal_history: boolean;
  known_associates: string[];
  previous_testimonies: number;
  inconsistencies_noted: boolean;
  relationship_to_case: string;
  bias_concerns: string[];
  reliability_score?: number;
}

interface CredibilityAssessmentProps {
  witnessId: string;
  initialFactors: CredibilityFactors;
  onSave: (factors: CredibilityFactors) => void;
}

const CredibilityAssessment: React.FC<CredibilityAssessmentProps> = ({ 
  witnessId, 
  initialFactors, 
  onSave 
}) => {
  const [factors, setFactors] = useState<CredibilityFactors>(initialFactors);
  const [newAssociate, setNewAssociate] = useState('');
  const [newBiasConcern, setNewBiasConcern] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const calculateReliabilityScore = (factors: CredibilityFactors): number => {
    let score = 75; // Base score
    
    // Deductions
    if (factors.prior_criminal_history) score -= 15;
    if (factors.inconsistencies_noted) score -= 20;
    if (factors.bias_concerns.length > 0) score -= (factors.bias_concerns.length * 5);
    
    // Additions
    if (factors.previous_testimonies > 0) score += Math.min(factors.previous_testimonies * 5, 15);
    
    // Ensure score is between 0-100
    return Math.max(0, Math.min(100, score));
  };
  
  const handleSave = () => {
    const updatedFactors = {
      ...factors,
      reliability_score: calculateReliabilityScore(factors)
    };
    onSave(updatedFactors);
    setIsEditing(false);
  };
  
  const addAssociate = () => {
    if (newAssociate.trim()) {
      setFactors({
        ...factors,
        known_associates: [...factors.known_associates, newAssociate.trim()]
      });
      setNewAssociate('');
    }
  };
  
  const removeAssociate = (index: number) => {
    const updatedAssociates = [...factors.known_associates];
    updatedAssociates.splice(index, 1);
    setFactors({
      ...factors,
      known_associates: updatedAssociates
    });
  };
  
  const addBiasConcern = () => {
    if (newBiasConcern.trim()) {
      setFactors({
        ...factors,
        bias_concerns: [...factors.bias_concerns, newBiasConcern.trim()]
      });
      setNewBiasConcern('');
    }
  };
  
  const removeBiasConcern = (index: number) => {
    const updatedConcerns = [...factors.bias_concerns];
    updatedConcerns.splice(index, 1);
    setFactors({
      ...factors,
      bias_concerns: updatedConcerns
    });
  };
  
  const reliabilityLevel = (score: number): { label: string; color: string; icon: JSX.Element } => {
    if (score >= 80) {
      return { 
        label: 'High Reliability', 
        color: 'success', 
        icon: <FaCheck className="me-2" /> 
      };
    } else if (score >= 60) {
      return { 
        label: 'Medium Reliability', 
        color: 'warning', 
        icon: <FaExclamationTriangle className="me-2" /> 
      };
    } else {
      return { 
        label: 'Low Reliability', 
        color: 'danger', 
        icon: <FaTimes className="me-2" /> 
      };
    }
  };

  const reliabilityScore = calculateReliabilityScore(factors);
  const reliability = reliabilityLevel(reliabilityScore);

  return (
    <div className="credibility-assessment card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h4 className="mb-0"><FaBalanceScale className="me-2" /> Witness Credibility Assessment</h4>
        {!isEditing ? (
          <button className="btn btn-sm btn-primary" onClick={() => setIsEditing(true)}>
            Edit Assessment
          </button>
        ) : (
          <div className="btn-group">
            <button className="btn btn-sm btn-success" onClick={handleSave}>
              Save Changes
            </button>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        )}
      </div>
      <div className="card-body">
        <div className="row mb-4">
          <div className="col-md-4">
            <div className={`alert alert-${reliability.color} d-flex align-items-center`}>
              {reliability.icon}
              <strong>{reliability.label}</strong>
            </div>
          </div>
          <div className="col-md-8">
            <div className="progress" style={{ height: '25px' }}>
              <div 
                className={`progress-bar bg-${reliability.color}`} 
                role="progressbar" 
                style={{ width: `${reliabilityScore}%` }}
                aria-valuenow={reliabilityScore} 
                aria-valuemin={0} 
                aria-valuemax={100}
              >
                {reliabilityScore}% Reliable
              </div>
            </div>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-md-6">
            <div className="form-check mb-3">
              <input 
                type="checkbox" 
                className="form-check-input" 
                id="prior_criminal_history"
                checked={factors.prior_criminal_history}
                disabled={!isEditing}
                onChange={e => setFactors({...factors, prior_criminal_history: e.target.checked})}
              />
              <label className="form-check-label" htmlFor="prior_criminal_history">
                Has Prior Criminal History
              </label>
            </div>
            
            <div className="mb-3">
              <label className="form-label">Previous Testimonies</label>
              <input 
                type="number" 
                className="form-control" 
                value={factors.previous_testimonies}
                disabled={!isEditing}
                onChange={e => setFactors({...factors, previous_testimonies: parseInt(e.target.value) || 0})}
                min="0"
              />
            </div>
            
            <div className="form-check mb-3">
              <input 
                type="checkbox" 
                className="form-check-input" 
                id="inconsistencies_noted"
                checked={factors.inconsistencies_noted}
                disabled={!isEditing}
                onChange={e => setFactors({...factors, inconsistencies_noted: e.target.checked})}
              />
              <label className="form-check-label" htmlFor="inconsistencies_noted">
                Inconsistencies Noted in Statements
              </label>
            </div>
            
            <div className="mb-3">
              <label className="form-label">Relationship to Case</label>
              <select 
                className="form-select"
                value={factors.relationship_to_case}
                disabled={!isEditing}
                onChange={e => setFactors({...factors, relationship_to_case: e.target.value})}
              >
                <option value="direct_witness">Direct Witness</option>
                <option value="related_to_victim">Related to Victim</option>
                <option value="related_to_suspect">Related to Suspect</option>
                <option value="bystander">Bystander</option>
                <option value="professional_capacity">Professional Capacity</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Known Associates</label>
              <ul className="list-group mb-2">
                {factors.known_associates.length === 0 ? (
                  <li className="list-group-item text-muted">No known associates</li>
                ) : (
                  factors.known_associates.map((associate, index) => (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                      {associate}
                      {isEditing && (
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-danger" 
                          onClick={() => removeAssociate(index)}
                        >
                          <FaTimes />
                        </button>
                      )}
                    </li>
                  ))
                )}
              </ul>
              {isEditing && (
                <div className="input-group">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Add associate" 
                    value={newAssociate}
                    onChange={e => setNewAssociate(e.target.value)}
                  />
                  <button 
                    className="btn btn-outline-secondary" 
                    type="button"
                    onClick={addAssociate}
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
            
            <div className="mb-3">
              <label className="form-label">Bias Concerns</label>
              <ul className="list-group mb-2">
                {factors.bias_concerns.length === 0 ? (
                  <li className="list-group-item text-muted">No bias concerns noted</li>
                ) : (
                  factors.bias_concerns.map((concern, index) => (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                      {concern}
                      {isEditing && (
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-danger" 
                          onClick={() => removeBiasConcern(index)}
                        >
                          <FaTimes />
                        </button>
                      )}
                    </li>
                  ))
                )}
              </ul>
              {isEditing && (
                <div className="input-group">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Add bias concern" 
                    value={newBiasConcern}
                    onChange={e => setNewBiasConcern(e.target.value)}
                  />
                  <button 
                    className="btn btn-outline-secondary" 
                    type="button"
                    onClick={addBiasConcern}
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CredibilityAssessment;
