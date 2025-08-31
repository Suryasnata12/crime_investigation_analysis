import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaSort, FaFilter, FaCheck, FaHourglass, FaCalendarAlt, FaUserAlt } from 'react-icons/fa';

interface TaskTrackerProps {
  caseId?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  tags: string[];
  attachments: number;
  comments: number;
}

// Helper function to get status color
const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    pending: 'secondary',
    in_progress: 'primary',
    completed: 'success',
    blocked: 'danger'
  };
  return statusColors[status] || 'secondary';
};

// Helper function to get priority color
const getPriorityColor = (priority: string): string => {
  const priorityColors: Record<string, string> = {
    low: 'info',
    medium: 'primary',
    high: 'warning',
    urgent: 'danger'
  };
  return priorityColors[priority] || 'secondary';
};

// Format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

const TaskTracker: React.FC<TaskTrackerProps> = ({ caseId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddingTask, setIsAddingTask] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Load mock data
  useEffect(() => {
    const mockTasks: Task[] = [
      {
        id: 'task-001',
        title: 'Interview witness John Smith again',
        description: 'Follow up on inconsistencies in the initial statement. Focus on timeline between 10PM-11PM.',
        status: 'pending',
        priority: 'high',
        assignedTo: {
          id: 'user-001',
          name: 'Det. Sarah Johnson',
          avatar: 'https://randomuser.me/api/portraits/women/41.jpg',
          role: 'Lead Investigator'
        },
        dueDate: '2025-04-10T00:00:00',
        createdAt: '2025-04-03T15:30:00',
        updatedAt: '2025-04-03T15:30:00',
        tags: ['witness', 'interview', 'follow-up'],
        attachments: 2,
        comments: 3
      },
      {
        id: 'task-002',
        title: 'Analyze fingerprints from crime scene',
        description: 'Process the fingerprints found on the window frame and compare with suspect database.',
        status: 'in_progress',
        priority: 'urgent',
        assignedTo: {
          id: 'user-003',
          name: 'Emily Rodriguez',
          avatar: 'https://randomuser.me/api/portraits/women/43.jpg',
          role: 'Forensic Analyst'
        },
        dueDate: '2025-04-08T00:00:00',
        createdAt: '2025-04-05T09:15:00',
        updatedAt: '2025-04-05T13:22:00',
        tags: ['forensics', 'evidence', 'fingerprints'],
        attachments: 1,
        comments: 2
      },
      {
        id: 'task-003',
        title: 'Review traffic camera footage',
        description: 'Check footage from cameras on Main Street between 10PM-12AM for suspect vehicle.',
        status: 'completed',
        priority: 'medium',
        assignedTo: {
          id: 'user-002',
          name: 'Det. Michael Chen',
          avatar: 'https://randomuser.me/api/portraits/men/42.jpg',
          role: 'Investigator'
        },
        dueDate: '2025-04-04T00:00:00',
        createdAt: '2025-04-02T10:45:00',
        updatedAt: '2025-04-04T16:30:00',
        completedAt: '2025-04-04T16:30:00',
        tags: ['surveillance', 'evidence', 'footage'],
        attachments: 4,
        comments: 5
      },
      {
        id: 'task-004',
        title: 'Contact store owner for security footage',
        description: 'Reach out to the owner of the jewelry store to obtain internal security camera footage.',
        status: 'blocked',
        priority: 'high',
        assignedTo: {
          id: 'user-002',
          name: 'Det. Michael Chen',
          avatar: 'https://randomuser.me/api/portraits/men/42.jpg',
          role: 'Investigator'
        },
        dueDate: '2025-04-06T00:00:00',
        createdAt: '2025-04-03T11:20:00',
        updatedAt: '2025-04-05T14:15:00',
        tags: ['surveillance', 'evidence', 'footage'],
        attachments: 0,
        comments: 2
      },
      {
        id: 'task-005',
        title: 'Prepare case briefing for Captain',
        description: 'Create a comprehensive briefing document summarizing case progress for Captain Wilson.',
        status: 'in_progress',
        priority: 'medium',
        assignedTo: {
          id: 'user-001',
          name: 'Det. Sarah Johnson',
          avatar: 'https://randomuser.me/api/portraits/women/41.jpg',
          role: 'Lead Investigator'
        },
        dueDate: '2025-04-09T00:00:00',
        createdAt: '2025-04-04T09:00:00',
        updatedAt: '2025-04-05T11:45:00',
        tags: ['reporting', 'briefing'],
        attachments: 3,
        comments: 1
      }
    ];

    setTasks(mockTasks);
    setFilteredTasks(mockTasks);
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...tasks];
    
    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(task => task.status === statusFilter);
    }
    
    // Priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(task => task.priority === priorityFilter);
    }
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        task => 
          task.title.toLowerCase().includes(query) || 
          task.description.toLowerCase().includes(query) ||
          task.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    setFilteredTasks(result);
  }, [tasks, statusFilter, priorityFilter, searchQuery]);

  const handleAddTask = () => {
    setIsAddingTask(true);
    setSelectedTask(null);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsAddingTask(false);
  };

  const handleStatusChange = (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed' | 'blocked') => {
    // In a real app, this would be an API call
    alert(`In a real app, this would change task ${taskId} status to ${newStatus}`);
    
    // Update locally for demo
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const updatedTask = { 
          ...task, 
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
        
        if (newStatus === 'completed') {
          updatedTask.completedAt = new Date().toISOString();
        } else {
          delete updatedTask.completedAt;
        }
        
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask(updatedTask);
        }
        
        return updatedTask;
      }
      return task;
    });
    
    setTasks(updatedTasks);
  };

  const handleCloseTaskDetail = () => {
    setSelectedTask(null);
  };

  return (
    <div className="task-tracker">
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">Task Tracker</h2>
            <button className="btn btn-primary" onClick={handleAddTask}>
              <FaPlus className="me-2" /> New Task
            </button>
          </div>
        </div>
      </div>
      
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-8">
          <div className="d-flex justify-content-end">
            <div className="me-3">
              <select 
                className="form-select" 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
            <div>
              <select 
                className="form-select" 
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row">
        <div className={`col-md-${selectedTask || isAddingTask ? '7' : '12'}`}>
          <div className="card">
            <div className="card-header bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Tasks ({filteredTasks.length})</h5>
                <button className="btn btn-sm btn-outline-secondary">
                  <FaSort className="me-1" /> Sort
                </button>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {filteredTasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`list-group-item list-group-item-action ${selectedTask?.id === task.id ? 'active' : ''}`}
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="me-auto">
                        <div className="d-flex align-items-center mb-1">
                          <span className={`badge bg-${getStatusColor(task.status)} me-2`}>
                            {task.status.replace('_', ' ')}
                          </span>
                          <span className={`badge bg-${getPriorityColor(task.priority)} me-2`}>
                            {task.priority}
                          </span>
                          <h6 className="mb-0">{task.title}</h6>
                        </div>
                        <p className="text-muted small mb-1 text-truncate" style={{ maxWidth: '400px' }}>
                          {task.description}
                        </p>
                        <div className="d-flex align-items-center small">
                          <div className="me-3">
                            <FaCalendarAlt className="me-1 text-muted" />
                            <span className={new Date(task.dueDate) < new Date() && task.status !== 'completed' ? 'text-danger' : ''}>
                              {formatDate(task.dueDate)}
                            </span>
                          </div>
                          <div>
                            <FaUserAlt className="me-1 text-muted" />
                            <span>{task.assignedTo.name}</span>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex flex-column align-items-end">
                        <div className="mb-auto">
                          {task.tags.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="badge bg-light text-dark me-1">{tag}</span>
                          ))}
                          {task.tags.length > 2 && <span className="badge bg-light text-dark">+{task.tags.length - 2}</span>}
                        </div>
                        <div className="mt-2 small">
                          {task.attachments > 0 && <span className="me-2"><FaPlus /> {task.attachments}</span>}
                          {task.comments > 0 && <span><FaPlus /> {task.comments}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredTasks.length === 0 && (
                  <div className="list-group-item text-center py-4">
                    <p className="mb-0 text-muted">No tasks found matching your filters</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {(selectedTask || isAddingTask) && (
          <div className="col-md-5">
            <div className="card">
              <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{isAddingTask ? 'New Task' : 'Task Details'}</h5>
                {selectedTask && (
                  <button className="btn btn-sm btn-link" onClick={handleCloseTaskDetail}>
                    Close
                  </button>
                )}
              </div>
              
              {selectedTask ? (
                <div className="card-body">
                  <h5 className="mb-3">{selectedTask.title}</h5>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <div className="mb-2">
                        <label className="form-label fw-bold">Status</label>
                        <select 
                          className="form-select"
                          value={selectedTask.status}
                          onChange={(e) => handleStatusChange(selectedTask.id, e.target.value as any)}
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="blocked">Blocked</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-2">
                        <label className="form-label fw-bold">Priority</label>
                        <div>
                          <span className={`badge bg-${getPriorityColor(selectedTask.priority)}`}>
                            {selectedTask.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label fw-bold">Description</label>
                    <p>{selectedTask.description}</p>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <div className="mb-2">
                        <label className="form-label fw-bold">Assigned To</label>
                        <div className="d-flex align-items-center">
                          <img 
                            src={selectedTask.assignedTo.avatar} 
                            alt={selectedTask.assignedTo.name}
                            className="rounded-circle me-2"
                            width="24"
                            height="24"
                          />
                          <span>{selectedTask.assignedTo.name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-2">
                        <label className="form-label fw-bold">Due Date</label>
                        <div>
                          <FaCalendarAlt className="me-1 text-muted" />
                          <span>{formatDate(selectedTask.dueDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label fw-bold">Tags</label>
                    <div>
                      {selectedTask.tags.map((tag, idx) => (
                        <span key={idx} className="badge bg-light text-dark me-1 mb-1">{tag}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="d-flex justify-content-between mt-4">
                    <div>
                      <span className="text-muted small">Created: {formatDate(selectedTask.createdAt)}</span>
                      <span className="text-muted small ms-3">Updated: {formatDate(selectedTask.updatedAt)}</span>
                    </div>
                    <div>
                      <button className="btn btn-sm btn-outline-primary me-2">
                        <FaEdit className="me-1" /> Edit
                      </button>
                      <button className="btn btn-sm btn-outline-danger">
                        <FaTrash className="me-1" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card-body text-center py-5">
                  <h5>New Task Form</h5>
                  <p className="text-muted">In a real application, this would be a form to create a new task.</p>
                  <button className="btn btn-secondary" onClick={() => setIsAddingTask(false)}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskTracker;
