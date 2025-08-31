import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface Case {
  id: number;
  case_number: string;
  title: string;
  status: string;
  priority: string;
  crime_type: string;
  opened_date: string;
  investigator_name: string;
  evidence_count: number;
  suspect_count: number;
}

const CaseList: React.FC = () => {
  const { hasPermission, user } = useAuth();
  const location = useLocation();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showNewCaseModal, setShowNewCaseModal] = useState<boolean>(false);
  
  // New state for form fields
  const [newCase, setNewCase] = useState({
    title: '',
    crimeType: '',
    priority: 'medium',
    status: 'active',
    description: '',
    location: '',
    crimeDate: new Date().toISOString().split('T')[0]
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract search term from URL query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchParam = queryParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
      
      // Also check localStorage for any additional search context
      const lastSearch = localStorage.getItem('lastSearch');
      if (lastSearch && lastSearch === searchParam) {
        // Additional search context could be used here if needed
        console.log('Search initiated from header:', lastSearch);
      }
    }
  }, [location.search]);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        
        // In a real app, this would be an API call
        // For demo purposes, we'll simulate it
        setTimeout(() => {
          // Sample data
          const sampleCases: Case[] = [
            { 
              id: 1, 
              case_number: "CR-2025-0421", 
              title: "Downtown Robbery Investigation", 
              status: "active", 
              priority: "high",
              crime_type: "Robbery",
              opened_date: "2025-03-15T10:30:00",
              investigator_name: "Det. Sarah Johnson",
              evidence_count: 5,
              suspect_count: 2
            },
            { 
              id: 2, 
              case_number: "CR-2025-0422", 
              title: "Residential Burglary", 
              status: "active", 
              priority: "medium",
              crime_type: "Burglary",
              opened_date: "2025-03-20T08:15:00",
              investigator_name: "Det. Michael Rodriguez",
              evidence_count: 3,
              suspect_count: 1
            },
            { 
              id: 3, 
              case_number: "CR-2025-0419", 
              title: "Vehicle Theft Investigation", 
              status: "pending_analysis", 
              priority: "medium",
              crime_type: "Theft",
              opened_date: "2025-03-10T14:45:00",
              investigator_name: "Det. Sarah Johnson",
              evidence_count: 4,
              suspect_count: 2
            },
            { 
              id: 4, 
              case_number: "CR-2025-0418", 
              title: "Commercial Vandalism", 
              status: "closed", 
              priority: "low",
              crime_type: "Vandalism",
              opened_date: "2025-03-05T09:30:00",
              investigator_name: "Det. Robert Wilson",
              evidence_count: 2,
              suspect_count: 1
            },
            { 
              id: 5, 
              case_number: "CR-2025-0417", 
              title: "Assault Investigation", 
              status: "active", 
              priority: "high",
              crime_type: "Assault",
              opened_date: "2025-03-01T18:45:00",
              investigator_name: "Det. Sarah Johnson",
              evidence_count: 6,
              suspect_count: 3
            }
          ];
          
          setCases(sampleCases);
          setLoading(false);
        }, 1000);
        
        // When connected to real API:
        // const response = await axios.get('/api/case');
        // setCases(response.data);
        // setLoading(false);
      } catch (error) {
        console.error('Error fetching cases:', error);
        setLoading(false);
      }
    };
    
    fetchCases();
  }, []);

  // Filter cases based on search term and filters
  const filteredCases = cases.filter((case_item) => {
    // Search term filter
    const matchesSearch = searchTerm === '' || 
      case_item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_item.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_item.crime_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_item.investigator_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || case_item.status === statusFilter;
    
    // Priority filter
    const matchesPriority = priorityFilter === 'all' || case_item.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-success';
      case 'medium':
        return 'bg-info';
      case 'high':
        return 'bg-warning';
      case 'critical':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-primary';
      case 'pending_analysis':
        return 'bg-info';
      case 'under_review':
        return 'bg-warning';
      case 'closed':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleCreateCase = () => {
    // Validate the form
    const errors: {[key: string]: string} = {};
    if (!newCase.title) errors.title = 'Case title is required';
    if (!newCase.crimeType) errors.crimeType = 'Crime type is required';
    if (!newCase.location) errors.location = 'Crime location is required';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    // Create a new case entry with a unique ID and generated case number
    const timestamp = new Date().getTime();
    const newCaseId = cases.length > 0 ? Math.max(...cases.map(c => c.id)) + 1 : 1;
    const randomId = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const caseNumber = `CR-2025-${randomId}`;
    
    const today = new Date().toISOString();
    const caseDate = newCase.crimeDate ? new Date(newCase.crimeDate).toISOString() : today;
    
    const createdCase: Case = {
      id: newCaseId,
      case_number: caseNumber,
      title: newCase.title,
      status: newCase.status,
      priority: newCase.priority,
      crime_type: newCase.crimeType,
      opened_date: today,
      investigator_name: user?.full_name || 'System User',
      evidence_count: 0,
      suspect_count: 0
    };
    
    // In a real app, we would make an API call here
    // For demo, we'll just add it to our local state after a delay
    setTimeout(() => {
      setCases(prevCases => [createdCase, ...prevCases]);
      setIsSubmitting(false);
      setShowNewCaseModal(false);
      
      // Reset the form
      setNewCase({
        title: '',
        crimeType: '',
        priority: 'medium',
        status: 'active',
        description: '',
        location: '',
        crimeDate: new Date().toISOString().split('T')[0]
      });
      setFormErrors({});
      
      // Show success message
      alert('Case created successfully!');
    }, 800);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    const fieldName = id.replace('case-', '');
    
    setNewCase(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear error when field is updated
    if (formErrors[fieldName]) {
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  return (
    <div className="case-list-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
          Cases
        </h1>
        
        {hasPermission('case:create') && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowNewCaseModal(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Case
          </button>
        )}
      </div>
      
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="search" className="form-label">Search</label>
                <input
                  id="search"
                  type="text"
                  className="form-control"
                  placeholder="Search by case number, title, etc."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div style={{ width: '150px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="status-filter" className="form-label">Status</label>
                <select
                  id="status-filter"
                  className="form-control"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="pending_analysis">Pending Analysis</option>
                  <option value="under_review">Under Review</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
            
            <div style={{ width: '150px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="priority-filter" className="form-label">Priority</label>
                <select
                  id="priority-filter"
                  className="form-control"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner"></div>
          <p className="mt-3">Loading cases...</p>
        </div>
      ) : (
        <>
          {searchTerm && (
            <div className="search-results-info mb-3 p-2" style={{ backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <div className="d-flex justify-content-between align-items-center">
                <span>
                  Found <strong>{filteredCases.length}</strong> results for: <strong>"{searchTerm}"</strong>
                </span>
                {searchTerm && (
                  <button 
                    className="btn btn-sm btn-outline-secondary" 
                    onClick={() => setSearchTerm('')}
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          )}
          
          {filteredCases.length === 0 ? (
            <div className="text-center py-5">
              <div style={{ color: 'var(--text-secondary)' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <h3 className="mt-3">No cases found</h3>
                <p>Try adjusting your search or filters.</p>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Case #</th>
                      <th>Title</th>
                      <th>Crime Type</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Opened</th>
                      <th>Investigator</th>
                      <th style={{ textAlign: 'center' }}>Evidence</th>
                      <th style={{ textAlign: 'center' }}>Suspects</th>
                      <th style={{ width: '120px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCases.map(caseItem => (
                      <tr key={caseItem.id}>
                        <td>{caseItem.case_number}</td>
                        <td>
                          <Link to={`/cases/${caseItem.id}`} className="case-title-link" style={{ color: 'var(--primary-color)', fontWeight: 500, textDecoration: 'none' }}>
                            {caseItem.title}
                          </Link>
                        </td>
                        <td>{caseItem.crime_type}</td>
                        <td>
                          <span className={`badge ${getStatusClass(caseItem.status)}`} style={{ padding: '0.35em 0.65em', fontSize: '0.75em', textTransform: 'capitalize' }}>
                            {caseItem.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getPriorityClass(caseItem.priority)}`} style={{ padding: '0.35em 0.65em', fontSize: '0.75em', textTransform: 'capitalize' }}>
                            {caseItem.priority}
                          </span>
                        </td>
                        <td>{formatDate(caseItem.opened_date)}</td>
                        <td>{caseItem.investigator_name}</td>
                        <td className="text-center">{caseItem.evidence_count}</td>
                        <td className="text-center">{caseItem.suspect_count}</td>
                        <td>
                          <div className="action-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                            <Link to={`/cases/${caseItem.id}`} className="btn btn-sm btn-outline-primary">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                            </Link>
                            
                            {hasPermission('edit_case') && (
                              <Link to={`/cases/${caseItem.id}?edit=true`} className="btn btn-sm btn-outline-secondary">
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
        </>
      )}
      
      {/* New Case Modal */}
      {showNewCaseModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Create New Case</h3>
              <button className="modal-close" onClick={() => setShowNewCaseModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="case-title" className="form-label">Case Title</label>
                <input 
                  id="case-title" 
                  type="text" 
                  className={`form-control ${formErrors.title ? 'is-invalid' : ''}`} 
                  value={newCase.title}
                  onChange={handleInputChange}
                />
                {formErrors.title && <div className="invalid-feedback">{formErrors.title}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="case-crimeType" className="form-label">Crime Type</label>
                <select 
                  id="case-crimeType" 
                  className={`form-control ${formErrors.crimeType ? 'is-invalid' : ''}`}
                  value={newCase.crimeType}
                  onChange={handleInputChange}
                >
                  <option value="">Select crime type</option>
                  <option value="Assault">Assault</option>
                  <option value="Burglary">Burglary</option>
                  <option value="Fraud">Fraud</option>
                  <option value="Homicide">Homicide</option>
                  <option value="Robbery">Robbery</option>
                  <option value="Theft">Theft</option>
                  <option value="Vandalism">Vandalism</option>
                </select>
                {formErrors.crimeType && <div className="invalid-feedback">{formErrors.crimeType}</div>}
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="case-priority" className="form-label">Priority</label>
                  <select 
                    id="case-priority" 
                    className="form-control"
                    value={newCase.priority}
                    onChange={handleInputChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="case-status" className="form-label">Status</label>
                  <select 
                    id="case-status" 
                    className="form-control"
                    value={newCase.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">Active</option>
                    <option value="pending_analysis">Pending Analysis</option>
                    <option value="under_review">Under Review</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="case-description" className="form-label">Description</label>
                <textarea 
                  id="case-description" 
                  className="form-control" 
                  rows={4}
                  value={newCase.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="case-location" className="form-label">Crime Location</label>
                <input 
                  id="case-location" 
                  type="text" 
                  className={`form-control ${formErrors.location ? 'is-invalid' : ''}`}
                  value={newCase.location}
                  onChange={handleInputChange}
                />
                {formErrors.location && <div className="invalid-feedback">{formErrors.location}</div>}
              </div>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="case-crimeDate" className="form-label">Crime Date</label>
                <input 
                  id="case-crimeDate" 
                  type="date" 
                  className="form-control"
                  value={newCase.crimeDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-outline" 
                onClick={() => setShowNewCaseModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleCreateCase}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner" style={{ width: '20px', height: '20px', display: 'inline-block', marginRight: '8px' }}></div>
                    Creating...
                  </>
                ) : 'Create Case'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseList;
