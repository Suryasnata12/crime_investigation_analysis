import React, { useState, useEffect } from 'react';
import { 
  FaUserEdit, FaPlus, FaTrash, FaCommentAlt, FaClipboardCheck, 
  FaFileUpload, FaUserPlus, FaEye, FaFilter, FaCalendarAlt,
  FaSort, FaSearch, FaSync
} from 'react-icons/fa';

interface ActivityFeedProps {
  caseId?: string;
}

type ActivityType = 'evidence_added' | 'suspect_added' | 'witness_added' | 'note_added' | 
  'evidence_modified' | 'task_created' | 'task_completed' | 'file_uploaded' | 
  'comment_added' | 'team_member_added' | 'report_generated' | 'timeline_event_added';

interface ActivityItem {
  id: string;
  type: ActivityType;
  userId: string;
  userName: string;
  userAvatar: string;
  timestamp: string;
  content: string;
  itemId?: string;
  itemName?: string;
  parentItemId?: string;
  parentItemType?: string;
}

const getActivityIcon = (type: ActivityType) => {
  switch(type) {
    case 'evidence_added':
    case 'suspect_added':
    case 'witness_added':
    case 'note_added':
    case 'timeline_event_added':
      return <FaPlus className="text-success" />;
    case 'evidence_modified':
      return <FaUserEdit className="text-primary" />;
    case 'task_created':
      return <FaClipboardCheck className="text-primary" />;
    case 'task_completed':
      return <FaClipboardCheck className="text-success" />;
    case 'file_uploaded':
      return <FaFileUpload className="text-primary" />;
    case 'comment_added':
      return <FaCommentAlt className="text-info" />;
    case 'team_member_added':
      return <FaUserPlus className="text-success" />;
    case 'report_generated':
      return <FaEye className="text-secondary" />;
    default:
      return <FaUserEdit className="text-secondary" />;
  }
};

const formatTimestamp = (timestamp: string): string => {
  // In a real app, you'd use a proper date formatting library
  const now = new Date('2025-04-05T14:45:50');
  const activityDate = new Date(timestamp);
  
  // Calculate difference in milliseconds
  const diffMs = now.getTime() - activityDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  
  // For older dates, return the formatted date
  return activityDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const ActivityFeed: React.FC<ActivityFeedProps> = ({ caseId }) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [filterTimeframe, setFilterTimeframe] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  
  useEffect(() => {
    // In a real app, this would be an API call
    const fetchActivities = () => {
      setLoading(true);
      
      // Mock data
      const mockActivities: ActivityItem[] = [
        {
          id: 'act-001',
          type: 'evidence_added',
          userId: 'user-001',
          userName: 'Det. Sarah Johnson',
          userAvatar: 'https://randomuser.me/api/portraits/women/41.jpg',
          timestamp: '2025-04-05T14:30:22',
          content: 'Added new evidence',
          itemId: 'ev-2025-042',
          itemName: 'Surveillance Camera Footage'
        },
        {
          id: 'act-002',
          type: 'witness_added',
          userId: 'user-002',
          userName: 'Det. Michael Chen',
          userAvatar: 'https://randomuser.me/api/portraits/men/42.jpg',
          timestamp: '2025-04-05T14:15:10',
          content: 'Added new witness',
          itemId: 'wit-2025-018',
          itemName: 'John Doe'
        },
        {
          id: 'act-003',
          type: 'task_created',
          userId: 'user-001',
          userName: 'Det. Sarah Johnson',
          userAvatar: 'https://randomuser.me/api/portraits/women/41.jpg',
          timestamp: '2025-04-05T13:42:33',
          content: 'Created new task',
          itemId: 'task-078',
          itemName: 'Interview store clerk'
        },
        {
          id: 'act-004',
          type: 'file_uploaded',
          userId: 'user-003',
          userName: 'Emily Rodriguez',
          userAvatar: 'https://randomuser.me/api/portraits/women/43.jpg',
          timestamp: '2025-04-05T13:38:47',
          content: 'Uploaded forensic analysis report',
          itemId: 'file-2025-053',
          itemName: 'DNA_Analysis.pdf'
        },
        {
          id: 'act-005',
          type: 'comment_added',
          userId: 'user-004',
          userName: 'Captain David Wilson',
          userAvatar: 'https://randomuser.me/api/portraits/men/44.jpg',
          timestamp: '2025-04-05T13:12:21',
          content: 'Added comment on evidence',
          itemId: 'comment-129',
          parentItemId: 'ev-2025-039',
          parentItemType: 'evidence',
          itemName: 'Need additional analysis on this item'
        },
        {
          id: 'act-006',
          type: 'team_member_added',
          userId: 'user-001',
          userName: 'Det. Sarah Johnson',
          userAvatar: 'https://randomuser.me/api/portraits/women/41.jpg',
          timestamp: '2025-04-05T11:58:14',
          content: 'Added team member to case',
          itemId: 'user-005',
          itemName: 'Dr. Alicia Martinez'
        },
        {
          id: 'act-007',
          type: 'task_completed',
          userId: 'user-002',
          userName: 'Det. Michael Chen',
          userAvatar: 'https://randomuser.me/api/portraits/men/42.jpg',
          timestamp: '2025-04-05T10:42:05',
          content: 'Completed task',
          itemId: 'task-076',
          itemName: 'Canvass neighborhood for witnesses'
        },
        {
          id: 'act-008',
          type: 'report_generated',
          userId: 'user-001',
          userName: 'Det. Sarah Johnson',
          userAvatar: 'https://randomuser.me/api/portraits/women/41.jpg',
          timestamp: '2025-04-05T09:17:39',
          content: 'Generated progress report',
          itemId: 'report-2025-014',
          itemName: 'Weekly Investigation Status Report'
        },
        {
          id: 'act-009',
          type: 'suspect_added',
          userId: 'user-002',
          userName: 'Det. Michael Chen',
          userAvatar: 'https://randomuser.me/api/portraits/men/42.jpg',
          timestamp: '2025-04-04T16:33:52',
          content: 'Added new suspect',
          itemId: 'sus-2025-027',
          itemName: 'Jane Smith'
        },
        {
          id: 'act-010',
          type: 'timeline_event_added',
          userId: 'user-001',
          userName: 'Det. Sarah Johnson',
          userAvatar: 'https://randomuser.me/api/portraits/women/41.jpg',
          timestamp: '2025-04-04T15:21:18',
          content: 'Added timeline event',
          itemId: 'timeline-087',
          itemName: 'Suspect seen leaving scene'
        }
      ];
      
      setActivities(mockActivities);
      setLoading(false);
    };
    
    fetchActivities();
    
    // Set up auto-refresh interval if enabled
    let refreshInterval: NodeJS.Timeout | null = null;
    
    if (autoRefresh) {
      refreshInterval = setInterval(() => {
        fetchActivities();
      }, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [caseId, autoRefresh]);
  
  // Apply filters and search whenever dependencies change
  useEffect(() => {
    let filtered = [...activities];
    
    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(activity => activity.type === filterType);
    }
    
    // Filter by user
    if (filterUser !== 'all') {
      filtered = filtered.filter(activity => activity.userId === filterUser);
    }
    
    // Filter by timeframe
    if (filterTimeframe !== 'all') {
      const now = new Date('2025-04-05T14:45:50');
      
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.timestamp);
        const diffMs = now.getTime() - activityDate.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        
        switch(filterTimeframe) {
          case 'today':
            return diffHours < 24;
          case 'yesterday':
            return diffHours >= 24 && diffHours < 48;
          case 'week':
            return diffHours < 24 * 7;
          default:
            return true;
        }
      });
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(activity => 
        activity.content.toLowerCase().includes(query) ||
        activity.userName.toLowerCase().includes(query) ||
        (activity.itemName && activity.itemName.toLowerCase().includes(query))
      );
    }
    
    // Apply sort order
    filtered.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredActivities(filtered);
  }, [activities, filterType, filterUser, filterTimeframe, searchQuery, sortOrder]);
  
  const getUserOptions = () => {
    // Get unique users from activities
    const users = Array.from(new Set(activities.map(activity => activity.userId)))
      .map(userId => {
        const activity = activities.find(a => a.userId === userId);
        return {
          id: userId,
          name: activity ? activity.userName : 'Unknown'
        };
      });
    
    return users;
  };
  
  const getActivityTypeOptions = () => {
    // Get unique activity types and format them for display
    const types = Array.from(new Set(activities.map(activity => activity.type)));
    return types.map(type => ({
      value: type,
      label: type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }));
  };
  
  const handleRefresh = () => {
    // In a real app, this would call the API again
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };
  
  return (
    <div className="activity-feed-container p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="mb-1">Activity Feed</h5>
          <p className="text-muted mb-0">
            {filteredActivities.length} activities found
          </p>
        </div>
        <div className="d-flex align-items-center">
          <div className="form-check form-switch me-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="autoRefreshToggle"
              checked={autoRefresh}
              onChange={() => setAutoRefresh(!autoRefresh)}
            />
            <label className="form-check-label" htmlFor="autoRefreshToggle">
              Auto-refresh
            </label>
          </div>
          <button 
            className="btn btn-outline" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <FaSync className={`me-2 ${loading ? 'fa-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>
      
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="input-group">
            <span className="input-group-text bg-transparent">
              <FaSearch />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search activities..."
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
        <div className="col-md-4">
          <div className="d-flex">
            <button 
              className="btn btn-outline dropdown-toggle w-100"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <FaFilter className="me-2" /> Filters
            </button>
            <div className="dropdown-menu p-3" style={{ width: '300px' }}>
              <h6 className="dropdown-header">Filter Activities</h6>
              
              <div className="mb-3">
                <label className="form-label">Activity Type</label>
                <select 
                  className="form-select"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  {getActivityTypeOptions().map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Team Member</label>
                <select 
                  className="form-select"
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                >
                  <option value="all">All Team Members</option>
                  {getUserOptions().map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Time Period</label>
                <select 
                  className="form-select"
                  value={filterTimeframe}
                  onChange={(e) => setFilterTimeframe(e.target.value)}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="week">Last 7 Days</option>
                </select>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Sort Order</label>
                <div className="btn-group w-100">
                  <button 
                    type="button" 
                    className={`btn ${sortOrder === 'newest' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setSortOrder('newest')}
                  >
                    Newest First
                  </button>
                  <button 
                    type="button" 
                    className={`btn ${sortOrder === 'oldest' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setSortOrder('oldest')}
                  >
                    Oldest First
                  </button>
                </div>
              </div>
              
              <div className="d-flex justify-content-between">
                <button 
                  className="btn btn-outline" 
                  onClick={() => {
                    setFilterType('all');
                    setFilterUser('all');
                    setFilterTimeframe('all');
                    setSearchQuery('');
                    setSortOrder('newest');
                  }}
                >
                  Reset Filters
                </button>
                <button 
                  className="btn btn-primary"
                  data-bs-dismiss="dropdown"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading activity feed...</p>
        </div>
      ) : filteredActivities.length > 0 ? (
        <div className="card">
          <div className="list-group list-group-flush activity-list">
            {filteredActivities.map(activity => (
              <div key={activity.id} className="list-group-item p-3">
                <div className="d-flex">
                  <div className="activity-icon me-3">
                    <div className="rounded-circle p-2 bg-light d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                      {getActivityIcon(activity.type)}
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <div>
                        <span className="fw-bold">{activity.userName}</span>
                        <span className="text-muted mx-1">•</span>
                        <span className="activity-type">
                          {activity.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                      </div>
                      <div className="text-muted small">
                        <span title={new Date(activity.timestamp).toLocaleString()}>
                          {formatTimestamp(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                    <div className="mb-1">
                      {activity.content}: <strong>{activity.itemName}</strong>
                    </div>
                    {activity.parentItemId && (
                      <div className="small text-muted">
                        on {activity.parentItemType}: #{activity.parentItemId}
                      </div>
                    )}
                    <div className="mt-2">
                      <button className="btn btn-sm btn-link p-0">View Details</button>
                    </div>
                  </div>
                  <div>
                    <img 
                      src={activity.userAvatar} 
                      alt={activity.userName} 
                      className="rounded-circle"
                      width="32"
                      height="32"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="card-footer text-center">
            <button className="btn btn-link">Load More Activities</button>
          </div>
        </div>
      ) : (
        <div className="alert alert-info">
          <div className="text-center py-4">
            <FaCalendarAlt style={{ fontSize: '2rem', opacity: 0.5 }} className="mb-3" />
            <h5>No Activities Found</h5>
            <p>No activities match your current filters. Try changing your search criteria or clear filters.</p>
            <button 
              className="btn btn-outline mt-2"
              onClick={() => {
                setFilterType('all');
                setFilterUser('all');
                setFilterTimeframe('all');
                setSearchQuery('');
              }}
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
