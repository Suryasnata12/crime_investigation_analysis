import React, { useState, useEffect } from 'react';
import { FaPlus, FaComment, FaTag, FaEllipsisH, FaPaperclip, FaAt, FaReply, FaEye } from 'react-icons/fa';
import { Link } from 'react-router-dom';

interface DiscussionBoardProps {
  caseId?: string;
}

type ThreadCategory = 'general' | 'evidence' | 'witness' | 'suspect' | 'timeline' | 'task';

interface User {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

interface Mention {
  id: string;
  userId: string;
  userName: string;
  startPosition: number;
  endPosition: number;
}

interface ThreadComment {
  id: string;
  content: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  parentCommentId?: string;
  attachments: Attachment[];
  mentions: Mention[];
  replies: ThreadComment[];
}

interface Thread {
  id: string;
  title: string;
  content: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
  category: ThreadCategory;
  referenceId?: string;
  isSticky: boolean;
  isPinned: boolean;
  viewCount: number;
  comments: ThreadComment[];
}

// Mock users for mentions
const MOCK_USERS: User[] = [
  { id: 'user-001', name: 'Det. Sarah Johnson', avatar: 'https://randomuser.me/api/portraits/women/41.jpg', role: 'Lead Investigator' },
  { id: 'user-002', name: 'Det. Michael Chen', avatar: 'https://randomuser.me/api/portraits/men/42.jpg', role: 'Investigator' },
  { id: 'user-003', name: 'Emily Rodriguez', avatar: 'https://randomuser.me/api/portraits/women/43.jpg', role: 'Forensic Analyst' },
  { id: 'user-004', name: 'Captain David Wilson', avatar: 'https://randomuser.me/api/portraits/men/44.jpg', role: 'Supervisor' },
  { id: 'user-005', name: 'Dr. Alicia Martinez', avatar: 'https://randomuser.me/api/portraits/women/45.jpg', role: 'Consultant' },
];

// Helper function to get category color
const getCategoryColor = (category: ThreadCategory): string => {
  const categoryColors: Record<ThreadCategory, string> = {
    general: 'primary',
    evidence: 'success',
    witness: 'info',
    suspect: 'danger',
    timeline: 'warning',
    task: 'secondary'
  };
  return categoryColors[category] || 'primary';
};

// Format timestamp
const formatTimestamp = (timestamp: string): string => {
  const now = new Date('2025-04-05T14:57:47');
  const commentDate = new Date(timestamp);
  
  const diffMs = now.getTime() - commentDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  
  return commentDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  });
};

// Comment component
const Comment: React.FC<{ 
  comment: ThreadComment; 
  depth?: number;
  onReply: (commentId: string) => void;
}> = ({ comment, depth = 0, onReply }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const maxDepth = 3; // Maximum nesting level
  
  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim()) {
      // In a real app, this would submit to an API
      alert(`In a real app, this would submit a reply to comment ${comment.id}`);
      setReplyText('');
      setShowReplyForm(false);
    }
  };
  
  // Format mentions in text
  const formatContent = (content: string, mentions: Mention[]): JSX.Element => {
    if (!mentions || mentions.length === 0) {
      return <span>{content}</span>;
    }
    
    // Sort mentions by position
    const sortedMentions = [...mentions].sort((a, b) => a.startPosition - b.startPosition);
    
    const parts: JSX.Element[] = [];
    let lastIndex = 0;
    
    sortedMentions.forEach((mention, index) => {
      if (mention.startPosition > lastIndex) {
        parts.push(<span key={`text-${index}`}>{content.substring(lastIndex, mention.startPosition)}</span>);
      }
      
      parts.push(
        <span key={`mention-${mention.id}`} className="badge badge-light bg-primary bg-opacity-10 text-primary">
          @{mention.userName}
        </span>
      );
      
      lastIndex = mention.endPosition;
    });
    
    if (lastIndex < content.length) {
      parts.push(<span key="text-last">{content.substring(lastIndex)}</span>);
    }
    
    return <>{parts}</>;
  };
  
  return (
    <div className="comment mb-3" style={{ marginLeft: `${depth * 20}px` }}>
      <div className="d-flex">
        <div className="me-3">
          <img 
            src={comment.createdBy.avatar} 
            alt={comment.createdBy.name} 
            className="rounded-circle"
            width="40"
            height="40"
          />
        </div>
        <div className="flex-grow-1">
          <div className="card">
            <div className="card-header bg-light d-flex justify-content-between align-items-center py-2">
              <div>
                <span className="fw-bold">{comment.createdBy.name}</span>
                <span className="text-muted ms-2 small">
                  {formatTimestamp(comment.createdAt)}
                  {comment.isEdited && <span className="ms-1">(edited)</span>}
                </span>
              </div>
              <div>
                <button className="btn btn-sm btn-link p-0" title="More options">
                  <FaEllipsisH />
                </button>
              </div>
            </div>
            <div className="card-body py-2">
              <div className="comment-content">
                {formatContent(comment.content, comment.mentions)}
              </div>
              
              {comment.attachments && comment.attachments.length > 0 && (
                <div className="comment-attachments mt-2">
                  <div className="d-flex flex-wrap">
                    {comment.attachments.map(attachment => (
                      <div key={attachment.id} className="attachment me-2 mb-2">
                        <a href={attachment.url} className="btn btn-sm btn-outline-secondary">
                          <FaPaperclip className="me-1" />
                          {attachment.name}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="card-footer bg-white py-1">
              <button 
                className="btn btn-sm btn-link text-muted"
                onClick={() => {
                  if (depth < maxDepth) {
                    setShowReplyForm(!showReplyForm);
                  } else {
                    onReply(comment.id);
                  }
                }}
              >
                <FaReply className="me-1" />
                Reply
              </button>
            </div>
          </div>
          
          {showReplyForm && (
            <div className="reply-form mt-2">
              <form onSubmit={handleSubmitReply}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={!replyText.trim()}
                  >
                    Reply
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {comment.replies && comment.replies.length > 0 && depth < maxDepth && (
            <div className="replies mt-2">
              {comment.replies.map(reply => (
                <Comment 
                  key={reply.id} 
                  comment={reply} 
                  depth={depth + 1}
                  onReply={onReply}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Thread component
const ThreadItem: React.FC<{ thread: Thread, onView: (id: string) => void }> = ({ thread, onView }) => {
  return (
    <div className="thread-item card mb-3" onClick={() => onView(thread.id)}>
      <div className="card-body">
        <div className="d-flex align-items-start">
          <div className="me-3">
            <img 
              src={thread.createdBy.avatar} 
              alt={thread.createdBy.name} 
              className="rounded-circle"
              width="40"
              height="40"
            />
          </div>
          <div className="flex-grow-1">
            <div className="d-flex justify-content-between align-items-start mb-1">
              <h5 className="mb-0">{thread.title}</h5>
              <span className={`badge bg-${getCategoryColor(thread.category)}`}>
                {thread.category}
              </span>
            </div>
            <div className="text-muted mb-2">
              <span>{thread.createdBy.name}</span>
              <span className="mx-1">•</span>
              <span>{formatTimestamp(thread.createdAt)}</span>
            </div>
            <div className="thread-preview mb-2">
              {thread.content.length > 150 
                ? `${thread.content.substring(0, 150)}...` 
                : thread.content
              }
            </div>
            <div className="d-flex align-items-center text-muted">
              <FaComment className="me-1" />
              <span className="me-3">{thread.comments.length} comments</span>
              <FaEye className="me-1" />
              <span>{thread.viewCount} views</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Thread Detail component
const ThreadDetail: React.FC<{ 
  thread: Thread; 
  onBack: () => void;
  onAddComment: (threadId: string, content: string) => void;
}> = ({ thread, onBack, onAddComment }) => {
  const [commentText, setCommentText] = useState('');
  const [mentionSearch, setMentionSearch] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCommentText(text);
    
    // Check for @ symbol to trigger mentions
    const lastAtSymbol = text.lastIndexOf('@', e.target.selectionStart);
    if (lastAtSymbol !== -1 && (lastAtSymbol === 0 || text[lastAtSymbol - 1] === ' ')) {
      const searchText = text.substring(lastAtSymbol + 1, e.target.selectionStart);
      setMentionSearch(searchText);
      setShowMentions(true);
      setCursorPosition(e.target.selectionStart);
    } else {
      setShowMentions(false);
    }
  };
  
  const insertMention = (user: User) => {
    const beforeMention = commentText.substring(0, commentText.lastIndexOf('@', cursorPosition));
    const afterMention = commentText.substring(cursorPosition);
    setCommentText(`${beforeMention}@${user.name} ${afterMention}`);
    setShowMentions(false);
  };
  
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onAddComment(thread.id, commentText);
      setCommentText('');
    }
  };
  
  // Filter users for mention dropdown
  const filteredUsers = MOCK_USERS.filter(user => 
    user.name.toLowerCase().includes(mentionSearch.toLowerCase())
  );
  
  return (
    <div className="thread-detail">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-outline" onClick={onBack}>
          Back to Discussions
        </button>
        <span className={`badge bg-${getCategoryColor(thread.category)}`}>
          {thread.category}
        </span>
      </div>
      
      <div className="card mb-4">
        <div className="card-header">
          <div className="d-flex align-items-center">
            <img 
              src={thread.createdBy.avatar} 
              alt={thread.createdBy.name} 
              className="rounded-circle me-2"
              width="30"
              height="30"
            />
            <div>
              <span className="fw-bold">{thread.createdBy.name}</span>
              <span className="text-muted ms-2 small">
                {formatTimestamp(thread.createdAt)}
              </span>
            </div>
          </div>
        </div>
        <div className="card-body">
          <h4 className="card-title">{thread.title}</h4>
          <div className="thread-content mb-3">
            {thread.content}
          </div>
        </div>
      </div>
      
      <div className="comments-section">
        <h5 className="mb-3">Comments ({thread.comments.length})</h5>
        
        <div className="add-comment mb-4">
          <form onSubmit={handleSubmitComment}>
            <div className="form-group position-relative">
              <textarea
                className="form-control"
                placeholder="Write a comment... Use @ to mention team members"
                rows={3}
                value={commentText}
                onChange={handleCommentChange}
              ></textarea>
              
              {showMentions && filteredUsers.length > 0 && (
                <div className="mention-dropdown position-absolute bg-white shadow rounded p-2" 
                     style={{ zIndex: 1000, width: '250px' }}>
                  {filteredUsers.map(user => (
                    <div 
                      key={user.id} 
                      className="mention-item p-2 d-flex align-items-center"
                      onClick={() => insertMention(user)}
                      style={{ cursor: 'pointer' }}
                    >
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="rounded-circle me-2"
                        width="24"
                        height="24"
                      />
                      <div>
                        <div>{user.name}</div>
                        <small className="text-muted">{user.role}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="d-flex justify-content-between align-items-center mt-2">
              <div>
                <button type="button" className="btn btn-link text-muted" title="Add attachment">
                  <FaPaperclip />
                </button>
                <button type="button" className="btn btn-link text-muted" title="Mention someone">
                  <FaAt />
                </button>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={!commentText.trim()}
              >
                Post Comment
              </button>
            </div>
          </form>
        </div>
        
        <div className="comments-list">
          {thread.comments.map(comment => (
            <Comment 
              key={comment.id} 
              comment={comment}
              onReply={(commentId) => {
                // Handle deep reply (exceeded max depth)
                alert(`In a real app, this would open a reply form for comment ${commentId}`);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const DiscussionBoard: React.FC<DiscussionBoardProps> = ({ caseId }) => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    // In a real app, this would be an API call based on the caseId
    const fetchThreads = () => {
      setLoading(true);
      
      // Mock data
      setTimeout(() => {
        const mockThreads: Thread[] = [
          {
            id: 'thread-001',
            title: 'Key Evidence Found at Crime Scene',
            content: 'I found something interesting at the scene that we might have missed initially. There are partial fingerprints on the window frame that appear to have been overlooked. I\'ve requested additional analysis from the lab. Has anyone else noticed anything unusual about the entry point?',
            createdBy: {
              id: 'user-001',
              name: 'Det. Sarah Johnson',
              avatar: 'https://randomuser.me/api/portraits/women/41.jpg',
              role: 'Lead Investigator'
            },
            createdAt: '2025-04-05T13:30:22',
            updatedAt: '2025-04-05T13:30:22',
            category: 'evidence',
            referenceId: 'ev-2025-042',
            isSticky: true,
            isPinned: false,
            viewCount: 15,
            comments: [
              {
                id: 'comment-001',
                content: 'Great find, Sarah! I\'ll check with the forensics team to see if they can expedite analysis on these prints.',
                createdBy: {
                  id: 'user-004',
                  name: 'Captain David Wilson',
                  avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
                  role: 'Supervisor'
                },
                createdAt: '2025-04-05T13:45:37',
                updatedAt: '2025-04-05T13:45:37',
                isEdited: false,
                attachments: [],
                mentions: [],
                replies: [
                  {
                    id: 'comment-002',
                    content: 'I can help with that @Captain David Wilson. We should have results back by tomorrow morning.',
                    createdBy: {
                      id: 'user-003',
                      name: 'Emily Rodriguez',
                      avatar: 'https://randomuser.me/api/portraits/women/43.jpg',
                      role: 'Forensic Analyst'
                    },
                    createdAt: '2025-04-05T13:52:19',
                    updatedAt: '2025-04-05T13:52:19',
                    isEdited: false,
                    parentCommentId: 'comment-001',
                    attachments: [],
                    mentions: [
                      {
                        id: 'mention-001',
                        userId: 'user-004',
                        userName: 'Captain David Wilson',
                        startPosition: 15,
                        endPosition: 35
                      }
                    ],
                    replies: []
                  }
                ]
              }
            ]
          },
          {
            id: 'thread-002',
            title: 'Witness Statement Inconsistencies',
            content: 'I\'ve been reviewing the statements from our primary witnesses and noticed some concerning inconsistencies in their timeline descriptions. Specifically, Witness #3 (John Doe) mentioned seeing the suspect at 10:30 PM, but Witness #5 (Jane Smith) claimed the suspect was across town at 10:15-10:45 PM. We need to re-interview both to clarify this discrepancy.',
            createdBy: {
              id: 'user-002',
              name: 'Det. Michael Chen',
              avatar: 'https://randomuser.me/api/portraits/men/42.jpg',
              role: 'Investigator'
            },
            createdAt: '2025-04-05T11:15:43',
            updatedAt: '2025-04-05T11:15:43',
            category: 'witness',
            referenceId: 'wit-2025-018',
            isSticky: false,
            isPinned: true,
            viewCount: 8,
            comments: [
              {
                id: 'comment-003',
                content: 'Good catch, Michael. I\'ve scheduled re-interviews for tomorrow morning. @Emily Rodriguez can you join me for these? Your expertise in reading behavioral cues would be helpful.',
                createdBy: {
                  id: 'user-001',
                  name: 'Det. Sarah Johnson',
                  avatar: 'https://randomuser.me/api/portraits/women/41.jpg',
                  role: 'Lead Investigator'
                },
                createdAt: '2025-04-05T11:30:15',
                updatedAt: '2025-04-05T11:30:15',
                isEdited: false,
                attachments: [],
                mentions: [
                  {
                    id: 'mention-002',
                    userId: 'user-003',
                    userName: 'Emily Rodriguez',
                    startPosition: 66,
                    endPosition: 82
                  }
                ],
                replies: []
              }
            ]
          },
          {
            id: 'thread-003',
            title: 'Case Timeline Updated',
            content: 'I\'ve updated our case timeline with the new information from the traffic camera footage. The suspect\'s vehicle appears at 10:22 PM at the intersection of Main and Oak, which helps narrow down our timeline. Please review the updated sequence of events.',
            createdBy: {
              id: 'user-001',
              name: 'Det. Sarah Johnson',
              avatar: 'https://randomuser.me/api/portraits/women/41.jpg',
              role: 'Lead Investigator'
            },
            createdAt: '2025-04-04T16:08:37',
            updatedAt: '2025-04-04T16:08:37',
            category: 'timeline',
            referenceId: 'timeline-087',
            isSticky: false,
            isPinned: false,
            viewCount: 12,
            comments: []
          }
        ];
        
        setThreads(mockThreads);
        setLoading(false);
      }, 800);
    };
    
    fetchThreads();
  }, [caseId]);
  
  const filteredThreads = threads.filter(thread => {
    const matchesCategory = categoryFilter === 'all' || thread.category === categoryFilter;
    const matchesSearch = !searchQuery || 
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });
  
  const handleViewThread = (threadId: string) => {
    const thread = threads.find(t => t.id === threadId);
    if (thread) {
      setSelectedThread(thread);
    }
  };
  
  const handleAddComment = (threadId: string, content: string) => {
    // In a real app, this would be an API call
    alert(`In a real app, this would add a comment to thread ${threadId} with content: ${content}`);
    
    // Mock adding comment for demo purposes
    const updatedThreads = threads.map(thread => {
      if (thread.id === threadId) {
        const newComment = {
          id: `comment-${thread.comments.length + 1}`,
          content,
          createdBy: {
            id: 'user-001',
            name: 'Det. Sarah Johnson',
            avatar: 'https://randomuser.me/api/portraits/women/41.jpg',
            role: 'Lead Investigator'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isEdited: false,
          attachments: [],
          mentions: [],
          replies: []
        };
        
        return {
          ...thread,
          comments: [...thread.comments, newComment]
        };
      }
      return thread;
    });
    
    setThreads(updatedThreads);
    
    // Update selected thread if viewing it
    if (selectedThread && selectedThread.id === threadId) {
      const updatedThread = updatedThreads.find(t => t.id === threadId);
      if (updatedThread) {
        setSelectedThread(updatedThread);
      }
    }
  };
  
  // Create "New Thread" page link instead of modal (following project pattern)
  const newThreadLink = `/cases/${caseId}/discussions/new`;
  
  return (
    <div className="discussion-board-container p-4">
      {selectedThread ? (
        <ThreadDetail 
          thread={selectedThread} 
          onBack={() => setSelectedThread(null)}
          onAddComment={handleAddComment}
        />
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 className="mb-1">Discussion Board</h5>
              <p className="text-muted mb-0">
                {threads.length} discussion threads in this case
              </p>
            </div>
            <div>
              <Link to={newThreadLink} className="btn btn-primary">
                <FaPlus className="me-2" /> New Thread
              </Link>
            </div>
          </div>
          
          <div className="row mb-4">
            <div className="col-md-8">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search discussions..."
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
              <select
                className="form-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="general">General</option>
                <option value="evidence">Evidence</option>
                <option value="witness">Witnesses</option>
                <option value="suspect">Suspects</option>
                <option value="timeline">Timeline</option>
                <option value="task">Tasks</option>
              </select>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading discussions...</p>
            </div>
          ) : filteredThreads.length > 0 ? (
            <div className="threads-list">
              {filteredThreads.map(thread => (
                <ThreadItem 
                  key={thread.id} 
                  thread={thread}
                  onView={handleViewThread}
                />
              ))}
            </div>
          ) : (
            <div className="alert alert-info text-center py-5">
              <FaComment style={{ fontSize: '2rem', opacity: 0.5 }} className="mb-3" />
              <h5>No Discussions Found</h5>
              <p>
                {searchQuery || categoryFilter !== 'all' 
                  ? 'No discussions match your current filters. Try changing your search criteria.'
                  : 'There are no discussions in this case yet. Start a new discussion thread.'
                }
              </p>
              <Link to={newThreadLink} className="btn btn-primary mt-2">
                <FaPlus className="me-2" /> Start New Discussion
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DiscussionBoard;
