import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaCamera, FaUpload, FaSearch, FaCloudUploadAlt, FaCheck, FaSpinner, FaFilePdf, FaCrop, FaAdjust, FaSave, FaFileExport, FaLink } from 'react-icons/fa';

type ScannedDocument = {
  id: string;
  name: string;
  dateCreated: string;
  status: 'processing' | 'complete' | 'error';
  type: 'id' | 'evidence' | 'report' | 'note' | 'other';
  preview: string;
  text?: string;
  confidence: number;
  linkedCase?: string;
  linkedEvidence?: string;
  tags: string[];
};

const DocumentScanner: React.FC = () => {
  const [mode, setMode] = useState<'camera' | 'upload' | 'library'>('upload');
  const [step, setStep] = useState<'capture' | 'process' | 'review'>('capture');
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const [scanConfidence, setScanConfidence] = useState(0);
  const [documentType, setDocumentType] = useState('evidence');
  const [recentDocuments, setRecentDocuments] = useState<ScannedDocument[]>([]);
  const [documentName, setDocumentName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLVideoElement>(null);

  // Mock data for recent documents
  React.useEffect(() => {
    const mockDocuments: ScannedDocument[] = [
      {
        id: 'doc-001',
        name: 'Suspect Statement',
        dateCreated: '2025-04-04',
        status: 'complete',
        type: 'evidence',
        preview: 'https://via.placeholder.com/100x150',
        text: 'Statement from suspect John Doe regarding his whereabouts on March 15, 2025.',
        confidence: 92,
        linkedCase: 'Downtown Robbery',
        linkedEvidence: 'Witness Testimony #2',
        tags: ['statement', 'suspect']
      },
      {
        id: 'doc-002',
        name: 'Crime Scene Photo',
        dateCreated: '2025-04-03',
        status: 'complete',
        type: 'evidence',
        preview: 'https://via.placeholder.com/100x150',
        confidence: 85,
        linkedCase: 'Downtown Robbery',
        tags: ['photo', 'crime scene']
      },
      {
        id: 'doc-003',
        name: 'Evidence Log',
        dateCreated: '2025-04-01',
        status: 'complete',
        type: 'report',
        preview: 'https://via.placeholder.com/100x150',
        text: 'Chain of custody record for evidence items #E-2025-0015 through #E-2025-0022.',
        confidence: 95,
        linkedCase: 'Downtown Robbery',
        tags: ['log', 'chain of custody']
      },
      {
        id: 'doc-004',
        name: 'Forensic Lab Receipt',
        dateCreated: '2025-03-29',
        status: 'processing',
        type: 'report',
        preview: 'https://via.placeholder.com/100x150',
        confidence: 0,
        tags: ['receipt', 'forensics']
      }
    ];
    setRecentDocuments(mockDocuments);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create a preview URL for the uploaded file
    const previewUrl = URL.createObjectURL(file);
    setCapturedImage(previewUrl);
    setDocumentName(file.name.split('.')[0]);
    setStep('process');
    simulateOCRProcessing();
  };

  const handleCameraCapture = () => {
    // In a real app, this would capture from the camera
    setIsCapturing(true);
    
    // Simulate camera capture
    setTimeout(() => {
      // Mock captured image (would be from camera in real app)
      setCapturedImage('https://via.placeholder.com/800x1000');
      setIsCapturing(false);
      setStep('process');
      setDocumentName(`Scan_${new Date().toISOString().slice(0, 10)}`);
      simulateOCRProcessing();
    }, 1500);
  };

  const simulateOCRProcessing = () => {
    setIsProcessing(true);
    
    // Simulate OCR processing time
    setTimeout(() => {
      // Mock OCR results
      setExtractedText('This is a sample document for evidence processing. Case #2025-001: Downtown Robbery. Collected items include one (1) black jacket, one (1) set of keys, and one (1) wallet containing ID for suspect John Doe. Items collected at 123 Main St at approximately 16:30 on March 15, 2025.');
      setScanConfidence(92);
      setIsProcessing(false);
      setStep('review');
    }, 3000);
  };

  const handleSaveDocument = () => {
    // In a real app, this would save to a database
    const newDocument: ScannedDocument = {
      id: `doc-${recentDocuments.length + 1}`,
      name: documentName,
      dateCreated: new Date().toISOString().slice(0, 10),
      status: 'complete',
      type: documentType as any,
      preview: capturedImage || 'https://via.placeholder.com/100x150',
      text: extractedText,
      confidence: scanConfidence,
      tags: ['recently added']
    };
    
    setRecentDocuments([newDocument, ...recentDocuments]);
    resetScanProcess();
  };

  const resetScanProcess = () => {
    setStep('capture');
    setCapturedImage(null);
    setExtractedText('');
    setScanConfidence(0);
    setDocumentName('');
  };

  const filteredDocuments = recentDocuments.filter(doc => {
    // Apply search filter
    const matchesSearch = searchQuery === '' || 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.text && doc.text.toLowerCase().includes(searchQuery.toLowerCase())) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Apply type filter
    const matchesType = activeFilter === null || doc.type === activeFilter;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="container-fluid px-4">
      <div className="page-title-actions mb-4">
        <h1>Document Scanner</h1>
        <div className="d-flex gap-2">
          <button
            className={`btn ${mode === 'camera' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setMode('camera')}
          >
            <FaCamera className="me-2" /> Camera
          </button>
          <button
            className={`btn ${mode === 'upload' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setMode('upload')}
          >
            <FaUpload className="me-2" /> Upload
          </button>
          <button
            className={`btn ${mode === 'library' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setMode('library')}
          >
            <FaFilePdf className="me-2" /> Document Library
          </button>
        </div>
      </div>

      {(mode === 'camera' || mode === 'upload') && (
        <div className="row">
          <div className="col-lg-7">
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  {step === 'capture' && (mode === 'camera' ? 'Capture Document' : 'Upload Document')}
                  {step === 'process' && 'Processing Document'}
                  {step === 'review' && 'Review & Save'}
                </h5>
              </div>
              <div className="card-body">
                {step === 'capture' && (
                  <>
                    {mode === 'camera' ? (
                      <div className="text-center">
                        <div 
                          className="camera-container border rounded mb-3" 
                          style={{ height: '400px', background: '#f8f9fa', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        >
                          {isCapturing ? (
                            <div className="d-flex flex-column align-items-center">
                              <div className="spinner-border text-primary mb-3" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                              <span>Accessing camera...</span>
                            </div>
                          ) : (
                            <div className="camera-placeholder">
                              <FaCamera style={{ fontSize: '3rem', color: '#6c757d' }} />
                              <p className="mt-3">Camera preview will appear here</p>
                              <video 
                                ref={cameraRef} 
                                style={{ display: 'none' }} 
                                width="100%" 
                                height="100%"
                              ></video>
                            </div>
                          )}
                        </div>
                        <button 
                          className="btn btn-lg btn-primary" 
                          onClick={handleCameraCapture}
                          disabled={isCapturing}
                        >
                          {isCapturing ? (
                            <>
                              <FaSpinner className="spin me-2" /> Capturing...
                            </>
                          ) : (
                            <>
                              <FaCamera className="me-2" /> Capture Document
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div 
                          className="upload-container border rounded mb-3 d-flex flex-column justify-content-center align-items-center" 
                          style={{ height: '400px', background: '#f8f9fa', cursor: 'pointer' }}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <FaCloudUploadAlt style={{ fontSize: '3rem', color: '#6c757d' }} />
                          <p className="mt-3">Click to upload a document or drag and drop</p>
                          <p className="text-muted small">Supports JPG, PNG, PDF (max 20MB)</p>
                        </div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          style={{ display: 'none' }}
                          accept="image/jpeg,image/png,application/pdf"
                          onChange={handleFileUpload}
                        />
                        <button 
                          className="btn btn-lg btn-primary" 
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <FaUpload className="me-2" /> Upload Document
                        </button>
                      </div>
                    )}
                  </>
                )}
                
                {step === 'process' && capturedImage && (
                  <div className="text-center">
                    <div className="mb-3">
                      <img 
                        src={capturedImage} 
                        alt="Captured document" 
                        className="img-fluid border rounded" 
                        style={{ maxHeight: '400px' }}
                      />
                    </div>
                    
                    <div className="processing-status mb-3">
                      {isProcessing ? (
                        <div className="d-flex flex-column align-items-center">
                          <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Processing...</span>
                          </div>
                          <h5>Processing document with OCR...</h5>
                          <div className="progress w-75 mt-2">
                            <div 
                              className="progress-bar progress-bar-striped progress-bar-animated" 
                              role="progressbar" 
                              style={{ width: '75%' }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <div className="d-flex justify-content-center">
                          <button 
                            className="btn btn-outline-secondary me-2"
                            onClick={resetScanProcess}
                          >
                            Cancel
                          </button>
                          <button 
                            className="btn btn-primary"
                            onClick={() => simulateOCRProcessing()}
                          >
                            <FaSearch className="me-2" /> Run OCR Again
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {step === 'review' && capturedImage && (
                  <div>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Document Name</label>
                          <input
                            type="text"
                            className="form-control"
                            value={documentName}
                            onChange={(e) => setDocumentName(e.target.value)}
                          />
                        </div>
                        
                        <div className="mb-3">
                          <label className="form-label">Document Type</label>
                          <select
                            className="form-select"
                            value={documentType}
                            onChange={(e) => setDocumentType(e.target.value)}
                          >
                            <option value="evidence">Evidence Document</option>
                            <option value="id">Identification</option>
                            <option value="report">Report</option>
                            <option value="note">Case Note</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        
                        <div className="mb-3">
                          <label className="form-label">OCR Confidence</label>
                          <div className="d-flex align-items-center">
                            <div className="progress flex-grow-1 me-2">
                              <div 
                                className={`progress-bar ${scanConfidence > 80 ? 'bg-success' : scanConfidence > 60 ? 'bg-warning' : 'bg-danger'}`}
                                role="progressbar" 
                                style={{ width: `${scanConfidence}%` }}
                              ></div>
                            </div>
                            <span>{scanConfidence}%</span>
                          </div>
                        </div>
                        
                        <div className="mb-3 d-flex gap-2">
                          <button className="btn btn-outline-secondary flex-grow-1">
                            <FaCrop className="me-2" /> Crop
                          </button>
                          <button className="btn btn-outline-secondary flex-grow-1">
                            <FaAdjust className="me-2" /> Adjust
                          </button>
                        </div>
                      </div>
                      
                      <div className="col-md-6">
                        <div className="mb-3 text-center">
                          <img 
                            src={capturedImage} 
                            alt="Processed document" 
                            className="img-fluid border rounded" 
                            style={{ maxHeight: '200px' }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Extracted Text</label>
                      <textarea
                        className="form-control"
                        rows={6}
                        value={extractedText}
                        onChange={(e) => setExtractedText(e.target.value)}
                      ></textarea>
                    </div>
                    
                    <div className="d-flex justify-content-between mt-4">
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={resetScanProcess}
                      >
                        Cancel
                      </button>
                      <div>
                        <button 
                          className="btn btn-outline-primary me-2"
                          onClick={() => {
                            // In a real app, this would export the document
                            alert('Document would be exported in a real application.');
                          }}
                        >
                          <FaFileExport className="me-2" /> Export
                        </button>
                        <button 
                          className="btn btn-primary"
                          onClick={handleSaveDocument}
                        >
                          <FaSave className="me-2" /> Save Document
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">OCR Processing Features</h5>
              </div>
              <div className="card-body">
                <div className="feature-list">
                  <div className="d-flex align-items-start mb-3">
                    <div className="feature-icon me-3">
                      <FaCheck className="text-success" />
                    </div>
                    <div>
                      <h6>Text Extraction</h6>
                      <p className="text-muted">Extracts text from documents, forms, IDs, and handwritten notes with high accuracy.</p>
                    </div>
                  </div>
                  
                  <div className="d-flex align-items-start mb-3">
                    <div className="feature-icon me-3">
                      <FaCheck className="text-success" />
                    </div>
                    <div>
                      <h6>Data Classification</h6>
                      <p className="text-muted">Automatically identifies document types and categorizes information.</p>
                    </div>
                  </div>
                  
                  <div className="d-flex align-items-start mb-3">
                    <div className="feature-icon me-3">
                      <FaCheck className="text-success" />
                    </div>
                    <div>
                      <h6>Entity Recognition</h6>
                      <p className="text-muted">Identifies names, dates, addresses, and other key information for easy linking to cases.</p>
                    </div>
                  </div>
                  
                  <div className="d-flex align-items-start mb-3">
                    <div className="feature-icon me-3">
                      <FaCheck className="text-success" />
                    </div>
                    <div>
                      <h6>Searchable PDFs</h6>
                      <p className="text-muted">Converts scanned documents into fully searchable PDF files for case management.</p>
                    </div>
                  </div>
                  
                  <div className="d-flex align-items-start">
                    <div className="feature-icon me-3">
                      <FaCheck className="text-success" />
                    </div>
                    <div>
                      <h6>Evidence Integration</h6>
                      <p className="text-muted">Directly link scanned documents to cases, evidence items, and suspects.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === 'library' && (
        <div className="row">
          <div className="col-12">
            <div className="card mb-4">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center flex-wrap">
                  <h5 className="mb-0">Document Library</h5>
                  <div className="d-flex gap-2">
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaSearch />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search documents..."
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
                </div>
              </div>
              <div className="card-body">
                <div className="document-filters mb-3">
                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      className={`btn btn-sm ${activeFilter === null ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setActiveFilter(null)}
                    >
                      All
                    </button>
                    <button
                      className={`btn btn-sm ${activeFilter === 'evidence' ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setActiveFilter('evidence')}
                    >
                      Evidence
                    </button>
                    <button
                      className={`btn btn-sm ${activeFilter === 'id' ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setActiveFilter('id')}
                    >
                      Identification
                    </button>
                    <button
                      className={`btn btn-sm ${activeFilter === 'report' ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setActiveFilter('report')}
                    >
                      Reports
                    </button>
                    <button
                      className={`btn btn-sm ${activeFilter === 'note' ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setActiveFilter('note')}
                    >
                      Notes
                    </button>
                  </div>
                </div>

                {filteredDocuments.length > 0 ? (
                  <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
                    {filteredDocuments.map(doc => (
                      <div key={doc.id} className="col">
                        <div className="card h-100">
                          <div className="card-header bg-transparent border-bottom-0 p-2">
                            <div className="d-flex justify-content-between align-items-center">
                              <span className={`badge ${
                                doc.type === 'evidence' ? 'badge-primary' :
                                doc.type === 'report' ? 'badge-success' :
                                doc.type === 'id' ? 'badge-info' : 'badge-secondary'
                              }`}>
                                {doc.type.charAt(0).toUpperCase() + doc.type.slice(1)}
                              </span>
                              <span className={`badge ${
                                doc.status === 'complete' ? 'badge-success' :
                                doc.status === 'processing' ? 'badge-warning' : 'badge-danger'
                              }`}>
                                {doc.status}
                              </span>
                            </div>
                          </div>
                          <div className="text-center p-2">
                            <img
                              src={typeof doc.preview === 'string' ? doc.preview : 'https://via.placeholder.com/100x150'}
                              alt={doc.name}
                              className="img-fluid document-preview"
                              style={{ maxHeight: '120px', objectFit: 'contain' }}
                            />
                          </div>
                          <div className="card-body">
                            <h6 className="card-title mb-1">{doc.name}</h6>
                            <p className="card-text small text-muted mb-2">Added: {doc.dateCreated}</p>
                            
                            {doc.confidence > 0 && (
                              <div className="small mb-2">
                                <div className="d-flex justify-content-between">
                                  <span>OCR Confidence:</span>
                                  <span className={
                                    doc.confidence > 90 ? 'text-success' :
                                    doc.confidence > 75 ? 'text-primary' :
                                    'text-warning'
                                  }>
                                    {doc.confidence}%
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            {doc.linkedCase && (
                              <div className="small mb-2">
                                <strong>Case:</strong> <Link to="#">{doc.linkedCase}</Link>
                              </div>
                            )}
                            
                            {doc.tags.length > 0 && (
                              <div className="document-tags mt-2">
                                {doc.tags.map((tag, index) => (
                                  <span key={index} className="badge badge-light me-1 mb-1">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="card-footer bg-transparent">
                            <div className="btn-group w-100">
                              <button className="btn btn-sm btn-outline-primary">
                                View
                              </button>
                              {!doc.linkedCase && (
                                <button className="btn btn-sm btn-outline-primary">
                                  <FaLink /> Link
                                </button>
                              )}
                              <button className="btn btn-sm btn-outline-primary">
                                <FaFileExport />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <div className="mb-3">
                      <FaSearch className="text-muted" style={{ fontSize: '3rem' }} />
                    </div>
                    <h5>No documents found</h5>
                    <p className="text-muted">Try adjusting your search terms or filters.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentScanner;
