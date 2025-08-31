import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaDatabase, FaSearch, FaSyncAlt, FaLink, FaUnlink, FaCog, FaLock, FaUserSecret, FaFingerprint, FaExclamationTriangle } from 'react-icons/fa';

type DatabaseConnection = {
  id: string;
  name: string;
  type: 'criminal_records' | 'forensics' | 'vehicle_registry' | 'property_records' | 'national_database';
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  recordCount: number;
  apiKey: string;
  endpoint: string;
  requiresAuth: boolean;
};

type SearchResult = {
  id: string;
  database: string;
  recordType: string;
  name: string;
  dateOfBirth?: string;
  identifiers: {
    key: string;
    value: string;
  }[];
  matchScore: number;
  data: Record<string, any>;
  timestamp: string;
};

const ExternalDatabases: React.FC = () => {
  const [databases, setDatabases] = useState<DatabaseConnection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'identifier'>('name');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedDatabases, setSelectedDatabases] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeDatabase, setActiveDatabase] = useState<DatabaseConnection | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  useEffect(() => {
    // Simulate fetching database connections
    const mockDatabases: DatabaseConnection[] = [
      {
        id: 'ncic',
        name: 'National Crime Information Center',
        type: 'criminal_records',
        status: 'connected',
        lastSync: '2025-04-05 08:30:22',
        recordCount: 32450982,
        apiKey: '********',
        endpoint: 'https://api.ncic.example.gov/v2',
        requiresAuth: true
      },
      {
        id: 'forensics_lab',
        name: 'Central Forensics Laboratory',
        type: 'forensics',
        status: 'connected',
        lastSync: '2025-04-04 16:45:33',
        recordCount: 573892,
        apiKey: '********',
        endpoint: 'https://forensics-lab.example.gov/api',
        requiresAuth: true
      },
      {
        id: 'vehicle_db',
        name: 'Vehicle Registry Database',
        type: 'vehicle_registry',
        status: 'connected',
        lastSync: '2025-04-05 09:15:45',
        recordCount: 8976543,
        apiKey: '********',
        endpoint: 'https://dmv.example.gov/registry/api',
        requiresAuth: true
      },
      {
        id: 'property',
        name: 'Property Records Database',
        type: 'property_records',
        status: 'disconnected',
        lastSync: '2025-04-01 11:20:18',
        recordCount: 4532198,
        apiKey: '********',
        endpoint: 'https://property-records.example.gov/api',
        requiresAuth: true
      },
      {
        id: 'national_db',
        name: 'National Investigative Database',
        type: 'national_database',
        status: 'error',
        lastSync: '2025-04-03 14:10:05',
        recordCount: 85642139,
        apiKey: '********',
        endpoint: 'https://nid.example.gov/api/v3',
        requiresAuth: true
      }
    ];
    
    setDatabases(mockDatabases);
    // Set all databases as selected by default
    setSelectedDatabases(mockDatabases.filter(db => db.status === 'connected').map(db => db.id));
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    
    // Simulate API call to search external databases
    setTimeout(() => {
      // Mock search results
      const mockResults: SearchResult[] = [
        {
          id: 'cr-123456',
          database: 'National Crime Information Center',
          recordType: 'criminal_record',
          name: 'John Doe',
          dateOfBirth: '1985-06-12',
          identifiers: [
            { key: 'SSN', value: '***-**-4567' },
            { key: 'FBI', value: 'FB7891011' }
          ],
          matchScore: 95,
          data: {
            priorOffenses: [
              { date: '2020-03-15', offense: 'Theft', disposition: 'Convicted' },
              { date: '2018-08-22', offense: 'Breaking and Entering', disposition: 'Convicted' }
            ],
            warrants: [],
            lastKnownAddress: '123 Main St, Anytown, USA'
          },
          timestamp: '2025-04-05 14:12:33'
        },
        {
          id: 'fr-789012',
          database: 'Central Forensics Laboratory',
          recordType: 'fingerprint_match',
          name: 'John A. Doe',
          dateOfBirth: '1985-06-12',
          identifiers: [
            { key: 'Print ID', value: 'FP12345' },
            { key: 'Case Ref', value: 'C20230089' }
          ],
          matchScore: 82,
          data: {
            matchType: 'Ten-point fingerprint',
            matchDate: '2023-05-18',
            relatedCases: ['Convenience Store Robbery (2023)']
          },
          timestamp: '2025-04-05 14:12:34'
        },
        {
          id: 'vr-456789',
          database: 'Vehicle Registry Database',
          recordType: 'vehicle_record',
          name: 'John Doe',
          identifiers: [
            { key: 'License', value: 'DL123456789' },
            { key: 'Vehicle', value: '2018 Honda Civic' }
          ],
          matchScore: 90,
          data: {
            vehicleHistory: [
              { make: 'Honda', model: 'Civic', year: 2018, plate: 'ABC-1234', color: 'Blue' },
              { make: 'Toyota', model: 'Corolla', year: 2015, plate: 'XYZ-9876', color: 'Silver', sold: '2018-01-10' }
            ]
          },
          timestamp: '2025-04-05 14:12:35'
        }
      ];
      
      setSearchResults(mockResults);
      setLoading(false);
    }, 1500);
  };

  const handleDatabaseConnection = (database: DatabaseConnection) => {
    setActiveDatabase(database);
    setShowConfigModal(true);
  };

  const syncDatabase = (databaseId: string) => {
    // Find the database to update
    const updatedDatabases = databases.map(db => {
      if (db.id === databaseId) {
        return {
          ...db,
          lastSync: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };
      }
      return db;
    });
    
    setDatabases(updatedDatabases);
  };

  const handleDatabaseSelect = (databaseId: string) => {
    setSelectedDatabases(prev => {
      if (prev.includes(databaseId)) {
        return prev.filter(id => id !== databaseId);
      } else {
        return [...prev, databaseId];
      }
    });
  };

  const exportResult = (result: SearchResult) => {
    // In a real app, this would create a proper report or export
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${result.database}_${result.id}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const linkResultToCase = (result: SearchResult) => {
    // Mock function - in a real app would open a dialog to select a case
    alert('In a real app, this would open a dialog to link this record to a specific case.');
  };

  return (
    <div className="container-fluid px-4">
      <div className="page-title-actions mb-4">
        <h1>External Databases</h1>
        <button className="btn btn-primary" onClick={() => alert('In a real app, this would open a dialog to configure a new database connection.')}>
          <FaDatabase className="me-2" /> Add Database Connection
        </button>
      </div>

      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Search External Databases</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-8">
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaSearch />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={searchType === 'name' ? "Enter name to search..." : "Enter ID (SSN, License, FBI Number, etc.)"}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={handleSearch}
                      disabled={loading}
                    >
                      {loading ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                </div>
                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value as 'name' | 'identifier')}
                  >
                    <option value="name">Search by Name</option>
                    <option value="identifier">Search by Identifier</option>
                  </select>
                </div>
              </div>

              <div className="database-selection mt-4">
                <label className="form-label">Select Databases to Search:</label>
                <div className="d-flex flex-wrap gap-2">
                  {databases.map(db => (
                    <div key={db.id} className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`db-${db.id}`}
                        checked={selectedDatabases.includes(db.id)}
                        onChange={() => handleDatabaseSelect(db.id)}
                        disabled={db.status !== 'connected'}
                      />
                      <label className="form-check-label" htmlFor={`db-${db.id}`}>
                        {db.name}
                        {db.status !== 'connected' && (
                          <span className={`ms-1 badge ${db.status === 'disconnected' ? 'badge-warning' : 'badge-danger'}`}>
                            {db.status}
                          </span>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card mt-4">
            <div className="card-header">
              <h5 className="mb-0">Search Results</h5>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="d-flex justify-content-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Match Score</th>
                        <th>Database</th>
                        <th>Name/Identifier</th>
                        <th>Record Type</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map(result => (
                        <tr key={result.id}>
                          <td>
                            <span className={`badge ${
                              result.matchScore >= 90 ? 'badge-success' :
                              result.matchScore >= 70 ? 'badge-warning' :
                              'badge-danger'
                            }`}>
                              {result.matchScore}%
                            </span>
                          </td>
                          <td>{result.database}</td>
                          <td>
                            <div>{result.name}</div>
                            {result.dateOfBirth && (
                              <small className="text-muted">DOB: {result.dateOfBirth}</small>
                            )}
                          </td>
                          <td>{result.recordType.replace('_', ' ')}</td>
                          <td>
                            <div className="btn-group">
                              <button
                                className="btn btn-sm btn-primary"
                                data-bs-toggle="collapse"
                                data-bs-target={`#result-${result.id}`}
                                aria-expanded="false"
                              >
                                View Details
                              </button>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => linkResultToCase(result)}
                              >
                                <FaLink className="me-1" /> Link to Case
                              </button>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => exportResult(result)}
                              >
                                Export
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : searchQuery ? (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <FaExclamationTriangle className="text-warning" style={{ fontSize: '2rem' }} />
                  </div>
                  <h5>No matching records found</h5>
                  <p className="text-muted">Try adjusting your search terms or selecting different databases.</p>
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <FaSearch className="text-muted" style={{ fontSize: '2rem' }} />
                  </div>
                  <h5>Search External Databases</h5>
                  <p className="text-muted">Enter a name or identifier above to search across connected databases.</p>
                </div>
              )}

              {/* Collapsible details sections */}
              {searchResults.map(result => (
                <div key={`detail-${result.id}`} className="collapse" id={`result-${result.id}`}>
                  <div className="card-body border-top">
                    <h6>Record Details</h6>
                    
                    <div className="mb-3">
                      <strong>Identifiers:</strong>
                      <ul className="list-group list-group-horizontal-sm flex-wrap mt-1">
                        {result.identifiers.map((id, index) => (
                          <li key={index} className="list-group-item flex-fill">
                            <small className="d-block text-muted">{id.key}</small>
                            <span>{id.value}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {result.recordType === 'criminal_record' && (
                      <div className="mb-3">
                        <strong>Prior Offenses:</strong>
                        <table className="table table-sm mt-1">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Offense</th>
                              <th>Disposition</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.data.priorOffenses.map((offense: any, index: number) => (
                              <tr key={index}>
                                <td>{offense.date}</td>
                                <td>{offense.offense}</td>
                                <td>{offense.disposition}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        
                        {result.data.warrants && result.data.warrants.length > 0 ? (
                          <div className="alert alert-danger mt-2">
                            <strong>Active Warrants:</strong> {result.data.warrants.join(', ')}
                          </div>
                        ) : (
                          <div className="mt-2"><small className="text-muted">No active warrants</small></div>
                        )}
                      </div>
                    )}
                    
                    {result.recordType === 'vehicle_record' && (
                      <div className="mb-3">
                        <strong>Vehicle History:</strong>
                        <table className="table table-sm mt-1">
                          <thead>
                            <tr>
                              <th>Vehicle</th>
                              <th>Plate</th>
                              <th>Color</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.data.vehicleHistory.map((vehicle: any, index: number) => (
                              <tr key={index}>
                                <td>{vehicle.year} {vehicle.make} {vehicle.model}</td>
                                <td>{vehicle.plate}</td>
                                <td>{vehicle.color}</td>
                                <td>{vehicle.sold ? 'Sold' : 'Current'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    
                    {result.recordType === 'fingerprint_match' && (
                      <div className="mb-3">
                        <strong>Fingerprint Match:</strong>
                        <ul className="list-group mt-1">
                          <li className="list-group-item d-flex justify-content-between align-items-center">
                            Match Type
                            <span>{result.data.matchType}</span>
                          </li>
                          <li className="list-group-item d-flex justify-content-between align-items-center">
                            Match Date
                            <span>{result.data.matchDate}</span>
                          </li>
                          <li className="list-group-item d-flex justify-content-between align-items-center">
                            Related Cases
                            <span>{result.data.relatedCases.join(', ')}</span>
                          </li>
                        </ul>
                      </div>
                    )}
                    
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <small className="text-muted">Last updated: {result.timestamp}</small>
                      <div>
                        <button
                          className="btn btn-sm btn-primary me-2"
                          onClick={() => linkResultToCase(result)}
                        >
                          <FaLink className="me-1" /> Link to Case
                        </button>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => exportResult(result)}
                        >
                          Export Data
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Connected Databases</h5>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {databases.map(db => (
                  <div key={db.id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">
                        {db.name}
                        <span className={`ms-2 badge ${
                          db.status === 'connected' ? 'badge-success' :
                          db.status === 'disconnected' ? 'badge-warning' :
                          'badge-danger'
                        }`}>
                          {db.status}
                        </span>
                      </h6>
                      <div className="dropdown">
                        <button className="btn btn-sm btn-icon" data-bs-toggle="dropdown">
                          <i className="fas fa-ellipsis-v"></i>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                          <li>
                            <button 
                              className="dropdown-item" 
                              onClick={() => syncDatabase(db.id)}
                              disabled={db.status !== 'connected'}
                            >
                              <FaSyncAlt className="me-2" /> Sync Now
                            </button>
                          </li>
                          <li>
                            <button 
                              className="dropdown-item" 
                              onClick={() => handleDatabaseConnection(db)}
                            >
                              <FaCog className="me-2" /> Configure
                            </button>
                          </li>
                          <li>
                            <button className="dropdown-item">
                              {db.status === 'connected' ? (
                                <>
                                  <FaUnlink className="me-2" /> Disconnect
                                </>
                              ) : (
                                <>
                                  <FaLink className="me-2" /> Connect
                                </>
                              )}
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="small mt-2">
                      <div className="mb-1">
                        <span className="text-muted">Type:</span> {db.type.replace('_', ' ')}
                      </div>
                      <div className="mb-1">
                        <span className="text-muted">Records:</span> {db.recordCount.toLocaleString()}
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <span className="text-muted">Last Sync:</span> {db.lastSync}
                        </div>
                        {db.status === 'connected' && (
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => syncDatabase(db.id)}
                          >
                            <FaSyncAlt className="me-1" /> Sync
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card mt-4">
            <div className="card-header">
              <h5 className="mb-0">Security & Compliance</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <FaLock className="me-2 text-primary" />
                  <h6 className="mb-0">Data Security</h6>
                </div>
                <p className="small text-muted">
                  All external database connections use encrypted channels. Data is never stored locally unless explicitly exported.
                </p>
              </div>
              
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <FaUserSecret className="me-2 text-primary" />
                  <h6 className="mb-0">Access Control</h6>
                </div>
                <p className="small text-muted">
                  External database access is limited to authorized personnel. All queries are logged for audit purposes.
                </p>
              </div>
              
              <div>
                <div className="d-flex align-items-center mb-2">
                  <FaFingerprint className="me-2 text-primary" />
                  <h6 className="mb-0">Search Compliance</h6>
                </div>
                <p className="small text-muted">
                  Searches must comply with department policies and legal regulations. Random audits are conducted to ensure compliance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Database Configuration Modal */}
      {showConfigModal && activeDatabase && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Configure Database Connection</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowConfigModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Database Name</label>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue={activeDatabase.name}
                    readOnly
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">API Endpoint</label>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue={activeDatabase.endpoint}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">API Key</label>
                  <input
                    type="password"
                    className="form-control"
                    defaultValue={activeDatabase.apiKey}
                  />
                  <small className="form-text text-muted">
                    Contact your system administrator to update API keys.
                  </small>
                </div>
                <div className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="requires-auth"
                    checked={activeDatabase.requiresAuth}
                    readOnly
                  />
                  <label className="form-check-label" htmlFor="requires-auth">
                    Requires Authentication
                  </label>
                </div>
                <div className="alert alert-info">
                  <small>
                    <FaExclamationTriangle className="me-2" />
                    Changes to database configuration may require approval from your system administrator.
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setShowConfigModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    // In a real app, this would save the configuration
                    setShowConfigModal(false);
                  }}
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExternalDatabases;
