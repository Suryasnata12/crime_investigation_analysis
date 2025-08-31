import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Spinner from '../components/Spinner';

interface Report {
  id: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  analyst_name: string;
  analysis_type: string;
  is_final: boolean;
  case_id: number;
  case_title: string;
  findings: string[];
  recommendations: string[];
}

const AnalysisReport: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call to fetch report details
    setLoading(true);
    setTimeout(() => {
      try {
        // Mock data - in a real app, this would be an API call
        const mockReport: Report = {
          id: parseInt(reportId || '0'),
          title: "Forensic Analysis of Bank Robbery Evidence",
          description: "Detailed examination of physical evidence collected from the crime scene, including fingerprints, DNA samples, and tool marks.",
          created_at: "2025-03-20T10:30:00",
          updated_at: "2025-03-25T14:15:00",
          analyst_name: "Dr. Sarah Johnson",
          analysis_type: "forensic",
          is_final: true,
          case_id: 1,
          case_title: "Downtown Robbery Investigation",
          findings: [
            "Fingerprints found on the vault door match those of suspect John Doe",
            "DNA evidence from a hair sample matches a known criminal in the database",
            "Tool marks on the safe indicate the use of a specialized cutting tool",
            "Security footage timestamps have been altered, suggesting insider involvement"
          ],
          recommendations: [
            "Bring in John Doe for questioning regarding his presence at the crime scene",
            "Investigate the security system administrator for potential tampering",
            "Check hardware stores for recent purchases of specialized cutting tools",
            "Review bank employee schedules for the week prior to the robbery"
          ]
        };
        
        setReport(mockReport);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch report details. Please try again.');
        setLoading(false);
      }
    }, 800);
  }, [reportId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <Spinner message="Loading report details..." />;
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <p>{error}</p>
        <Link to="/analysis" className="btn btn-outline-primary mt-3">Return to Analysis List</Link>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="alert alert-warning">
        <p>Report not found. The requested report may have been deleted or you don't have permission to view it.</p>
        <Link to="/analysis" className="btn btn-outline-primary mt-3">Return to Analysis List</Link>
      </div>
    );
  }

  return (
    <div className="analysis-report-container">
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <h1>{report.title}</h1>
        <div>
          <Link to="/analysis" className="btn btn-outline me-2">Back to Analysis</Link>
          <Link to={`/cases/${report.case_id}`} className="btn btn-primary">View Related Case</Link>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header">
              <h3>Report Details</h3>
            </div>
            <div className="card-body">
              <div className="report-meta mb-4">
                <div className="badge-container mb-3">
                  <span className={`badge ${report.is_final ? 'bg-success' : 'bg-warning'}`} style={{ padding: '0.5em 0.8em', fontSize: '0.8em', textTransform: 'uppercase' }}>
                    {report.is_final ? 'Final Report' : 'Draft Report'}
                  </span>
                  <span className="badge bg-info ms-2" style={{ padding: '0.5em 0.8em', fontSize: '0.8em', textTransform: 'capitalize' }}>
                    {report.analysis_type} Analysis
                  </span>
                </div>
                <p className="mb-2">
                  <strong>Case:</strong> <Link to={`/cases/${report.case_id}`}>{report.case_title}</Link>
                </p>
                <p className="mb-2">
                  <strong>Analyst:</strong> {report.analyst_name}
                </p>
                <p className="mb-2">
                  <strong>Created:</strong> {formatDate(report.created_at)}
                </p>
                <p className="mb-0">
                  <strong>Last Updated:</strong> {formatDate(report.updated_at)}
                </p>
              </div>

              <h4>Description</h4>
              <p className="report-description mb-4">{report.description}</p>
              
              <h4>Key Findings</h4>
              <ul className="findings-list mb-4">
                {report.findings.map((finding, index) => (
                  <li key={index}>{finding}</li>
                ))}
              </ul>
              
              <h4>Recommendations</h4>
              <ul className="recommendations-list">
                {report.recommendations.map((recommendation, index) => (
                  <li key={index}>{recommendation}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-header">
              <h3>Actions</h3>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <Link to={`/cases/${report.case_id}`} className="btn btn-outline-primary">
                  View Related Case
                </Link>
                {!report.is_final && (
                  <button className="btn btn-outline-success">
                    Mark as Final
                  </button>
                )}
                <button className="btn btn-outline-secondary">
                  Export as PDF
                </button>
                <button className="btn btn-outline-info">
                  Share Report
                </button>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h3>Related Evidence</h3>
            </div>
            <div className="card-body">
              <p className="text-muted">
                Evidence items referenced in this report:
              </p>
              <ul className="list-group">
                <li className="list-group-item">
                  <Link to="/evidence/1">Fingerprint Sample #2459</Link>
                </li>
                <li className="list-group-item">
                  <Link to="/evidence/2">Security Camera Footage</Link>
                </li>
                <li className="list-group-item">
                  <Link to="/evidence/3">Tool Marks on Vault Door</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisReport;
