import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';
import InterviewScheduler, { Interview } from '../components/witnesses/InterviewScheduler';

const WitnessInterviewSchedulerPage: React.FC = () => {
  const { witnessId, caseId } = useParams<{ witnessId: string; caseId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [witness, setWitness] = useState<{ id: number; name: string; case_id: number; case_name: string } | null>(null);

  useEffect(() => {
    // In a real app, this would be an API call to get witness data
    setLoading(true);
    setTimeout(() => {
      setWitness({
        id: parseInt(witnessId || '0'),
        name: 'Jane Smith',
        case_id: caseId ? parseInt(caseId) : 1,
        case_name: 'Downtown Robbery'
      });
      setLoading(false);
    }, 500);
  }, [witnessId, caseId]);

  const handleInterviewScheduled = (interview: Interview) => {
    // In a real app, this would be an API call to save the interview
    console.log('Interview scheduled:', interview);
    
    // Show success message
    alert('Interview has been successfully scheduled');
    
    // Navigate back to witness detail
    navigate(`/witnesses/${witnessId}`);
  };

  return (
    <div className="witness-interview-scheduler-page">
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center">
            <button 
              className="btn btn-link text-decoration-none p-0 me-3" 
              onClick={() => navigate(`/witnesses/${witnessId}`)}
            >
              <FaArrowLeft className="me-2" /> Back to Witness
            </button>
            <h2 className="mb-0">
              <FaCalendarAlt className="me-2" /> 
              Schedule Witness Interview
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading witness information...</p>
          </div>
        ) : witness ? (
          <div className="row">
            <div className="col-12">
              <div className="alert alert-info mb-4">
                <strong>Scheduling interview for:</strong> {witness.name} - Case: {witness.case_name}
              </div>
              
              <InterviewScheduler 
                witnessId={witnessId}
                caseId={witness.case_id.toString()}
                onInterviewScheduled={handleInterviewScheduled}
              />
            </div>
          </div>
        ) : (
          <div className="alert alert-danger">
            Witness not found. Please check the witness ID and try again.
          </div>
        )}
      </div>
    </div>
  );
};

export default WitnessInterviewSchedulerPage;
