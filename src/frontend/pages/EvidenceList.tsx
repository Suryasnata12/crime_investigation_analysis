import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../components/Spinner.css';

interface Evidence {
  id: number;
  case_id: number;
  case_name?: string;
  name: string;
  type: string;
  description: string;
  location_found: string;
  date_collected: string;
  collected_by: string;
  status: string;
  tags?: string[];
}

const EvidenceList: React.FC = () => {
  const { user } = useAuth();
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [filteredEvidenceList, setFilteredEvidenceList] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const [cases, setCases] = useState<{ id: number; title: string }[]>([]);
  const [filterType, setFilterType] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('date_desc');
  
  // Evidence types for filtering
  const evidenceTypes = [
    'Physical', 'Digital', 'Biological', 'Documentary', 'Testimonial', 'Other'
  ];

  useEffect(() => {
    // Function to load evidence data
    const loadEvidenceData = async () => {
      try {
        setLoading(true);
        
        // In a production environment, this would be a real API call
        // For demo purposes, we create mock data
        const demoEvidenceData: Evidence[] = [
          {
            id: 1,
            case_id: 1,
            case_name: 'Missing Person - John Doe',
            name: 'Fingerprints on Doorknob',
            type: 'Physical',
            description: 'Partial fingerprints found on victim\'s front door',
            location_found: 'Front entrance',
            date_collected: '2025-03-15T10:30:00',
            collected_by: 'Det. Sarah Johnson',
            status: 'In Analysis',
          },
          {
            id: 2,
            case_id: 1,
            case_name: 'Missing Person - John Doe',
            name: 'Security Camera Footage',
            type: 'Digital',
            description: 'Footage from street camera showing suspect',
            location_found: 'Municipal Camera #342',
            date_collected: '2025-03-15T14:45:00',
            collected_by: 'Tech Analyst Mike Chen',
            status: 'Analyzed',
            tags: ['Key Evidence', 'Time Sensitive'],
          },
          {
            id: 3,
            case_id: 2,
            case_name: 'Burglary at 123 Main St',
            name: 'Tool Marks on Window',
            type: 'Physical',
            description: 'Marks consistent with a flathead screwdriver',
            location_found: 'Rear window',
            date_collected: '2025-03-28T09:15:00',
            collected_by: 'Officer Rodriguez',
            status: 'Documented',
          },
          {
            id: 4,
            case_id: 2,
            case_name: 'Burglary at 123 Main St',
            name: 'Shoe Print Cast',
            type: 'Physical',
            description: 'Size 11 athletic shoe print found in soil',
            location_found: 'Garden beneath window',
            date_collected: '2025-03-28T10:20:00',
            collected_by: 'Forensic Tech Lisa Wang',
            status: 'In Analysis',
          },
          {
            id: 5,
            case_id: 3,
            case_name: 'Pharmacy Robbery',
            name: 'Note to Pharmacist',
            type: 'Documentary',
            description: 'Handwritten demand note',
            location_found: 'Pharmacy counter',
            date_collected: '2025-04-01T16:10:00',
            collected_by: 'Det. Marcus Brown',
            status: 'In Analysis',
            tags: ['Priority', 'Fingerprints Found'],
          },
          {
            id: 6,
            case_id: 3,
            case_name: 'Pharmacy Robbery',
            name: 'Blood Sample',
            type: 'Biological',
            description: 'Blood droplets found near exit',
            location_found: 'Back door',
            date_collected: '2025-04-01T16:45:00',
            collected_by: 'Forensic Tech Lisa Wang',
            status: 'Sent to Lab',
            tags: ['DNA Testing', 'Priority'],
          },
        ];
        
        // Load case data
        const demoCaseData = [
          { id: 1, title: 'Missing Person - John Doe' },
          { id: 2, title: 'Burglary at 123 Main St' },
          { id: 3, title: 'Pharmacy Robbery' },
        ];
        
        setCases(demoCaseData);
        setEvidenceList(demoEvidenceData);
        setFilteredEvidenceList(demoEvidenceData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading evidence data:', err);
        setError('Failed to load evidence data. Please try again later.');
        setLoading(false);
      }
    };
    
    loadEvidenceData();
  }, []);
  
  // Apply filters whenever filter criteria change
  useEffect(() => {
    filterEvidence();
  }, [searchTerm, selectedCaseId, filterType, sortOption, evidenceList]);
  
  const filterEvidence = () => {
    let filtered = [...evidenceList];
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(evidence => 
        evidence.name.toLowerCase().includes(term) || 
        evidence.description.toLowerCase().includes(term) ||
        evidence.location_found.toLowerCase().includes(term) ||
        evidence.collected_by.toLowerCase().includes(term)
      );
    }
    
    // Apply case filter
    if (selectedCaseId) {
      filtered = filtered.filter(evidence => evidence.case_id === selectedCaseId);
    }
    
    // Apply type filter
    if (filterType) {
      filtered = filtered.filter(evidence => evidence.type === filterType);
    }
    
    // Apply sorting
    if (sortOption === 'date_desc') {
      filtered.sort((a, b) => new Date(b.date_collected).getTime() - new Date(a.date_collected).getTime());
    } else if (sortOption === 'date_asc') {
      filtered.sort((a, b) => new Date(a.date_collected).getTime() - new Date(b.date_collected).getTime());
    } else if (sortOption === 'name_asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === 'name_desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    }
    
    setFilteredEvidenceList(filtered);
  };
  
  // Reset all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCaseId(null);
    setFilterType('');
    setSortOption('date_desc');
  };
  
  // Format date for display
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
  
  if (loading) {
    return (
      <div className="spinner-container" style={{ height: '50vh' }}>
        <div className="spinner"></div>
        <p className="spinner-text">Loading evidence data...</p>
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
    <div className="evidence-list-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Evidence List</h1>
        
        <Link to="/evidence/add" className="btn btn-primary">
          Add New Evidence
        </Link>
      </div>
      
      {/* Filters section */}
      <div className="card mb-4">
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h5 className="card-title mb-0">Filters</h5>
            <button
              className="btn btn-sm btn-outline"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
          
          <div className="row">
            <div className="col-md-4 mb-3">
              <label htmlFor="searchTerm" className="form-label">Search</label>
              <input
                type="text"
                id="searchTerm"
                className="form-control"
                placeholder="Search by name, description, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="col-md-3 mb-3">
              <label htmlFor="caseFilter" className="form-label">Case</label>
              <select
                id="caseFilter"
                className="form-control"
                value={selectedCaseId || ''}
                onChange={(e) => setSelectedCaseId(e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">All Cases</option>
                {cases.map(caseItem => (
                  <option key={caseItem.id} value={caseItem.id}>
                    {caseItem.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-2 mb-3">
              <label htmlFor="typeFilter" className="form-label">Evidence Type</label>
              <select
                id="typeFilter"
                className="form-control"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">All Types</option>
                {evidenceTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-3 mb-3">
              <label htmlFor="sortOption" className="form-label">Sort By</label>
              <select
                id="sortOption"
                className="form-control"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="date_desc">Date (Newest First)</option>
                <option value="date_asc">Date (Oldest First)</option>
                <option value="name_asc">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Results count */}
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ color: '#6b7280' }}>
          Showing {filteredEvidenceList.length} of {evidenceList.length} evidence items
        </p>
      </div>
      
      {/* Evidence list */}
      {filteredEvidenceList.length === 0 ? (
        <div className="alert alert-info">
          No evidence matching your filters. Try adjusting your search criteria.
        </div>
      ) : (
        <div className="row">
          {filteredEvidenceList.map(evidence => (
            <div key={evidence.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-header" style={{ backgroundColor: '#f3f4f6', padding: '0.75rem 1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={`badge ${evidence.type === 'Physical' ? 'badge-blue' : 
                      evidence.type === 'Digital' ? 'badge-green' : 
                      evidence.type === 'Biological' ? 'badge-red' : 
                      evidence.type === 'Documentary' ? 'badge-purple' : 'badge-gray'}`}>
                      {evidence.type}
                    </span>
                    <span className={`badge ${evidence.status === 'In Analysis' ? 'badge-yellow' : 
                      evidence.status === 'Analyzed' ? 'badge-green' : 
                      evidence.status === 'Documented' ? 'badge-blue' : 
                      evidence.status === 'Sent to Lab' ? 'badge-purple' : 'badge-gray'}`}>
                      {evidence.status}
                    </span>
                  </div>
                </div>
                
                <div className="card-body">
                  <h5 className="card-title" style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                    {evidence.name}
                  </h5>
                  
                  <p className="card-subtitle mb-2" style={{ color: '#4b5563', fontSize: '0.875rem' }}>
                    Case: {evidence.case_name}
                  </p>
                  
                  <p className="card-text" style={{ marginTop: '0.75rem', marginBottom: '0.5rem' }}>
                    {evidence.description}
                  </p>
                  
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    <strong>Location:</strong> {evidence.location_found}
                  </div>
                  
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    <strong>Collected:</strong> {formatDate(evidence.date_collected)}
                  </div>
                  
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                    <strong>Collected by:</strong> {evidence.collected_by}
                  </div>
                  
                  {evidence.tags && evidence.tags.length > 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                      {evidence.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="badge badge-gray"
                          style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="card-footer" style={{ backgroundColor: 'white', borderTop: '1px solid #e5e7eb', padding: '0.75rem 1rem' }}>
                  <Link 
                    to={`/evidence/${evidence.id}`} 
                    className="btn btn-sm btn-outline"
                    style={{ width: '100%' }}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EvidenceList;
