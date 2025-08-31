// src/frontend/pages/AnalysisList.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

interface Report {
  id: number;
  title: string;
  created_at: string;
  analyst_name: string;
  analysis_type: string;
  is_final: boolean;
  case_id: number;
  case_title: string;
}

const AnalysisList: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const { hasPermission } = useAuth();

  useEffect(() => {
    // Simulate API call to fetch reports
    setTimeout(() => {
      const sampleReports: Report[] = [
        {
          id: 1,
          title: "Forensic Analysis of Bank Robbery Evidence",
          created_at: "2025-03-20T10:30:00",
          analyst_name: "Dr. Sarah Johnson",
          analysis_type: "forensic",
          is_final: true,
          case_id: 1,
          case_title: "Downtown Robbery Investigation"
        },
        {
          id: 2,
          title: "Financial Transaction Analysis",
          created_at: "2025-03-22T14:15:00",
          analyst_name: "Michael Chen",
          analysis_type: "financial",
          is_final: false,
          case_id: 1,
          case_title: "Downtown Robbery Investigation"
        },
        {
          id: 3,
          title: "Digital Forensics Report on Security Footage",
          created_at: "2025-03-25T09:45:00",
          analyst_name: "Alex Rivera",
          analysis_type: "digital",
          is_final: true,
          case_id: 2,
          case_title: "Midtown Burglary Series"
        }
      ];
      
      setReports(sampleReports);
      setLoading(false);
    }, 800);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="analysis-list-container">
      <div className="page-header">
        <h1>Analysis Reports</h1>
        {hasPermission('analysis:create') && (
          <Link to="/cases" className="btn btn-primary">
            Create New Report
          </Link>
        )}
      </div>

      {loading ? (
        <Spinner message="Loading analysis reports..." />
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Case</th>
                  <th>Analysis Type</th>
                  <th>Analyst</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th style={{ width: '120px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report.id}>
                    <td>
                      <Link to={`/analysis/${report.id}`} style={{ color: 'var(--primary-color)', fontWeight: 500, textDecoration: 'none' }}>
                        {report.title}
                      </Link>
                    </td>
                    <td>
                      <Link to={`/cases/${report.case_id}`}>
                        {report.case_title}
                      </Link>
                    </td>
                    <td>{report.analysis_type}</td>
                    <td>{report.analyst_name}</td>
                    <td>{formatDate(report.created_at)}</td>
                    <td>
                      <span className={`badge ${report.is_final ? 'bg-success' : 'bg-warning'}`} style={{ padding: '0.35em 0.65em', fontSize: '0.75em', textTransform: 'capitalize' }}>
                        {report.is_final ? 'Final' : 'Draft'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                        <Link to={`/analysis/${report.id}`} className="btn btn-sm btn-outline-primary">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </Link>
                        
                        {hasPermission('analysis:update') && !report.is_final && (
                          <Link to={`/analysis/${report.id}/edit`} className="btn btn-sm btn-outline-secondary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisList;
