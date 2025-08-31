import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaSearch, FaFilter, FaDownload, FaSave } from 'react-icons/fa';

type Witness = {
  id: number;
  name: string;
  contact: string;
  relationship: string;
  status: string;
  reliability: string;
  last_contact: string;
  case_id: number;
  case_name: string;
  statements_count: number;
  upcoming_interview: string | null;
};

const WitnessList: React.FC = () => {
  const [witnesses, setWitnesses] = useState<Witness[]>([]);
  const [filteredWitnesses, setFilteredWitnesses] = useState<Witness[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    reliability: '',
    caseId: '',
    hasUpcomingInterview: false,
  });
  const [savedSearches, setSavedSearches] = useState<{id: number, name: string, filters: any}[]>([]);
  const [showSaveSearch, setShowSaveSearch] = useState(false);
  const [newSearchName, setNewSearchName] = useState('');

  useEffect(() => {
    // In a real app, this would be an API call
    const mockWitnesses: Witness[] = [
      {
        id: 1,
        name: 'Jane Smith',
        contact: '555-123-4567',
        relationship: 'Bystander',
        status: 'Cooperative',
        reliability: 'High',
        last_contact: '2025-04-01',
        case_id: 1,
        case_name: 'Downtown Robbery',
        statements_count: 2,
        upcoming_interview: '2025-04-10 10:00 AM',
      },
      {
        id: 2,
        name: 'Michael Johnson',
        contact: '555-987-6543',
        relationship: 'Neighbor',
        status: 'Reluctant',
        reliability: 'Medium',
        last_contact: '2025-03-25',
        case_id: 1,
        case_name: 'Downtown Robbery',
        statements_count: 1,
        upcoming_interview: null,
      },
      {
        id: 3,
        name: 'Sarah Williams',
        contact: '555-345-6789',
        relationship: 'Store clerk',
        status: 'Cooperative',
        reliability: 'High',
        last_contact: '2025-04-03',
        case_id: 2,
        case_name: 'Warehouse Break-in',
        statements_count: 3,
        upcoming_interview: '2025-04-12 2:30 PM',
      },
      {
        id: 4,
        name: 'David Lee',
        contact: '555-789-0123',
        relationship: 'Security guard',
        status: 'Cooperative',
        reliability: 'High',
        last_contact: '2025-04-02',
        case_id: 2,
        case_name: 'Warehouse Break-in',
        statements_count: 2,
        upcoming_interview: null,
      },
      {
        id: 5,
        name: 'Emily Chen',
        contact: '555-234-5678',
        relationship: 'Driver',
        status: 'Uncooperative',
        reliability: 'Low',
        last_contact: '2025-03-20',
        case_id: 3,
        case_name: 'Vehicle Theft',
        statements_count: 1,
        upcoming_interview: '2025-04-15 9:00 AM',
      },
    ];

    setWitnesses(mockWitnesses);
    setFilteredWitnesses(mockWitnesses);

    // Simulated saved searches
    setSavedSearches([
      { id: 1, name: 'High Reliability Witnesses', filters: { reliability: 'High' } },
      { id: 2, name: 'Upcoming Interviews', filters: { hasUpcomingInterview: true } },
    ]);
  }, []);

  useEffect(() => {
    let results = witnesses;
    
    // Apply text search
    if (searchQuery) {
      results = results.filter(witness => 
        witness.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        witness.contact.includes(searchQuery) ||
        witness.case_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply filters
    if (filters.status) {
      results = results.filter(witness => witness.status === filters.status);
    }
    
    if (filters.reliability) {
      results = results.filter(witness => witness.reliability === filters.reliability);
    }
    
    if (filters.caseId) {
      results = results.filter(witness => witness.case_id.toString() === filters.caseId);
    }
    
    if (filters.hasUpcomingInterview) {
      results = results.filter(witness => witness.upcoming_interview !== null);
    }
    
    setFilteredWitnesses(results);
  }, [witnesses, searchQuery, filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFilters(prev => ({ ...prev, [name]: checked }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      reliability: '',
      caseId: '',
      hasUpcomingInterview: false,
    });
    setSearchQuery('');
  };

  const saveCurrentSearch = () => {
    if (newSearchName.trim()) {
      const newSavedSearch = {
        id: savedSearches.length + 1,
        name: newSearchName,
        filters: { ...filters, searchQuery }
      };
      
      setSavedSearches([...savedSearches, newSavedSearch]);
      setNewSearchName('');
      setShowSaveSearch(false);
    }
  };

  const loadSavedSearch = (savedSearch: {id: number, name: string, filters: any}) => {
    setFilters(savedSearch.filters);
    if (savedSearch.filters.searchQuery) {
      setSearchQuery(savedSearch.filters.searchQuery);
    }
  };

  const exportWitnesses = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredWitnesses));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "witnesses.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="container-fluid px-4">
      <div className="page-title-actions mb-4">
        <h1>Witnesses</h1>
        <div className="d-flex gap-2">
          <Link to="/witnesses/add" className="btn btn-primary">
            <FaPlus className="me-2" /> Add Witness
          </Link>
          <button className="btn btn-outline" onClick={exportWitnesses}>
            <FaDownload className="me-2" /> Export
          </button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div className="d-flex align-items-center gap-2 flex-grow-1">
              <div className="search-bar flex-grow-1">
                <div className="input-group">
                  <span className="input-group-text">
                    <FaSearch />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search witnesses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setSearchQuery('')}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <button 
                className="btn btn-outline" 
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter className="me-2" /> Filters
              </button>
              <div className="dropdown">
                <button 
                  className="btn btn-outline dropdown-toggle" 
                  type="button" 
                  id="savedSearchesDropdown" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  Saved Searches
                </button>
                <ul className="dropdown-menu" aria-labelledby="savedSearchesDropdown">
                  {savedSearches.map(search => (
                    <li key={search.id}>
                      <button 
                        className="dropdown-item" 
                        onClick={() => loadSavedSearch(search)}
                      >
                        {search.name}
                      </button>
                    </li>
                  ))}
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button 
                      className="dropdown-item" 
                      onClick={() => setShowSaveSearch(true)}
                    >
                      <FaSave className="me-2" /> Save current search
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="card-body border-top">
            <div className="row g-3">
              <div className="col-md-3">
                <label htmlFor="status" className="form-label">Status</label>
                <select
                  id="status"
                  name="status"
                  className="form-select"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">All Statuses</option>
                  <option value="Cooperative">Cooperative</option>
                  <option value="Reluctant">Reluctant</option>
                  <option value="Uncooperative">Uncooperative</option>
                </select>
              </div>
              <div className="col-md-3">
                <label htmlFor="reliability" className="form-label">Reliability</label>
                <select
                  id="reliability"
                  name="reliability"
                  className="form-select"
                  value={filters.reliability}
                  onChange={handleFilterChange}
                >
                  <option value="">All Reliability Levels</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className="col-md-3">
                <label htmlFor="caseId" className="form-label">Case</label>
                <select
                  id="caseId"
                  name="caseId"
                  className="form-select"
                  value={filters.caseId}
                  onChange={handleFilterChange}
                >
                  <option value="">All Cases</option>
                  <option value="1">Downtown Robbery</option>
                  <option value="2">Warehouse Break-in</option>
                  <option value="3">Vehicle Theft</option>
                </select>
              </div>
              <div className="col-md-3 d-flex align-items-end">
                <div className="form-check">
                  <input
                    id="hasUpcomingInterview"
                    name="hasUpcomingInterview"
                    type="checkbox"
                    className="form-check-input"
                    checked={filters.hasUpcomingInterview}
                    onChange={handleCheckboxChange}
                  />
                  <label className="form-check-label" htmlFor="hasUpcomingInterview">
                    Has Upcoming Interview
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <button className="btn btn-outline-secondary" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {showSaveSearch && (
          <div className="card-body border-top">
            <div className="d-flex gap-2 align-items-center">
              <div className="flex-grow-1">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter search name"
                  value={newSearchName}
                  onChange={(e) => setNewSearchName(e.target.value)}
                />
              </div>
              <button className="btn btn-primary" onClick={saveCurrentSearch}>
                Save
              </button>
              <button className="btn btn-outline" onClick={() => setShowSaveSearch(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Witness</th>
                  <th>Case</th>
                  <th>Status</th>
                  <th>Reliability</th>
                  <th>Statements</th>
                  <th>Last Contact</th>
                  <th>Upcoming Interview</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWitnesses.map((witness) => (
                  <tr key={witness.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar avatar-sm me-3">
                          <div className="avatar-initial bg-primary">
                            {witness.name.charAt(0)}
                          </div>
                        </div>
                        <div>
                          <div className="fw-semibold">{witness.name}</div>
                          <div className="small text-muted">{witness.contact}</div>
                        </div>
                      </div>
                    </td>
                    <td>{witness.case_name}</td>
                    <td>
                      <span className={`badge ${
                        witness.status === 'Cooperative' ? 'badge-success' :
                        witness.status === 'Reluctant' ? 'badge-warning' :
                        'badge-danger'
                      }`}>
                        {witness.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        witness.reliability === 'High' ? 'badge-success' :
                        witness.reliability === 'Medium' ? 'badge-warning' :
                        'badge-danger'
                      }`}>
                        {witness.reliability}
                      </span>
                    </td>
                    <td>{witness.statements_count}</td>
                    <td>{witness.last_contact}</td>
                    <td>
                      {witness.upcoming_interview ? (
                        <span className="text-primary">{witness.upcoming_interview}</span>
                      ) : (
                        <span className="text-muted">None scheduled</span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Link to={`/witnesses/${witness.id}`} className="btn btn-sm btn-primary">
                          View
                        </Link>
                        <Link to={`/witnesses/${witness.id}/schedule`} className="btn btn-sm btn-outline">
                          Schedule
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredWitnesses.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      No witnesses found matching the criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer d-flex justify-content-between align-items-center">
          <div>
            <span className="me-2">Showing {filteredWitnesses.length} of {witnesses.length} witnesses</span>
          </div>
          <div>
            <button className="btn btn-sm btn-outline me-2" disabled>
              Previous
            </button>
            <button className="btn btn-sm btn-outline" disabled>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WitnessList;
