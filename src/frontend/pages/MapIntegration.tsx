import React, { useState, useEffect, useRef } from 'react';
import { FaMapMarkedAlt, FaSearch, FaLayerGroup, FaRuler, FaDrawPolygon, FaFilter, FaFileExport, FaPlus, FaSync, FaMapPin, FaCrosshairs, FaClock } from 'react-icons/fa';

type Location = {
  id: string;
  name: string;
  type: 'crime_scene' | 'evidence' | 'witness' | 'suspect' | 'victim' | 'poi';
  latitude: number;
  longitude: number;
  address?: string;
  description?: string;
  linkedCaseId?: string;
  linkedCaseName?: string;
  dateAdded: string;
  tags: string[];
};

type Layer = {
  id: string;
  name: string;
  visible: boolean;
  type: 'points' | 'heatmap' | 'zone' | 'route';
  description: string;
};

const MapIntegration: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLocationTypeFilter, setActiveLocationTypeFilter] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<'select' | 'measure' | 'draw' | null>('select');
  const [layers, setLayers] = useState<Layer[]>([]);
  const [mapView, setMapView] = useState<'satellite' | 'streets' | 'hybrid'>('streets');
  const [showTimeSlider, setShowTimeSlider] = useState(false);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  // Load mock locations
  useEffect(() => {
    const mockLocations: Location[] = [
      {
        id: 'loc-001',
        name: 'Primary Crime Scene',
        type: 'crime_scene',
        latitude: 37.7749,
        longitude: -122.4194,
        address: '123 Main Street, San Francisco, CA',
        description: 'Location where the robbery took place on March 15, 2025.',
        linkedCaseId: 'case-2025-001',
        linkedCaseName: 'Downtown Robbery',
        dateAdded: '2025-03-15',
        tags: ['active', 'high-priority']
      },
      {
        id: 'loc-002',
        name: 'Evidence Recovery - Weapon',
        type: 'evidence',
        latitude: 37.7746,
        longitude: -122.4190,
        address: 'Alley behind 123 Main Street, San Francisco, CA',
        description: 'Location where the knife was recovered.',
        linkedCaseId: 'case-2025-001',
        linkedCaseName: 'Downtown Robbery',
        dateAdded: '2025-03-16',
        tags: ['evidence', 'weapon']
      },
      {
        id: 'loc-003',
        name: 'Witness Sighting',
        type: 'witness',
        latitude: 37.7752,
        longitude: -122.4188,
        address: 'Coffee shop at 156 Market St, San Francisco, CA',
        description: 'Location where the witness observed the suspect fleeing.',
        linkedCaseId: 'case-2025-001',
        linkedCaseName: 'Downtown Robbery',
        dateAdded: '2025-03-15',
        tags: ['witness', 'verified']
      },
      {
        id: 'loc-004',
        name: 'Suspect Residence',
        type: 'suspect',
        latitude: 37.7830,
        longitude: -122.4170,
        address: '789 Pine St, Apt 3B, San Francisco, CA',
        description: 'Last known address of the primary suspect.',
        linkedCaseId: 'case-2025-001',
        linkedCaseName: 'Downtown Robbery',
        dateAdded: '2025-03-17',
        tags: ['suspect', 'residence']
      },
      {
        id: 'loc-005',
        name: 'Traffic Camera #372',
        type: 'poi',
        latitude: 37.7760,
        longitude: -122.4182,
        description: 'Traffic camera that captured suspect vehicle.',
        linkedCaseId: 'case-2025-001',
        linkedCaseName: 'Downtown Robbery',
        dateAdded: '2025-03-15',
        tags: ['camera', 'evidence-source']
      }
    ];
    
    setLocations(mockLocations);
    
    // Set mock layers
    setLayers([
      {
        id: 'layer-001',
        name: 'Crime Scenes',
        visible: true,
        type: 'points',
        description: 'All marked crime scenes'
      },
      {
        id: 'layer-002',
        name: 'Evidence Locations',
        visible: true,
        type: 'points',
        description: 'Locations where evidence was collected or found'
      },
      {
        id: 'layer-003',
        name: 'Crime Density',
        visible: false,
        type: 'heatmap',
        description: 'Heatmap showing crime density in the area'
      },
      {
        id: 'layer-004',
        name: 'Patrol Zones',
        visible: false,
        type: 'zone',
        description: 'Police patrol zones in the area'
      },
      {
        id: 'layer-005',
        name: 'Suspect Route',
        visible: true,
        type: 'route',
        description: 'Reconstructed route taken by the suspect'
      }
    ]);
  }, []);
  
  // Filter locations based on search and location type
  const filteredLocations = locations.filter(loc => {
    const matchesSearch = searchQuery === '' || 
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (loc.description && loc.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (loc.address && loc.address.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = activeLocationTypeFilter === null || loc.type === activeLocationTypeFilter;
    
    return matchesSearch && matchesType;
  });

  const toggleLayer = (layerId: string) => {
    setLayers(layers.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  const handleAddLocation = () => {
    // In a real app, this would open a modal to add a new location
    alert('In a real app, this would open a form to add a new location on the map.');
  };

  return (
    <div className="container-fluid px-4">
      <div className="page-title-actions mb-4">
        <h1>Map & Location Analysis</h1>
        <div className="d-flex gap-2">
          <div className="btn-group">
            <button 
              className={`btn ${mapView === 'streets' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setMapView('streets')}
            >
              Streets
            </button>
            <button 
              className={`btn ${mapView === 'satellite' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setMapView('satellite')}
            >
              Satellite
            </button>
            <button 
              className={`btn ${mapView === 'hybrid' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setMapView('hybrid')}
            >
              Hybrid
            </button>
          </div>
          <button 
            className="btn btn-primary"
            onClick={handleAddLocation}
          >
            <FaPlus className="me-2" /> Add Location
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-md-9">
          <div className="card map-container mb-4">
            <div className="card-body p-0 position-relative">
              {/* Map would be rendered here in a real implementation */}
              <div 
                ref={mapContainerRef}
                className="map-area"
                style={{ 
                  height: '600px', 
                  backgroundColor: mapView === 'streets' ? '#e5e5e5' : 
                    mapView === 'satellite' ? '#213345' : '#304657',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div className="map-overlay text-center">
                  <FaMapMarkedAlt style={{ fontSize: '5rem', color: '#6c757d', marginTop: '200px' }} />
                  <h4 className="mt-3 text-muted">Map Visualization</h4>
                  <p className="text-muted">In a real implementation, this would display an interactive map using a mapping API like Mapbox or Google Maps.</p>
                </div>
                
                {/* Simplified visualization of location pins for display purposes */}
                {filteredLocations.map(loc => (
                  <div
                    key={loc.id}
                    className="location-marker"
                    style={{
                      position: 'absolute',
                      left: `${(Math.abs(loc.longitude + 122.4194) * 1000) % 500 + 100}px`,
                      top: `${(Math.abs(loc.latitude - 37.7749) * 1000) % 400 + 100}px`,
                      transform: 'translate(-50%, -100%)',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedLocation(loc)}
                  >
                    <div 
                      className={`marker-icon ${selectedLocation?.id === loc.id ? 'active' : ''}`}
                      style={{ 
                        color: 
                          loc.type === 'crime_scene' ? '#dc3545' : 
                          loc.type === 'evidence' ? '#fd7e14' : 
                          loc.type === 'witness' ? '#007bff' : 
                          loc.type === 'suspect' ? '#6610f2' : 
                          loc.type === 'victim' ? '#20c997' : '#6c757d',
                        fontSize: '1.5rem'
                      }}
                    >
                      <FaMapPin />
                    </div>
                    <div className="marker-label px-2 py-1 rounded small bg-dark text-white">
                      {loc.name}
                    </div>
                  </div>
                ))}
                
                {/* Map tools overlay */}
                <div className="map-tools position-absolute" style={{ top: '10px', right: '10px' }}>
                  <div className="card shadow-sm">
                    <div className="card-body p-2">
                      <div className="btn-group-vertical">
                        <button 
                          className={`btn btn-sm ${activeTool === 'select' ? 'btn-primary' : 'btn-outline'}`}
                          onClick={() => setActiveTool('select')}
                          title="Select Tool"
                        >
                          <FaCrosshairs />
                        </button>
                        <button 
                          className={`btn btn-sm ${activeTool === 'measure' ? 'btn-primary' : 'btn-outline'}`}
                          onClick={() => setActiveTool('measure')}
                          title="Measure Distance"
                        >
                          <FaRuler />
                        </button>
                        <button 
                          className={`btn btn-sm ${activeTool === 'draw' ? 'btn-primary' : 'btn-outline'}`}
                          onClick={() => setActiveTool('draw')}
                          title="Draw Area"
                        >
                          <FaDrawPolygon />
                        </button>
                        <button 
                          className={`btn btn-sm btn-outline`}
                          onClick={() => setShowTimeSlider(!showTimeSlider)}
                          title="Time Analysis"
                        >
                          <FaClock />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Time slider for temporal analysis */}
                {showTimeSlider && (
                  <div 
                    className="time-slider position-absolute w-50"
                    style={{ bottom: '20px', left: '50%', transform: 'translateX(-50%)' }}
                  >
                    <div className="card shadow">
                      <div className="card-body p-3">
                        <h6 className="mb-2">Temporal Analysis</h6>
                        <div>
                          <label className="form-label small">Timeline: March 15-20, 2025</label>
                          <input type="range" className="form-range" min="0" max="5" />
                          <div className="d-flex justify-content-between small text-muted">
                            <span>Mar 15</span>
                            <span>Mar 16</span>
                            <span>Mar 17</span>
                            <span>Mar 18</span>
                            <span>Mar 19</span>
                            <span>Mar 20</span>
                          </div>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                          <button className="btn btn-sm btn-outline">
                            <i className="fas fa-play"></i> Animate
                          </button>
                          <button className="btn btn-sm btn-outline" onClick={() => setShowTimeSlider(false)}>
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Selected location detail */}
          {selectedLocation && (
            <div className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Location Details</h5>
                <button 
                  className="btn btn-sm btn-close"
                  onClick={() => setSelectedLocation(null)}
                ></button>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <h5>{selectedLocation.name}</h5>
                    <div className="mb-3">
                      <span className="badge badge-primary me-2">
                        {selectedLocation.type.replace('_', ' ')}
                      </span>
                      {selectedLocation.tags.map((tag, index) => (
                        <span key={index} className="badge badge-secondary me-1">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    {selectedLocation.address && (
                      <div className="mb-3">
                        <strong>Address:</strong> {selectedLocation.address}
                      </div>
                    )}
                    
                    {selectedLocation.description && (
                      <div className="mb-3">
                        <strong>Description:</strong> {selectedLocation.description}
                      </div>
                    )}
                    
                    <div className="mb-3">
                      <strong>Coordinates:</strong> {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                    </div>
                    
                    {selectedLocation.linkedCaseName && (
                      <div className="mb-3">
                        <strong>Linked Case:</strong> {selectedLocation.linkedCaseName}
                      </div>
                    )}
                    
                    <div>
                      <strong>Added on:</strong> {selectedLocation.dateAdded}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="location-actions d-flex flex-wrap gap-2 mb-3">
                      <button className="btn btn-sm btn-primary">
                        Edit Details
                      </button>
                      <button className="btn btn-sm btn-outline-primary">
                        View in Street View
                      </button>
                      <button className="btn btn-sm btn-outline-primary">
                        Get Directions
                      </button>
                      <button className="btn btn-sm btn-outline-primary">
                        View Related Evidence
                      </button>
                    </div>
                    
                    <div className="location-nearby">
                      <h6 className="mb-2">Nearby Locations</h6>
                      <div className="list-group list-group-flush">
                        {locations
                          .filter(loc => loc.id !== selectedLocation.id)
                          .slice(0, 3)
                          .map(loc => (
                            <button
                              key={loc.id}
                              className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                              onClick={() => setSelectedLocation(loc)}
                            >
                              <div>
                                <div>{loc.name}</div>
                                <small className="text-muted">
                                  {loc.type.replace('_', ' ')}
                                </small>
                              </div>
                              <span className="badge badge-primary rounded-pill">0.2 mi</span>
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="col-md-3">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Search & Filter</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="input-group">
                  <span className="input-group-text">
                    <FaSearch />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search locations..."
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
              
              <div className="mb-3">
                <label className="form-label">Location Type</label>
                <div className="d-flex flex-wrap gap-2">
                  <button 
                    className={`btn btn-sm ${activeLocationTypeFilter === null ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveLocationTypeFilter(null)}
                  >
                    All
                  </button>
                  <button 
                    className={`btn btn-sm ${activeLocationTypeFilter === 'crime_scene' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveLocationTypeFilter('crime_scene')}
                  >
                    Crime Scenes
                  </button>
                  <button 
                    className={`btn btn-sm ${activeLocationTypeFilter === 'evidence' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveLocationTypeFilter('evidence')}
                  >
                    Evidence
                  </button>
                  <button 
                    className={`btn btn-sm ${activeLocationTypeFilter === 'witness' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveLocationTypeFilter('witness')}
                  >
                    Witnesses
                  </button>
                  <button 
                    className={`btn btn-sm ${activeLocationTypeFilter === 'suspect' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveLocationTypeFilter('suspect')}
                  >
                    Suspects
                  </button>
                  <button 
                    className={`btn btn-sm ${activeLocationTypeFilter === 'victim' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveLocationTypeFilter('victim')}
                  >
                    Victims
                  </button>
                  <button 
                    className={`btn btn-sm ${activeLocationTypeFilter === 'poi' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveLocationTypeFilter('poi')}
                  >
                    POI
                  </button>
                </div>
              </div>
              
              <div className="card mb-3">
                <div className="card-header bg-transparent">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">Map Layers</h6>
                    <button className="btn btn-sm btn-icon">
                      <FaSync />
                    </button>
                  </div>
                </div>
                <div className="card-body p-0">
                  <div className="list-group list-group-flush">
                    {layers.map(layer => (
                      <div key={layer.id} className="list-group-item p-2">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`layer-toggle-${layer.id}`}
                            checked={layer.visible}
                            onChange={() => toggleLayer(layer.id)}
                          />
                          <label className="form-check-label d-flex justify-content-between" htmlFor={`layer-toggle-${layer.id}`}>
                            <span>{layer.name}</span>
                            <span className="badge bg-light text-dark">
                              {layer.type}
                            </span>
                          </label>
                        </div>
                        <small className="text-muted d-block mt-1">
                          {layer.description}
                        </small>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <h6 className="mb-2">Export Options</h6>
                <div className="d-grid gap-2">
                  <button className="btn btn-sm btn-outline">
                    <FaFileExport className="me-2" /> Export Current View
                  </button>
                  <button className="btn btn-sm btn-outline">
                    <FaFileExport className="me-2" /> Export KML/KMZ
                  </button>
                  <button className="btn btn-sm btn-outline">
                    <FaFileExport className="me-2" /> Export to Case Report
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Spatial Analysis</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button className="btn btn-outline text-start">
                  <div>Proximity Analysis</div>
                  <small className="text-muted">Find relationships based on location proximity</small>
                </button>
                <button className="btn btn-outline text-start">
                  <div>Pattern Recognition</div>
                  <small className="text-muted">Identify geographic patterns in crime data</small>
                </button>
                <button className="btn btn-outline text-start">
                  <div>Route Analysis</div>
                  <small className="text-muted">Analyze possible routes between locations</small>
                </button>
                <button className="btn btn-outline text-start">
                  <div>Coverage Analysis</div>
                  <small className="text-muted">Analyze camera and patrol coverage areas</small>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapIntegration;
