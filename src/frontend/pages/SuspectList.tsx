import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../components/Spinner.css';

interface Suspect {
  id: number;
  case_id: number;
  case_name?: string;
  name: string;
  status: string;
  age?: number;
  gender?: string;
  height?: string;
  weight?: string;
  hair_color?: string;
  eye_color?: string;
  identifying_features?: string;
  last_known_location?: string;
  occupation?: string;
  known_associates?: string;
  criminal_history?: string;
  notes?: string;
  risk_level?: 'Low' | 'Medium' | 'High';
  created_at: string;
  updated_at: string;
}

const SuspectList: React.FC = () => {
  const { user } = useAuth();
  const [suspectList, setSuspectList] = useState<Suspect[]>([]);
  const [filteredSuspectList, setFilteredSuspectList] = useState<Suspect[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const [cases, setCases] = useState<{ id: number; title: string }[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('name_asc');

  // Suspect statuses for filtering
  const suspectStatuses = [
    'Person of Interest', 'Witness', 'Suspect', 'Cleared', 'Arrested', 'Convicted', 'Unknown'
  ];
  
  // Risk levels for filtering
  const riskLevels = ['Low', 'Medium', 'High'];

  useEffect(() => {
    // Function to load suspect data
    const loadSuspectData = async () => {
      try {
        setLoading(true);
        
        // In a production environment, this would be a real API call
        // For demo purposes, we create mock data
        const demoSuspectData: Suspect[] = [
          {
            id: 1,
            case_id: 1,
            case_name: 'Missing Person - John Doe',
            name: 'Robert Anderson',
            status: 'Person of Interest',
            age: 34,
            gender: 'Male',
            height: '6\'1"',
            weight: '190 lbs',
            hair_color: 'Brown',
            eye_color: 'Blue',
            identifying_features: 'Scar on left cheek, tattoo on right forearm',
            last_known_location: '157 Oak Street, Apartment 3B',
            occupation: 'Construction Worker',
            criminal_history: 'Prior arrests for burglary and assault',
            notes: 'Last person seen with victim before disappearance',
            risk_level: 'Medium',
            created_at: '2025-03-16T10:15:00',
            updated_at: '2025-03-18T14:30:00'
          },
          {
            id: 2,
            case_id: 1,
            case_name: 'Missing Person - John Doe',
            name: 'Sarah Williams',
            status: 'Witness',
            age: 29,
            gender: 'Female',
            height: '5\'6"',
            weight: '135 lbs',
            hair_color: 'Blonde',
            eye_color: 'Green',
            last_known_location: '234 Maple Avenue',
            occupation: 'Bartender at The Lucky Clover',
            notes: 'Reported seeing victim with an unknown man on the night of disappearance',
            risk_level: 'Low',
            created_at: '2025-03-16T12:45:00',
            updated_at: '2025-03-16T18:20:00'
          },
          {
            id: 3,
            case_id: 2,
            case_name: 'Burglary at 123 Main St',
            name: 'James Miller',
            status: 'Suspect',
            age: 27,
            gender: 'Male',
            height: '5\'10"',
            weight: '170 lbs',
            hair_color: 'Black',
            eye_color: 'Brown',
            identifying_features: 'Neck tattoo, pierced left ear',
            criminal_history: 'Multiple prior arrests for burglary and theft',
            notes: 'Known to operate in the area, matches description from security footage',
            risk_level: 'High',
            created_at: '2025-03-29T08:30:00',
            updated_at: '2025-03-30T11:15:00'
          },
          {
            id: 4,
            case_id: 2,
            case_name: 'Burglary at 123 Main St',
            name: 'Daniel Johnson',
            status: 'Person of Interest',
            age: 31,
            gender: 'Male',
            height: '6\'0"',
            weight: '185 lbs',
            hair_color: 'Brown',
            eye_color: 'Hazel',
            occupation: 'Unemployed',
            known_associates: 'Known associate of James Miller',
            criminal_history: 'Prior arrests for possession of stolen property',
            risk_level: 'Medium',
            created_at: '2025-03-29T09:45:00',
            updated_at: '2025-03-30T14:20:00'
          },
          {
            id: 5,
            case_id: 3,
            case_name: 'Pharmacy Robbery',
            name: 'Michael Thompson',
            status: 'Arrested',
            age: 25,
            gender: 'Male',
            height: '5\'9"',
            weight: '160 lbs',
            hair_color: 'Red',
            eye_color: 'Blue',
            identifying_features: 'Scar above right eyebrow',
            last_known_location: '789 Pine Street, Basement Apartment',
            criminal_history: 'Prior arrests for drug possession and robbery',
            notes: 'Arrested with evidence linking to the crime scene',
            risk_level: 'High',
            created_at: '2025-04-02T09:30:00',
            updated_at: '2025-04-02T16:45:00'
          },
          {
            id: 6,
            case_id: 3,
            case_name: 'Pharmacy Robbery',
            name: 'Jennifer Davis',
            status: 'Witness',
            age: 42,
            gender: 'Female',
            height: '5\'4"',
            weight: '130 lbs',
            hair_color: 'Brown',
            eye_color: 'Brown',
            occupation: 'Pharmacy Technician',
            notes: 'Present during robbery, provided detailed description of the perpetrator',
            risk_level: 'Low',
            created_at: '2025-04-01T17:20:00',
            updated_at: '2025-04-02T10:15:00'
          },
        ];
        
        // Load case data
        const demoCaseData = [
          { id: 1, title: 'Missing Person - John Doe' },
          { id: 2, title: 'Burglary at 123 Main St' },
          { id: 3, title: 'Pharmacy Robbery' },
        ];
        
        setCases(demoCaseData);
        setSuspectList(demoSuspectData);
        setFilteredSuspectList(demoSuspectData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading suspect data:', err);
        setError('Failed to load suspect data. Please try again later.');
        setLoading(false);
      }
    };
    
    loadSuspectData();
  }, []);
  
  // Apply filters whenever filter criteria change
  useEffect(() => {
    filterSuspects();
  }, [searchTerm, selectedCaseId, statusFilter, riskLevelFilter, sortOption, suspectList]);
  
  const filterSuspects = () => {
    let filtered = [...suspectList];
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(suspect => 
        suspect.name.toLowerCase().includes(term) || 
        (suspect.notes && suspect.notes.toLowerCase().includes(term)) ||
        (suspect.last_known_location && suspect.last_known_location.toLowerCase().includes(term)) ||
        (suspect.occupation && suspect.occupation.toLowerCase().includes(term))
      );
    }
    
    // Apply case filter
    if (selectedCaseId) {
      filtered = filtered.filter(suspect => suspect.case_id === selectedCaseId);
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(suspect => suspect.status === statusFilter);
    }
    
    // Apply risk level filter
    if (riskLevelFilter) {
      filtered = filtered.filter(suspect => suspect.risk_level === riskLevelFilter);
    }
    
    // Apply sorting
    if (sortOption === 'name_asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === 'name_desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortOption === 'status') {
      filtered.sort((a, b) => a.status.localeCompare(b.status));
    } else if (sortOption === 'risk_high_to_low') {
      const riskOrder: { [key: string]: number } = { 'High': 1, 'Medium': 2, 'Low': 3 };
      filtered.sort((a, b) => {
        const aRisk = a.risk_level || 'Low';
        const bRisk = b.risk_level || 'Low';
        return riskOrder[aRisk] - riskOrder[bRisk];
      });
    } else if (sortOption === 'created_desc') {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    
    setFilteredSuspectList(filtered);
  };
  
  // Reset all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCaseId(null);
    setStatusFilter('');
    setRiskLevelFilter('');
    setSortOption('name_asc');
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <div className="spinner-container" style={{ height: '50vh' }}>
        <div className="spinner"></div>
        <p className="spinner-text">Loading suspect data...</p>
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
    <div className="suspect-list-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Suspect List</h1>
        
        <Link to="/suspects/add" className="btn btn-primary">
          Add New Suspect
        </Link>
      </div>
      
      {/* Filters section */}
      <div className="card mb-4">
        <div className="card-body pb-2">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h5 className="card-title mb-0">Filters</h5>
            <button
              className="btn btn-sm btn-outline"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
          
          <div className="row g-2">
            <div className="col">
              <label htmlFor="searchTerm" className="form-label small mb-1">Search</label>
              <input
                type="text"
                id="searchTerm"
                className="form-control form-control-sm"
                placeholder="Search by name, notes, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="col">
              <label htmlFor="caseFilter" className="form-label small mb-1">Case</label>
              <select
                id="caseFilter"
                className="form-control form-control-sm"
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
            
            <div className="col">
              <label htmlFor="statusFilter" className="form-label small mb-1">Status</label>
              <select
                id="statusFilter"
                className="form-control form-control-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                {suspectStatuses.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col">
              <label htmlFor="riskLevelFilter" className="form-label small mb-1">Risk Level</label>
              <select
                id="riskLevelFilter"
                className="form-control form-control-sm"
                value={riskLevelFilter}
                onChange={(e) => setRiskLevelFilter(e.target.value)}
              >
                <option value="">All Levels</option>
                {riskLevels.map(level => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col">
              <label htmlFor="sortOption" className="form-label small mb-1">Sort By</label>
              <select
                id="sortOption"
                className="form-control form-control-sm"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="name_asc">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
                <option value="status">Status</option>
                <option value="risk_high_to_low">Risk (High to Low)</option>
                <option value="created_desc">Recently Added</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Results count */}
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ color: '#6b7280' }}>
          Showing {filteredSuspectList.length} of {suspectList.length} suspects
        </p>
      </div>
      
      {/* Suspect list */}
      {filteredSuspectList.length === 0 ? (
        <div className="alert alert-info">
          No suspects matching your filters. Try adjusting your search criteria.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Case</th>
                <th>Risk Level</th>
                <th>Demographics</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuspectList.map(suspect => (
                <tr key={suspect.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{suspect.name}</div>
                    {suspect.occupation && (
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {suspect.occupation}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${
                      suspect.status === 'Suspect' ? 'badge-red' :
                      suspect.status === 'Person of Interest' ? 'badge-yellow' :
                      suspect.status === 'Witness' ? 'badge-blue' :
                      suspect.status === 'Arrested' ? 'badge-purple' :
                      suspect.status === 'Convicted' ? 'badge-purple' :
                      suspect.status === 'Cleared' ? 'badge-green' : 'badge-gray'
                    }`}>
                      {suspect.status}
                    </span>
                  </td>
                  <td>
                    <Link to={`/cases/${suspect.case_id}`}>
                      {suspect.case_name}
                    </Link>
                  </td>
                  <td>
                    <span className={`badge ${
                      suspect.risk_level === 'High' ? 'badge-red' :
                      suspect.risk_level === 'Medium' ? 'badge-yellow' :
                      'badge-green'
                    }`}>
                      {suspect.risk_level || 'Unknown'}
                    </span>
                  </td>
                  <td>
                    {suspect.age && suspect.gender && (
                      <div>{suspect.age} yo {suspect.gender}</div>
                    )}
                    {(suspect.height || suspect.weight) && (
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {suspect.height}{suspect.height && suspect.weight && ', '}{suspect.weight}
                      </div>
                    )}
                  </td>
                  <td>
                    {formatDate(suspect.updated_at)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link to={`/suspects/${suspect.id}`} className="btn btn-sm btn-outline">
                        Details
                      </Link>
                      <Link to={`/suspects/${suspect.id}/edit`} className="btn btn-sm btn-outline">
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SuspectList;
