import React from 'react';
import { Routes, Route, Navigate, useNavigate, useParams, Link } from 'react-router-dom';
import './App.css';
import { 
  FaArrowLeft, 
  FaMicrophone, 
  FaBalanceScale, 
  FaUserShield, 
  FaPhone 
} from 'react-icons/fa';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CaseList from './pages/CaseList';
import CaseDetail from './pages/CaseDetail';
import EvidenceList from './pages/EvidenceList';
import EvidenceDetail from './pages/EvidenceDetail';
import SuspectList from './pages/SuspectList';
import SuspectDetail from './pages/SuspectDetail';
import AnalysisReport from './pages/AnalysisReport';
import AnalysisList from './pages/AnalysisList';
import UserProfile from './pages/UserProfile';
import AdminPanel from './pages/AdminPanel';
import Signup from './pages/Signup';
import AddUser from './pages/AddUser';
import ExternalDatabases from './pages/ExternalDatabases';
import DocumentScanner from './pages/DocumentScanner';
import MapIntegration from './pages/MapIntegration';
import CaseCollaboration from './pages/CaseCollaboration';
import WitnessList from './pages/WitnessList';
import WitnessDetail from './pages/WitnessDetail';
import WitnessInterviewScheduler from './pages/WitnessInterviewScheduler';

// Collaboration Components
import DiscussionBoard from './components/collaboration/DiscussionBoard';
import TaskTracker from './components/collaboration/TaskTracker';
import TeamMembers from './components/collaboration/TeamMembers';

// Auth Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Define form components inline to solve the import issues
const TimelineEventForm: React.FC = () => {
  const navigate = useNavigate();
  const { caseId } = useParams<{ caseId: string }>();
  
  // If this page is accessed directly without caseId, redirect to cases
  if (!caseId) {
    return <Navigate to="/cases" replace />;
  }
  
  return (
    <div className="container py-4">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h2>Add Timeline Event</h2>
          <Link to={`/cases/${caseId}?tab=timeline`} className="btn btn-outline">Cancel</Link>
        </div>
        <div className="card-body">
          <form onSubmit={(e) => {
            e.preventDefault();
            navigate(`/cases/${caseId}?tab=timeline`);
          }}>
            <div className="form-group mb-3">
              <label htmlFor="event_time" className="form-label">Event Time</label>
              <input type="datetime-local" className="form-control" id="event_time" defaultValue={new Date().toISOString().slice(0, 16)} />
            </div>
            
            <div className="form-group mb-3">
              <label htmlFor="event_description" className="form-label">Description*</label>
              <textarea className="form-control" id="event_description" rows={3} required></textarea>
            </div>
            
            <div className="form-group mb-3">
              <label htmlFor="event_location" className="form-label">Location</label>
              <input type="text" className="form-control" id="event_location" />
            </div>
            
            <div className="form-check mb-3">
              <input type="checkbox" className="form-check-input" id="is_verified" />
              <label className="form-check-label" htmlFor="is_verified">Mark as verified</label>
            </div>
            
            <div className="mt-4">
              <button type="submit" className="btn btn-primary">Add Event</button>
              <Link to={`/cases/${caseId}?tab=timeline`} className="btn btn-outline ms-2">Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const CaseNoteForm: React.FC = () => {
  const navigate = useNavigate();
  const { caseId } = useParams<{ caseId: string }>();
  
  // If this page is accessed directly without caseId, redirect to cases
  if (!caseId) {
    return <Navigate to="/cases" replace />;
  }
  
  return (
    <div className="container py-4">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h2>Add Case Note</h2>
          <Link to={`/cases/${caseId}?tab=notes`} className="btn btn-outline">Cancel</Link>
        </div>
        <div className="card-body">
          <form onSubmit={(e) => {
            e.preventDefault();
            navigate(`/cases/${caseId}?tab=notes`);
          }}>
            <div className="form-group mb-3">
              <label htmlFor="note_text" className="form-label">Note*</label>
              <textarea className="form-control" id="note_text" rows={5} required placeholder="Enter your note here..."></textarea>
            </div>
            
            <div className="form-check mb-3">
              <input type="checkbox" className="form-check-input" id="is_private" />
              <label className="form-check-label" htmlFor="is_private">Mark as private</label>
              <small className="form-text text-muted d-block">
                Private notes are only visible to you and administrators.
              </small>
            </div>
            
            <div className="mt-4">
              <button type="submit" className="btn btn-primary">Add Note</button>
              <Link to={`/cases/${caseId}?tab=notes`} className="btn btn-outline ms-2">Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ReportForm: React.FC = () => {
  const navigate = useNavigate();
  const { caseId } = useParams<{ caseId: string }>();
  
  // If this page is accessed directly without caseId, redirect to cases
  if (!caseId) {
    return <Navigate to="/cases" replace />;
  }
  
  return (
    <div className="container py-4">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h2>Create Analysis Report</h2>
          <Link to={`/cases/${caseId}?tab=reports`} className="btn btn-outline">Cancel</Link>
        </div>
        <div className="card-body">
          <form onSubmit={(e) => {
            e.preventDefault();
            navigate(`/cases/${caseId}?tab=reports`);
          }}>
            <div className="form-group mb-3">
              <label htmlFor="title" className="form-label">Report Title*</label>
              <input type="text" className="form-control" id="title" required placeholder="Enter the report title" />
            </div>
            
            <div className="form-group mb-3">
              <label htmlFor="analysis_type" className="form-label">Analysis Type</label>
              <select className="form-control" id="analysis_type" defaultValue="general">
                <option value="general">General Analysis</option>
                <option value="forensic">Forensic Analysis</option>
                <option value="financial">Financial Analysis</option>
                <option value="behavioral">Behavioral Analysis</option>
                <option value="digital">Digital Forensics</option>
              </select>
            </div>
            
            <div className="form-group mb-3">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea className="form-control" id="description" rows={4} placeholder="Enter a description of the analysis report"></textarea>
            </div>
            
            <div className="mt-4">
              <button type="submit" className="btn btn-primary">Create Report</button>
              <Link to={`/cases/${caseId}?tab=reports`} className="btn btn-outline ms-2">Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Wrapper components for collaboration features that properly handle route params
const DiscussionBoardWrapper: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  return <DiscussionBoard caseId={caseId || ''} />;
};

const TaskTrackerWrapper: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  return <TaskTracker caseId={caseId || ''} />;
};

const TeamMembersWrapper: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  return <TeamMembers caseId={caseId || ''} />;
};

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="app-container">
      {isAuthenticated && <Header />}
      <div className="main-content">
        {isAuthenticated && <Sidebar />}
        <div className="page-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Redirect root path to login if not authenticated */}
            <Route path="/" element={
              isAuthenticated ? (
                <Dashboard />
              ) : (
                <Navigate to="/login" replace />
              )
            } />
            
            <Route path="/cases" element={
              <ProtectedRoute>
                <CaseList />
              </ProtectedRoute>
            } />
            
            <Route path="/cases/:caseId" element={
              <ProtectedRoute>
                <CaseDetail />
              </ProtectedRoute>
            } />

            <Route path="/cases/:caseId/events/add" element={
              <ProtectedRoute>
                <TimelineEventForm />
              </ProtectedRoute>
            } />
            
            <Route path="/cases/:caseId/notes/add" element={
              <ProtectedRoute>
                <CaseNoteForm />
              </ProtectedRoute>
            } />
            
            <Route path="/cases/:caseId/reports/add" element={
              <ProtectedRoute>
                <ReportForm />
              </ProtectedRoute>
            } />
            
            <Route path="/evidence" element={
              <ProtectedRoute>
                <EvidenceList />
              </ProtectedRoute>
            } />
            
            <Route path="/evidence/add" element={
              <ProtectedRoute>
                <EvidenceDetail isNewEvidence={true} />
              </ProtectedRoute>
            } />
            
            <Route path="/evidence/:evidenceId" element={
              <ProtectedRoute>
                <EvidenceDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/suspects" element={
              <ProtectedRoute>
                <SuspectList />
              </ProtectedRoute>
            } />
            
            <Route path="/suspects/add" element={
              <ProtectedRoute>
                <SuspectDetail isNewSuspect={true} />
              </ProtectedRoute>
            } />
            
            <Route path="/suspects/:suspectId" element={
              <ProtectedRoute>
                <SuspectDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/analysis" element={
              <ProtectedRoute>
                <AnalysisList />
              </ProtectedRoute>
            } />
            
            <Route path="/analysis/:reportId" element={
              <ProtectedRoute>
                <AnalysisReport />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="Administrator">
                <AdminPanel />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/add-user" element={
              <ProtectedRoute requiredRole="Administrator">
                <AddUser />
              </ProtectedRoute>
            } />
            
            {/* Advanced Features */}
            <Route path="/external-databases" element={
              <ProtectedRoute>
                <ExternalDatabases />
              </ProtectedRoute>
            } />
            
            <Route path="/document-scanner" element={
              <ProtectedRoute>
                <DocumentScanner />
              </ProtectedRoute>
            } />
            
            <Route path="/map-integration" element={
              <ProtectedRoute>
                <MapIntegration />
              </ProtectedRoute>
            } />
            
            {/* Collaboration Features */}
            <Route path="/cases/:caseId/collaboration" element={
              <ProtectedRoute>
                <CaseCollaboration />
              </ProtectedRoute>
            } />
            
            <Route path="/cases/:caseId/discussions" element={
              <ProtectedRoute>
                <DiscussionBoardWrapper />
              </ProtectedRoute>
            } />
            
            <Route path="/cases/:caseId/discussions/new" element={
              <ProtectedRoute>
                <div className="container-fluid mt-4">
                  <div className="card">
                    <div className="card-header">
                      <h4>Create New Discussion Thread</h4>
                    </div>
                    <div className="card-body">
                      {/* Form would be implemented here in a real component */}
                      <p className="alert alert-info">
                        In a completed implementation, this would be a dedicated page for creating a new discussion thread.
                      </p>
                      <Link to={`/cases/:caseId/collaboration`} className="btn btn-primary">
                        Back to Collaboration
                      </Link>
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/cases/:caseId/tasks" element={
              <ProtectedRoute>
                <TaskTrackerWrapper />
              </ProtectedRoute>
            } />
            
            <Route path="/cases/:caseId/tasks/new" element={
              <ProtectedRoute>
                <div className="container-fluid mt-4">
                  <div className="card">
                    <div className="card-header">
                      <h4>Create New Task</h4>
                    </div>
                    <div className="card-body">
                      <form className="task-form">
                        <div className="mb-3">
                          <label htmlFor="task-title" className="form-label">Task Title</label>
                          <input type="text" className="form-control" id="task-title" placeholder="Enter task title" required />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="task-description" className="form-label">Description</label>
                          <textarea className="form-control" id="task-description" rows={3} placeholder="Enter task description"></textarea>
                        </div>
                        <div className="row mb-3">
                          <div className="col-md-6">
                            <label htmlFor="task-priority" className="form-label">Priority</label>
                            <select className="form-select" id="task-priority">
                              <option value="high">High</option>
                              <option value="medium" selected>Medium</option>
                              <option value="low">Low</option>
                            </select>
                          </div>
                          <div className="col-md-6">
                            <label htmlFor="task-due-date" className="form-label">Due Date</label>
                            <input type="date" className="form-control" id="task-due-date" />
                          </div>
                        </div>
                        <div className="mb-3">
                          <label htmlFor="task-assignee" className="form-label">Assign To</label>
                          <select className="form-select" id="task-assignee">
                            <option value="">Select team member</option>
                            <option value="user1">John Smith</option>
                            <option value="user2">Jane Doe</option>
                            <option value="user3">Mike Johnson</option>
                          </select>
                        </div>
                        <div className="d-flex justify-content-end">
                          <Link to={`/cases/:caseId/tasks`} className="btn btn-secondary me-2">Cancel</Link>
                          <button type="submit" className="btn btn-primary">Create Task</button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/cases/:caseId/team" element={
              <ProtectedRoute>
                <TeamMembersWrapper />
              </ProtectedRoute>
            } />
            
            <Route path="/cases/:caseId/team/add" element={
              <ProtectedRoute>
                <div className="container-fluid mt-4">
                  <div className="card">
                    <div className="card-header">
                      <h4>Add Team Member</h4>
                    </div>
                    <div className="card-body">
                      <form className="team-member-form">
                        <div className="mb-3">
                          <label htmlFor="member-selection" className="form-label">Select User</label>
                          <select className="form-select" id="member-selection" required>
                            <option value="">Select a user to add</option>
                            <option value="user1">Detective Amy Santiago</option>
                            <option value="user2">Officer Jake Peralta</option>
                            <option value="user3">Captain Raymond Holt</option>
                            <option value="user4">Sergeant Terry Jeffords</option>
                          </select>
                        </div>
                        <div className="mb-3">
                          <label htmlFor="member-role" className="form-label">Role</label>
                          <select className="form-select" id="member-role" required>
                            <option value="">Select a role</option>
                            <option value="role1">Lead Investigator</option>
                            <option value="role2">Detective</option>
                            <option value="role3">Forensic Analyst</option>
                            <option value="role4">Evidence Technician</option>
                            <option value="role5">Consultant</option>
                          </select>
                        </div>
                        <div className="mb-3">
                          <label htmlFor="member-permissions" className="form-label">Permissions</label>
                          <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="perm-edit" checked />
                            <label className="form-check-label" htmlFor="perm-edit">Edit case information</label>
                          </div>
                          <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="perm-create" checked />
                            <label className="form-check-label" htmlFor="perm-create">Create/upload evidence</label>
                          </div>
                          <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="perm-delete" />
                            <label className="form-check-label" htmlFor="perm-delete">Delete case items</label>
                          </div>
                          <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="perm-admin" />
                            <label className="form-check-label" htmlFor="perm-admin">Case administration</label>
                          </div>
                        </div>
                        <div className="d-flex justify-content-end">
                          <Link to={`/cases/:caseId/team`} className="btn btn-secondary me-2">Cancel</Link>
                          <button type="submit" className="btn btn-primary">Add Member</button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            } />
            
            {/* Witness Management */}
            <Route path="/witnesses" element={
              <ProtectedRoute>
                <WitnessList />
              </ProtectedRoute>
            } />
            
            <Route path="/witnesses/add" element={
              <ProtectedRoute>
                <WitnessDetail isNewWitness={true} />
              </ProtectedRoute>
            } />
            
            <Route path="/witnesses/:witnessId" element={
              <ProtectedRoute>
                <WitnessDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/witnesses/:witnessId/interview-scheduler" element={
              <ProtectedRoute>
                <WitnessInterviewScheduler />
              </ProtectedRoute>
            } />
            
            <Route path="/witnesses/:witnessId/statement-recording" element={
              <ProtectedRoute>
                <div className="container py-4">
                  <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <h4><FaMicrophone className="me-2" /> Record Witness Statement</h4>
                      <Link to={`/witnesses/:witnessId`} className="btn btn-outline-secondary">
                        <FaArrowLeft className="me-1" /> Back to Witness
                      </Link>
                    </div>
                    <div className="card-body">
                      {/* In a real implementation, this would be directly using the StatementRecording component */}
                      <div className="alert alert-info">
                        Recording interface for witness statements. This standalone page allows for focused recording sessions.
                      </div>
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/witnesses/:witnessId/statement-comparison" element={
              <ProtectedRoute>
                <div className="container py-4">
                  <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <h4><FaBalanceScale className="me-2" /> Statement Comparison</h4>
                      <Link to={`/witnesses/:witnessId`} className="btn btn-outline-secondary">
                        <FaArrowLeft className="me-1" /> Back to Witness
                      </Link>
                    </div>
                    <div className="card-body">
                      {/* In a real implementation, this would be directly using the StatementComparison component */}
                      <div className="alert alert-info">
                        Advanced statement comparison tool to analyze witness statement consistency.
                      </div>
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/witnesses/:witnessId/credibility-assessment" element={
              <ProtectedRoute>
                <div className="container py-4">
                  <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <h4><FaUserShield className="me-2" /> Witness Credibility Assessment</h4>
                      <Link to={`/witnesses/:witnessId`} className="btn btn-outline-secondary">
                        <FaArrowLeft className="me-1" /> Back to Witness
                      </Link>
                    </div>
                    <div className="card-body">
                      {/* In a real implementation, this would be directly using the CredibilityAssessment component */}
                      <div className="alert alert-info">
                        Detailed credibility assessment for the witness, including reliability scoring.
                      </div>
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/witnesses/:witnessId/contact-log" element={
              <ProtectedRoute>
                <div className="container py-4">
                  <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <h4><FaPhone className="me-2" /> Witness Contact Log</h4>
                      <Link to={`/witnesses/:witnessId`} className="btn btn-outline-secondary">
                        <FaArrowLeft className="me-1" /> Back to Witness
                      </Link>
                    </div>
                    <div className="card-body">
                      {/* In a real implementation, this would be directly using the ContactLogger component */}
                      <div className="alert alert-info">
                        Log contact with witness and manage communication history.
                      </div>
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            } />
            
            {/* Redirect all unknown routes to login if not authenticated, otherwise to dashboard */}
            <Route path="*" element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
