import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface Case {
  id: number;
  case_number: string;
  title: string;
  status: string;
  priority: string;
  opened_date: string;
  evidence_count: number;
  suspect_count: number;
}

interface EvidenceItem {
  id: number;
  evidence_number: string;
  type: string;
  status: string;
  reliability: string;
  description: string;
}

interface Suspect {
  id: number;
  name: string;
  status: string;
  match_score: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [recentCases, setRecentCases] = useState<Case[]>([]);
  const [keyEvidence, setKeyEvidence] = useState<EvidenceItem[]>([]);
  const [topSuspects, setTopSuspects] = useState<Suspect[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState({
    activeCases: 0,
    totalEvidence: 0,
    pendingAnalysis: 0,
    suspectCount: 0
  });
  const [casesByType, setCasesByType] = useState<any>({});
  const [performanceMetrics, setPerformanceMetrics] = useState<any>({});
  const [caseTimelineData, setCaseTimelineData] = useState<any>({});
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('month');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // In a real application, these would be actual API calls
        // For demonstration purposes, we're using the sample data
        
        // Simulate API calls with setTimeout
        setTimeout(() => {
          // Sample data (would come from API)
          const sampleCases: Case[] = [
            { 
              id: 1, 
              case_number: "CR-2025-0421", 
              title: "Downtown Robbery Investigation", 
              status: "active", 
              priority: "high",
              opened_date: "2025-03-15T10:30:00",
              evidence_count: 5,
              suspect_count: 2
            },
            { 
              id: 2, 
              case_number: "CR-2025-0422", 
              title: "Residential Burglary", 
              status: "active", 
              priority: "medium",
              opened_date: "2025-03-20T08:15:00",
              evidence_count: 3,
              suspect_count: 1
            },
            { 
              id: 3, 
              case_number: "CR-2025-0419", 
              title: "Vehicle Theft Investigation", 
              status: "pending_analysis", 
              priority: "medium",
              opened_date: "2025-03-10T14:45:00",
              evidence_count: 4,
              suspect_count: 2
            }
          ];
          
          const sampleEvidence: EvidenceItem[] = [
            {
              id: 1,
              evidence_number: "E001",
              type: "Fingerprint",
              status: "analyzed",
              reliability: "high",
              description: "Fingerprint found on door handle"
            },
            {
              id: 2,
              evidence_number: "E002",
              type: "DNA Sample",
              status: "processing",
              reliability: "unknown",
              description: "DNA sample collected from counter surface"
            },
            {
              id: 3,
              evidence_number: "E003",
              type: "Surveillance Video",
              status: "analyzed",
              reliability: "medium",
              description: "Video footage from street camera"
            }
          ];
          
          const sampleSuspects: Suspect[] = [
            {
              id: 1,
              name: "John Doe",
              status: "Primary Suspect",
              match_score: 76
            },
            {
              id: 2,
              name: "Michael Smith",
              status: "Person of Interest",
              match_score: 42
            }
          ];
          
          const sampleStats = {
            activeCases: 5,
            totalEvidence: 18,
            pendingAnalysis: 7,
            suspectCount: 4
          };
          
          // Sample cases by type data for charts
          const sampleCasesByType = {
            labels: ['Theft', 'Assault', 'Fraud', 'Homicide', 'Burglary', 'Other'],
            datasets: [
              {
                label: 'Cases by Type',
                data: [12, 8, 15, 3, 10, 7],
                backgroundColor: [
                  'rgba(54, 162, 235, 0.7)',
                  'rgba(255, 99, 132, 0.7)',
                  'rgba(255, 206, 86, 0.7)',
                  'rgba(75, 192, 192, 0.7)',
                  'rgba(153, 102, 255, 0.7)',
                  'rgba(255, 159, 64, 0.7)',
                ],
                borderWidth: 1,
              },
            ],
          };
          
          // Sample performance metrics
          const samplePerformanceMetrics = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
              {
                label: 'Cases Closed',
                data: [5, 8, 6, 9, 7, 11],
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
              },
              {
                label: 'New Cases',
                data: [8, 10, 7, 12, 9, 14],
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
              },
            ],
          };
          
          // Sample case timeline data
          const sampleCaseTimelineData = {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [
              {
                label: 'Active Cases',
                data: [18, 20, 23, 25],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.1,
              },
              {
                label: 'Closed Cases',
                data: [3, 5, 8, 10],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                tension: 0.1,
              },
            ],
          };
          
          setRecentCases(sampleCases);
          setKeyEvidence(sampleEvidence);
          setTopSuspects(sampleSuspects);
          setStats(sampleStats);
          setCasesByType(sampleCasesByType);
          setPerformanceMetrics(samplePerformanceMetrics);
          setCaseTimelineData(sampleCaseTimelineData);
          setLoading(false);
        }, 1000);
        
        // When connected to real API:
        // const casesResponse = await axios.get('/api/case?sort_by=opened_date&sort_dir=desc&limit=3');
        // setRecentCases(casesResponse.data);
        
        // const evidenceResponse = await axios.get('/api/evidence?is_key_only=true&limit=3');
        // setKeyEvidence(evidenceResponse.data);
        
        // const suspectsResponse = await axios.get('/api/suspect?sort_by=match_score&sort_dir=desc&limit=3');
        // setTopSuspects(suspectsResponse.data);
        
        // const statsResponse = await axios.get('/api/stats/dashboard');
        // setStats(statsResponse.data);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const updateTimelineData = (range: string) => {
    setSelectedTimeRange(range);
    // In a real application, we would fetch new data based on range
    // For this demo, we'll just simulate different data
    
    let labels = [];
    let activeData = [];
    let closedData = [];
    
    if (range === 'week') {
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      activeData = [15, 16, 18, 17, 19, 20, 21];
      closedData = [1, 2, 1, 3, 2, 0, 1];
    } else if (range === 'month') {
      labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      activeData = [18, 20, 23, 25];
      closedData = [3, 5, 8, 10];
    } else if (range === 'quarter') {
      labels = ['Jan', 'Feb', 'Mar'];
      activeData = [15, 22, 28];
      closedData = [5, 12, 18];
    } else {
      labels = ['Q1', 'Q2', 'Q3', 'Q4'];
      activeData = [24, 35, 42, 51];
      closedData = [18, 24, 32, 40];
    }
    
    setCaseTimelineData({
      labels,
      datasets: [
        {
          label: 'Active Cases',
          data: activeData,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.1,
        },
        {
          label: 'Closed Cases',
          data: closedData,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.1,
        },
      ],
    });
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
      case 'critical':
        return 'badge-danger';
      case 'medium':
        return 'badge-warning';
      default:
        return 'badge-info';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'badge-primary';
      case 'closed':
        return 'badge-success';
      case 'pending_analysis':
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  };

  if (loading) {
    return (
      <div className="loading-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 'calc(100vh - 60px)' 
      }}>
        <div>
          <div style={{ 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '1rem' }}>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard container-fluid py-4">
      <h1 className="mb-4">Investigation Dashboard</h1>
      
      {/* Welcome Banner */}
      <div className="card mb-4">
        <div className="card-body bg-primary text-white">
          <div className="d-flex align-items-center">
            <div>
              <h3 className="mb-1">Welcome back, {user?.full_name || 'Investigator'}</h3>
              <p className="mb-0">Here's an overview of your cases and recent activity</p>
            </div>
            <div className="ms-auto">
              <Link to="/cases/new" className="btn btn-light">
                <i className="bi bi-plus"></i> New Case
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Key Stats Row */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <h5 className="card-title text-secondary">Active Cases</h5>
              <h2 className="card-text text-primary">{stats.activeCases}</h2>
              <p className="text-muted small">Ongoing investigations</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <h5 className="card-title text-secondary">Evidence Items</h5>
              <h2 className="card-text text-primary">{stats.totalEvidence}</h2>
              <p className="text-muted small">Collected evidence</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <h5 className="card-title text-secondary">Pending Analysis</h5>
              <h2 className="card-text text-warning">{stats.pendingAnalysis}</h2>
              <p className="text-muted small">Items awaiting processing</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <h5 className="card-title text-secondary">Suspects</h5>
              <h2 className="card-text text-primary">{stats.suspectCount}</h2>
              <p className="text-muted small">Identified persons of interest</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Analytics Row */}
      <div className="row mb-4">
        {/* Cases by Type Chart */}
        <div className="col-lg-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">Cases by Type</h5>
            </div>
            <div className="card-body">
              <div style={{ height: '300px', position: 'relative' }}>
                <Pie data={casesByType} options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                    },
                  }
                }} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Performance Metrics */}
        <div className="col-lg-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">Investigation Performance</h5>
            </div>
            <div className="card-body">
              <div style={{ height: '300px', position: 'relative' }}>
                <Bar data={performanceMetrics} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Case Timeline */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Case Timeline</h5>
              <div className="btn-group" role="group">
                <button 
                  type="button" 
                  className={`btn btn-sm ${selectedTimeRange === 'week' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => updateTimelineData('week')}
                >
                  Week
                </button>
                <button 
                  type="button" 
                  className={`btn btn-sm ${selectedTimeRange === 'month' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => updateTimelineData('month')}
                >
                  Month
                </button>
                <button 
                  type="button" 
                  className={`btn btn-sm ${selectedTimeRange === 'quarter' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => updateTimelineData('quarter')}
                >
                  Quarter
                </button>
                <button 
                  type="button" 
                  className={`btn btn-sm ${selectedTimeRange === 'year' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => updateTimelineData('year')}
                >
                  Year
                </button>
              </div>
            </div>
            <div className="card-body">
              <div style={{ height: '300px', position: 'relative' }}>
                <Line data={caseTimelineData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Cases Row */}
      <div className="row mb-4">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Cases</h5>
              <Link to="/cases" className="btn btn-sm btn-outline-primary">View All Cases</Link>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Case Number</th>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Opened</th>
                      <th>Evidence</th>
                      <th>Suspects</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCases.map(caseItem => (
                      <tr key={caseItem.id}>
                        <td><Link to={`/cases/${caseItem.id}`}>{caseItem.case_number}</Link></td>
                        <td>{caseItem.title}</td>
                        <td><span className={`badge ${getStatusClass(caseItem.status)}`}>{caseItem.status.replace('_', ' ')}</span></td>
                        <td><span className={`badge ${getPriorityClass(caseItem.priority)}`}>{caseItem.priority}</span></td>
                        <td>{new Date(caseItem.opened_date).toLocaleDateString()}</td>
                        <td>{caseItem.evidence_count}</td>
                        <td>{caseItem.suspect_count}</td>
                        <td>
                          <Link to={`/cases/${caseItem.id}`} className="btn btn-sm btn-primary">
                            <i className="bi bi-eye"></i>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Key Evidence and Top Suspects Row */}
      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Key Evidence</h5>
              <Link to="/evidence" className="btn btn-sm btn-outline-primary">View All Evidence</Link>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {keyEvidence.map(item => (
                  <div key={item.id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">{item.evidence_number} - {item.type}</h6>
                        <p className="mb-1 text-muted small">{item.description}</p>
                      </div>
                      <div>
                        <span className={`badge ${item.status === 'analyzed' ? 'badge-success' : 'badge-warning'}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Top Suspects</h5>
              <Link to="/suspects" className="btn btn-sm btn-outline-primary">View All Suspects</Link>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {topSuspects.map(suspect => (
                  <div key={suspect.id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">{suspect.name}</h6>
                        <p className="mb-1 text-muted small">{suspect.status}</p>
                      </div>
                      <div>
                        <div className="d-flex align-items-center">
                          <div className="me-2">
                            <div className="progress" style={{ width: '100px', height: '8px' }}>
                              <div 
                                className={`progress-bar ${suspect.match_score > 70 ? 'bg-danger' : 'bg-warning'}`} 
                                role="progressbar" 
                                style={{ width: `${suspect.match_score}%` }} 
                                aria-valuenow={suspect.match_score} 
                                aria-valuemin={0} 
                                aria-valuemax={100}
                              ></div>
                            </div>
                            <span className="small text-muted">{suspect.match_score}% match</span>
                          </div>
                          <Link to={`/suspects/${suspect.id}`} className="btn btn-sm btn-primary">
                            <i className="bi bi-eye"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
