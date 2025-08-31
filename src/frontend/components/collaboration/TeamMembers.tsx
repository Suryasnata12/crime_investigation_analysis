import React, { useState, useEffect } from 'react';
import { FaPlus, FaUserShield, FaUserCog, FaUserAlt, FaEllipsisH, FaEnvelope, FaPhone, FaCircle, FaUserFriends } from 'react-icons/fa';

interface TeamMemberProps {
  caseId?: string;
}

type TeamMember = {
  id: string;
  name: string;
  role: 'lead_investigator' | 'investigator' | 'forensic_analyst' | 'supervisor' | 'consultant';
  avatar: string;
  department: string;
  badge: string;
  email: string;
  phone: string;
  status: 'online' | 'away' | 'offline' | 'busy';
  lastActive: string;
  assignedTasks: number;
  completedTasks: number;
};

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'lead_investigator':
      return <FaUserShield className="text-primary" title="Lead Investigator" />;
    case 'supervisor':
      return <FaUserCog className="text-success" title="Supervisor" />;
    default:
      return <FaUserAlt className="text-secondary" title={role.replace('_', ' ')} />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online':
      return 'text-success';
    case 'away':
      return 'text-warning';
    case 'busy':
      return 'text-danger';
    default:
      return 'text-secondary';
  }
};

const TeamMembers: React.FC<TeamMemberProps> = ({ caseId }) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  useEffect(() => {
    // In a real app, this would be an API call based on the caseId
    const fetchTeamMembers = () => {
      // Mock data
      const mockTeamMembers: TeamMember[] = [
        {
          id: 'user-001',
          name: 'Det. Sarah Johnson',
          role: 'lead_investigator',
          avatar: 'https://randomuser.me/api/portraits/women/41.jpg',
          department: 'Homicide Division',
          badge: 'SFPD-7281',
          email: 'sarah.johnson@sfpd.example.gov',
          phone: '(555) 123-4567',
          status: 'online',
          lastActive: '2025-04-05 14:30:22',
          assignedTasks: 7,
          completedTasks: 3
        },
        {
          id: 'user-002',
          name: 'Det. Michael Chen',
          role: 'investigator',
          avatar: 'https://randomuser.me/api/portraits/men/42.jpg',
          department: 'Robbery Division',
          badge: 'SFPD-6392',
          email: 'michael.chen@sfpd.example.gov',
          phone: '(555) 234-5678',
          status: 'online',
          lastActive: '2025-04-05 14:28:15',
          assignedTasks: 5,
          completedTasks: 2
        },
        {
          id: 'user-003',
          name: 'Emily Rodriguez',
          role: 'forensic_analyst',
          avatar: 'https://randomuser.me/api/portraits/women/43.jpg',
          department: 'Forensics Lab',
          badge: 'FL-3481',
          email: 'emily.rodriguez@forensics.example.gov',
          phone: '(555) 345-6789',
          status: 'away',
          lastActive: '2025-04-05 13:45:33',
          assignedTasks: 3,
          completedTasks: 1
        },
        {
          id: 'user-004',
          name: 'Captain David Wilson',
          role: 'supervisor',
          avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
          department: 'Major Crimes Unit',
          badge: 'SFPD-4513',
          email: 'david.wilson@sfpd.example.gov',
          phone: '(555) 456-7890',
          status: 'busy',
          lastActive: '2025-04-05 14:05:41',
          assignedTasks: 0,
          completedTasks: 0
        },
        {
          id: 'user-005',
          name: 'Dr. Alicia Martinez',
          role: 'consultant',
          avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
          department: 'Behavioral Analysis',
          badge: 'CONSULT-098',
          email: 'alicia.martinez@fbi.example.gov',
          phone: '(555) 567-8901',
          status: 'offline',
          lastActive: '2025-04-04 18:22:10',
          assignedTasks: 2,
          completedTasks: 2
        }
      ];
      
      setTeamMembers(mockTeamMembers);
    };
    
    fetchTeamMembers();
  }, [caseId]);

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.badge.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const openMemberDetails = (member: TeamMember) => {
    setSelectedMember(member);
  };

  return (
    <div className="team-members-container p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="mb-1">Team Members</h5>
          <p className="text-muted mb-0">
            {teamMembers.length} members assigned to this case
          </p>
        </div>
        <div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddMemberForm(true)}
          >
            <FaPlus className="me-2" /> Add Team Member
          </button>
        </div>
      </div>
      
      <div className="row mb-4">
        <div className="col-md-7">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search members by name, badge, or department..."
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
        <div className="col-md-5">
          <select
            className="form-select"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="lead_investigator">Lead Investigators</option>
            <option value="investigator">Investigators</option>
            <option value="forensic_analyst">Forensic Analysts</option>
            <option value="supervisor">Supervisors</option>
            <option value="consultant">Consultants</option>
          </select>
        </div>
      </div>
      
      {showAddMemberForm && (
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Add Team Member</h5>
            <button 
              className="btn-close" 
              onClick={() => setShowAddMemberForm(false)}
              aria-label="Close"
            ></button>
          </div>
          <div className="card-body">
            <form onSubmit={(e) => {
              e.preventDefault();
              // In a real app, this would submit the form data
              alert('In a real app, this would add a new team member.');
              setShowAddMemberForm(false);
            }}>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="memberSelect" className="form-label">Select User</label>
                    <select className="form-select" id="memberSelect">
                      <option value="">Select a user to add...</option>
                      <option value="user-006">Ofc. James Thompson (SFPD-9821)</option>
                      <option value="user-007">Dr. Leila Khan (FL-7842)</option>
                      <option value="user-008">Det. Robert Miller (SFPD-5631)</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="roleSelect" className="form-label">Role on Case</label>
                    <select className="form-select" id="roleSelect">
                      <option value="investigator">Investigator</option>
                      <option value="forensic_analyst">Forensic Analyst</option>
                      <option value="consultant">Consultant</option>
                      <option value="supervisor">Supervisor</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <label htmlFor="accessLevel" className="form-label">Access Level</label>
                <select className="form-select" id="accessLevel">
                  <option value="full">Full Access</option>
                  <option value="read_write">Read & Write</option>
                  <option value="read_only">Read Only</option>
                </select>
                <small className="form-text text-muted">
                  Determines what actions the member can perform on this case.
                </small>
              </div>
              
              <div className="mb-3">
                <label htmlFor="notifyUser" className="form-check">
                  <input className="form-check-input" type="checkbox" id="notifyUser" defaultChecked />
                  <span className="form-check-label">Notify user about this assignment</span>
                </label>
              </div>
              
              <div className="d-flex justify-content-end">
                <button 
                  type="button" 
                  className="btn btn-outline me-2"
                  onClick={() => setShowAddMemberForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add to Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="row">
        <div className="col-lg-8">
          <div className="team-list">
            {filteredMembers.length > 0 ? (
              <div className="card">
                <div className="list-group list-group-flush">
                  {filteredMembers.map(member => (
                    <div 
                      key={member.id} 
                      className="list-group-item d-flex align-items-center"
                      style={{ cursor: 'pointer' }}
                      onClick={() => openMemberDetails(member)}
                    >
                      <div className="position-relative me-3">
                        <img 
                          src={member.avatar} 
                          alt={member.name} 
                          className="rounded-circle"
                          width="50"
                          height="50"
                        />
                        <span 
                          className={`position-absolute bottom-0 end-0 p-1 bg-light rounded-circle ${getStatusColor(member.status)}`}
                          style={{ width: '14px', height: '14px', border: '2px solid white' }}
                        >
                          <FaCircle size={10} />
                        </span>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-1">
                          <h6 className="mb-0 me-2">{member.name}</h6>
                          <span className="me-2">{getRoleIcon(member.role)}</span>
                          <small className="badge badge-light">{member.badge}</small>
                        </div>
                        <div className="text-muted small">{member.department}</div>
                      </div>
                      <div className="text-end">
                        <div className="small mb-1">
                          Tasks: {member.completedTasks}/{member.assignedTasks}
                        </div>
                        <div className="task-progress">
                          <div 
                            className="progress" 
                            style={{ height: '6px' }}
                          >
                            <div 
                              className="progress-bar" 
                              role="progressbar" 
                              style={{ 
                                width: member.assignedTasks > 0 
                                  ? `${(member.completedTasks / member.assignedTasks) * 100}%` 
                                  : '0%' 
                              }}
                              aria-valuenow={
                                member.assignedTasks > 0 
                                  ? (member.completedTasks / member.assignedTasks) * 100 
                                  : 0
                              }
                              aria-valuemin={0}
                              aria-valuemax={100}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="alert alert-info">
                No team members found matching your search criteria.
              </div>
            )}
          </div>
        </div>
        
        <div className="col-lg-4">
          {selectedMember ? (
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Member Details</h5>
                <button
                  className="btn-close"
                  onClick={() => setSelectedMember(null)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="card-body">
                <div className="text-center mb-3">
                  <img 
                    src={selectedMember.avatar} 
                    alt={selectedMember.name} 
                    className="rounded-circle img-thumbnail"
                    width="100"
                    height="100"
                  />
                  <h5 className="mt-2 mb-0">{selectedMember.name}</h5>
                  <div className="d-flex justify-content-center align-items-center">
                    <span className="badge badge-light me-2 mt-1">
                      {selectedMember.badge}
                    </span>
                    <span className={`mt-1 ${getStatusColor(selectedMember.status)}`}>
                      <FaCircle size={10} className="me-1" />
                      {selectedMember.status.charAt(0).toUpperCase() + selectedMember.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="text-muted mb-1">Role</div>
                  <div className="d-flex align-items-center">
                    {getRoleIcon(selectedMember.role)}
                    <span className="ms-2">
                      {selectedMember.role.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </span>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="text-muted mb-1">Department</div>
                  <div>{selectedMember.department}</div>
                </div>
                
                <div className="mb-3">
                  <div className="text-muted mb-1">Contact Information</div>
                  <div className="d-flex align-items-center mb-1">
                    <FaEnvelope className="me-2 text-muted" />
                    <a href={`mailto:${selectedMember.email}`}>{selectedMember.email}</a>
                  </div>
                  <div className="d-flex align-items-center">
                    <FaPhone className="me-2 text-muted" />
                    <a href={`tel:${selectedMember.phone}`}>{selectedMember.phone}</a>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="text-muted mb-1">Activity Status</div>
                  <div>Last active: {selectedMember.lastActive}</div>
                </div>
                
                <div className="mb-3">
                  <div className="text-muted mb-1">Task Progress</div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Completed</span>
                    <span>{selectedMember.completedTasks} of {selectedMember.assignedTasks}</span>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div 
                      className="progress-bar" 
                      role="progressbar" 
                      style={{ 
                        width: selectedMember.assignedTasks > 0 
                          ? `${(selectedMember.completedTasks / selectedMember.assignedTasks) * 100}%` 
                          : '0%' 
                      }}
                      aria-valuenow={
                        selectedMember.assignedTasks > 0 
                          ? (selectedMember.completedTasks / selectedMember.assignedTasks) * 100 
                          : 0
                      }
                      aria-valuemin={0}
                      aria-valuemax={100}
                    ></div>
                  </div>
                </div>
                
                <div className="d-grid gap-2">
                  <button className="btn btn-outline-primary">
                    Message Team Member
                  </button>
                  <button className="btn btn-outline">
                    View Assigned Tasks
                  </button>
                  <button className="btn btn-outline">
                    View Activity Log
                  </button>
                </div>
              </div>
              <div className="card-footer">
                <div className="dropdown">
                  <button 
                    className="btn btn-outline dropdown-toggle w-100" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                  >
                    <FaEllipsisH className="me-2" /> Member Actions
                  </button>
                  <ul className="dropdown-menu">
                    <li><button className="dropdown-item">Change Role</button></li>
                    <li><button className="dropdown-item">Change Access Level</button></li>
                    <li><button className="dropdown-item">Assign New Tasks</button></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item text-danger">Remove from Case</button></li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body text-center py-5">
                <FaUserFriends className="mb-3" style={{ fontSize: '3rem', opacity: 0.5 }} />
                <h5>Team Member Details</h5>
                <p className="text-muted">Select a team member to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamMembers;
