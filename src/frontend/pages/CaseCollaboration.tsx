import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaUserFriends, FaClipboardList, FaComment, FaHistory, FaPlus, FaCog } from 'react-icons/fa';

// Import sub-components
import TeamMembers from '../components/collaboration/TeamMembers';
import ActivityFeed from '../components/collaboration/ActivityFeed';
import DiscussionBoard from '../components/collaboration/DiscussionBoard';
import TaskTracker from '../components/collaboration/TaskTracker';

type TabType = 'team' | 'tasks' | 'discussions' | 'activity';

// Mock case data
const MOCK_CASE = {
  id: 'case-2025-001',
  title: 'Downtown Robbery Investigation',
  status: 'active',
  priority: 'high',
  dateCreated: '2025-03-15',
  lastUpdated: '2025-04-05',
  leadInvestigator: {
    id: 'user-001',
    name: 'Detective Sarah Johnson',
    badge: 'SFPD-7281',
    avatar: 'https://randomuser.me/api/portraits/women/41.jpg'
  }
};

const CaseCollaboration: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('team');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Mock function to get case details - in a real app, this would fetch from an API
  const getCaseDetails = () => {
    return MOCK_CASE;
  };

  const caseDetails = getCaseDetails();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'team':
        return <TeamMembers caseId={caseId} />;
      case 'tasks':
        return <TaskTracker caseId={caseId} />;
      case 'discussions':
        return <DiscussionBoard caseId={caseId} />;
      case 'activity':
        return <ActivityFeed caseId={caseId} />;
      default:
        return <TeamMembers caseId={caseId} />;
    }
  };

  return (
    <div className="container-fluid px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-1">Case Collaboration</h1>
          <p className="text-muted mb-0">
            <Link to={`/cases/${caseId}`}>{caseDetails.title}</Link> | Lead: {caseDetails.leadInvestigator.name}
          </p>
        </div>
        <div className="d-flex">
          <button className="btn btn-outline me-2" onClick={() => setIsSettingsOpen(!isSettingsOpen)}>
            <FaCog className="me-2" /> Collaboration Settings
          </button>
          <Link to={`/cases/${caseId}`} className="btn btn-outline">
            Back to Case
          </Link>
        </div>
      </div>

      {isSettingsOpen && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Collaboration Settings</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <h6>Notification Preferences</h6>
                <div className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" id="notifyNewTask" defaultChecked />
                  <label className="form-check-label" htmlFor="notifyNewTask">
                    Notify when new tasks are assigned to me
                  </label>
                </div>
                <div className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" id="notifyComments" defaultChecked />
                  <label className="form-check-label" htmlFor="notifyComments">
                    Notify when I'm mentioned in comments
                  </label>
                </div>
                <div className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" id="notifyUpdates" defaultChecked />
                  <label className="form-check-label" htmlFor="notifyUpdates">
                    Notify on case updates
                  </label>
                </div>
              </div>
              <div className="col-md-6">
                <h6>Display Preferences</h6>
                <div className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" id="showPresence" defaultChecked />
                  <label className="form-check-label" htmlFor="showPresence">
                    Show my online presence to team
                  </label>
                </div>
                <div className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" id="compactView" />
                  <label className="form-check-label" htmlFor="compactView">
                    Use compact view for task board
                  </label>
                </div>
                <div className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" id="autoRefresh" defaultChecked />
                  <label className="form-check-label" htmlFor="autoRefresh">
                    Auto-refresh activity feed
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-3 text-end">
              <button className="btn btn-outline me-2" onClick={() => setIsSettingsOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={() => setIsSettingsOpen(false)}>
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header p-0">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'team' ? 'active' : ''}`}
                onClick={() => setActiveTab('team')}
              >
                <FaUserFriends className="me-2" /> Team Members
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'tasks' ? 'active' : ''}`}
                onClick={() => setActiveTab('tasks')}
              >
                <FaClipboardList className="me-2" /> Tasks
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'discussions' ? 'active' : ''}`}
                onClick={() => setActiveTab('discussions')}
              >
                <FaComment className="me-2" /> Discussions
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'activity' ? 'active' : ''}`}
                onClick={() => setActiveTab('activity')}
              >
                <FaHistory className="me-2" /> Activity
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body p-0">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default CaseCollaboration;
