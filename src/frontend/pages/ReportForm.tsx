// src/frontend/pages/ReportForm.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

interface FormValues {
  title: string;
  analysis_type: string;
  template: string;
  description: string;
  include_evidence: boolean;
  include_suspects: boolean;
  include_timeline: boolean;
  export_format: string;
  visibility: string;
  schedule_periodic: boolean;
  periodic_interval: string;
}

interface TemplateOption {
  id: string;
  name: string;
  description: string;
}

const ReportForm: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [caseTitle, setCaseTitle] = useState<string>('');
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  
  // Load case info and templates
  useEffect(() => {
    // In a real application, we would fetch this from an API
    // For demo, we'll use mock data
    
    // Simulating API call to get case title
    setTimeout(() => {
      setCaseTitle(`Case #${caseId} - Investigation`);
      
      // Set available templates
      setTemplates([
        {
          id: 'standard',
          name: 'Standard Investigation Report',
          description: 'General purpose report with case summary, findings, and conclusions'
        },
        {
          id: 'forensic',
          name: 'Forensic Analysis Report',
          description: 'Detailed documentation of physical evidence examination and forensic findings'
        },
        {
          id: 'intelligence',
          name: 'Intelligence Brief',
          description: 'Concise overview of case intelligence, connections, and patterns'
        },
        {
          id: 'court',
          name: 'Court Presentation',
          description: 'Formal report formatted for court submission with legal references'
        },
        {
          id: 'executive',
          name: 'Executive Summary',
          description: 'High-level overview for supervisory review with key findings only'
        }
      ]);
    }, 500);
  }, [caseId]);
  
  const initialValues: FormValues = {
    title: '',
    analysis_type: 'general',
    template: 'standard',
    description: '',
    include_evidence: true,
    include_suspects: true,
    include_timeline: true,
    export_format: 'pdf',
    visibility: 'team',
    schedule_periodic: false,
    periodic_interval: 'weekly'
  };
  
  const validationSchema = Yup.object({
    title: Yup.string().required('Report title is required'),
    analysis_type: Yup.string().required('Analysis type is required'),
    template: Yup.string().required('Please select a template'),
    description: Yup.string(),
    export_format: Yup.string().required('Export format is required')
  });
  
  const handleSubmit = (values: FormValues, { setSubmitting }: any) => {
    // In a real app, this would be an API call
    // For demo purposes, we'll simulate it
    console.log('Report form values:', values);
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      // If exporting directly, trigger file download
      if (values.export_format !== 'system') {
        downloadReport(values);
      }
      
      // Navigate back to case detail page
      navigate(`/cases/${caseId}?tab=reports`);
      setSubmitting(false);
    }, 1500);
  };
  
  const downloadReport = (values: FormValues) => {
    // In a real app, this would generate and download the actual file
    // For demo purposes, we'll just show an alert
    
    const fileExt = values.export_format.toUpperCase();
    alert(`Report "${values.title}" would now download as a ${fileExt} file.`);
    
    // In an actual implementation, we would:
    // 1. Make an API call to generate the report
    // 2. Get a response with a URL to the generated file
    // 3. Use window.location or a download helper to trigger the download
  };
  
  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };
  
  if (!templates.length) {
    return (
      <div className="container py-4">
        <div className="card">
          <div className="card-body text-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading report options...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-4">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h2>Create Analysis Report</h2>
          <div>
            <button 
              onClick={togglePreview} 
              className="btn btn-outline-secondary me-2"
              disabled={previewMode}
            >
              <i className="bi bi-eye"></i> Preview
            </button>
            <Link to={`/cases/${caseId}?tab=reports`} className="btn btn-outline">
              Cancel
            </Link>
          </div>
        </div>
        <div className="card-body">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, isSubmitting, setFieldValue }) => (
              <Form>
                <div className="row mb-4">
                  <div className="col-md-9">
                    <div className="form-group mb-3">
                      <label htmlFor="title" className="form-label">Report Title*</label>
                      <Field 
                        type="text" 
                        className={`form-control ${errors.title && touched.title ? 'is-invalid' : ''}`}
                        id="title"
                        name="title"
                        placeholder={`Report for ${caseTitle}`}
                      />
                      <ErrorMessage name="title" component="div" className="invalid-feedback" />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group mb-3">
                      <label htmlFor="export_format" className="form-label">Export Format</label>
                      <Field
                        as="select"
                        className="form-control"
                        id="export_format"
                        name="export_format"
                      >
                        <option value="pdf">PDF Document</option>
                        <option value="docx">Word Document (DOCX)</option>
                        <option value="xlsx">Excel Spreadsheet (XLSX)</option>
                        <option value="html">HTML Report</option>
                        <option value="system">Save to System Only</option>
                      </Field>
                    </div>
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <label htmlFor="analysis_type" className="form-label">Analysis Type</label>
                      <Field
                        as="select"
                        className="form-control"
                        id="analysis_type"
                        name="analysis_type"
                      >
                        <option value="general">General Analysis</option>
                        <option value="forensic">Forensic Analysis</option>
                        <option value="financial">Financial Analysis</option>
                        <option value="behavioral">Behavioral Analysis</option>
                        <option value="digital">Digital Forensics</option>
                        <option value="intelligence">Intelligence Analysis</option>
                      </Field>
                    </div>
                  </div>
                  
                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <label htmlFor="template" className="form-label">Report Template</label>
                      <Field
                        as="select"
                        className="form-control"
                        id="template"
                        name="template"
                      >
                        {templates.map(template => (
                          <option key={template.id} value={template.id}>{template.name}</option>
                        ))}
                      </Field>
                      {values.template && (
                        <small className="text-muted d-block mt-1">
                          {templates.find(t => t.id === values.template)?.description}
                        </small>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <label htmlFor="visibility" className="form-label">Report Visibility</label>
                      <Field
                        as="select"
                        className="form-control"
                        id="visibility"
                        name="visibility"
                      >
                        <option value="private">Private (You Only)</option>
                        <option value="team">Investigation Team</option>
                        <option value="department">Department</option>
                        <option value="all">All Authorized Users</option>
                      </Field>
                    </div>
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-12">
                    <div className="form-group">
                      <label htmlFor="description" className="form-label">Description</label>
                      <Field 
                        as="textarea" 
                        className="form-control"
                        id="description"
                        name="description"
                        rows={4}
                        placeholder="Enter a description of the analysis report"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="card h-100">
                      <div className="card-header bg-light">
                        <h5 className="mb-0 fs-6">Report Contents</h5>
                      </div>
                      <div className="card-body">
                        <div className="form-check mb-2">
                          <Field 
                            type="checkbox" 
                            className="form-check-input" 
                            id="include_evidence" 
                            name="include_evidence"
                          />
                          <label className="form-check-label" htmlFor="include_evidence">
                            Include Evidence Items
                          </label>
                        </div>
                        
                        <div className="form-check mb-2">
                          <Field 
                            type="checkbox" 
                            className="form-check-input" 
                            id="include_suspects" 
                            name="include_suspects"
                          />
                          <label className="form-check-label" htmlFor="include_suspects">
                            Include Suspects
                          </label>
                        </div>
                        
                        <div className="form-check">
                          <Field 
                            type="checkbox" 
                            className="form-check-input" 
                            id="include_timeline" 
                            name="include_timeline"
                          />
                          <label className="form-check-label" htmlFor="include_timeline">
                            Include Case Timeline
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="card h-100">
                      <div className="card-header bg-light">
                        <h5 className="mb-0 fs-6">Scheduling</h5>
                      </div>
                      <div className="card-body">
                        <div className="form-check mb-3">
                          <Field 
                            type="checkbox" 
                            className="form-check-input" 
                            id="schedule_periodic" 
                            name="schedule_periodic"
                          />
                          <label className="form-check-label" htmlFor="schedule_periodic">
                            Generate this report periodically
                          </label>
                        </div>
                        
                        {values.schedule_periodic && (
                          <div className="mb-2">
                            <label htmlFor="periodic_interval" className="form-label">Interval</label>
                            <Field
                              as="select"
                              className="form-control"
                              id="periodic_interval"
                              name="periodic_interval"
                            >
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="biweekly">Bi-weekly</option>
                              <option value="monthly">Monthly</option>
                            </Field>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 d-flex justify-content-between">
                  <div>
                    <button 
                      type="submit" 
                      className="btn btn-primary me-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 
                        <><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Creating...</> : 
                        <>Create Report</>
                      }
                    </button>
                    <Link to={`/cases/${caseId}?tab=reports`} className="btn btn-outline">
                      Cancel
                    </Link>
                  </div>
                  
                  {values.export_format !== 'system' && (
                    <button 
                      type="button" 
                      className="btn btn-success"
                      onClick={() => handleSubmit(values, { setSubmitting: () => {} })}
                      disabled={isSubmitting}
                    >
                      <i className="bi bi-download me-1"></i> Create & Download {values.export_format.toUpperCase()}
                    </button>
                  )}
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
      
      {/* Report Preview Modal would be implemented here in a real application */}
      {previewMode && (
        <div className="card mt-4">
          <div className="card-header d-flex justify-content-between align-items-center bg-light">
            <h3 className="mb-0 h5">Report Preview</h3>
            <button onClick={togglePreview} className="btn btn-sm btn-outline-secondary">
              <i className="bi bi-x-lg"></i> Close Preview
            </button>
          </div>
          <div className="card-body">
            <div className="alert alert-info">
              In the actual implementation, this would show a preview of the report based on the selected template and options.
            </div>
            <div className="p-4 border rounded bg-light">
              <h1 className="text-center mb-4">Sample Report Preview</h1>
              <p className="text-center text-muted">
                Preview would show the actual report content based on your selections.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportForm;
