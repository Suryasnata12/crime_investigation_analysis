import React from 'react';
import { FaFileAlt, FaCalendarCheck, FaPhoneAlt, FaExclamationTriangle, FaHistory, FaCheckCircle } from 'react-icons/fa';

interface TimelineEvent {
  id: number;
  date: string;
  time: string;
  type: 'statement' | 'interview' | 'contact' | 'notification' | 'credibility_change' | 'status_change';
  description: string;
  relatedId?: number;
  user: string;
  icon?: JSX.Element;
}

interface WitnessTimelineProps {
  witnessId: string;
  events: TimelineEvent[];
}

const WitnessTimeline: React.FC<WitnessTimelineProps> = ({ witnessId, events }) => {
  const getEventIcon = (type: string): JSX.Element => {
    switch(type) {
      case 'statement':
        return <FaFileAlt />;
      case 'interview':
        return <FaCalendarCheck />;
      case 'contact':
        return <FaPhoneAlt />;
      case 'notification':
        return <FaExclamationTriangle />;
      case 'credibility_change':
        return <FaExclamationTriangle />;
      case 'status_change':
        return <FaCheckCircle />;
      default:
        return <FaHistory />;
    }
  };

  const getEventColor = (type: string): string => {
    switch(type) {
      case 'statement':
        return 'primary';
      case 'interview':
        return 'success';
      case 'contact':
        return 'info';
      case 'notification':
        return 'warning';
      case 'credibility_change':
        return 'danger';
      case 'status_change':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateB.getTime() - dateA.getTime(); // Most recent first
  });

  return (
    <div className="witness-timeline">
      <div className="timeline-container">
        {sortedEvents.length === 0 ? (
          <div className="text-center p-4">
            <p className="text-muted">No timeline events found for this witness.</p>
          </div>
        ) : (
          sortedEvents.map((event) => (
            <div key={event.id} className="timeline-item">
              <div className={`timeline-badge bg-${getEventColor(event.type)}`}>
                {event.icon || getEventIcon(event.type)}
              </div>
              <div className="timeline-panel card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <div className="timeline-header">
                    <span className={`badge bg-${getEventColor(event.type)} me-2`}>
                      {event.type.replace('_', ' ').toUpperCase()}
                    </span>
                    <small className="text-muted">
                      {new Date(`${event.date}T${event.time}`).toLocaleString()}
                    </small>
                  </div>
                  <div>
                    <small className="text-muted">By: {event.user}</small>
                  </div>
                </div>
                <div className="card-body">
                  <p className="mb-0">{event.description}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style>
        {`
        .witness-timeline {
          position: relative;
          padding: 20px 0;
        }
        
        .timeline-container {
          position: relative;
        }
        
        .timeline-container:before {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: 20px;
          width: 4px;
          background: #e9ecef;
          border-radius: 2px;
        }
        
        .timeline-item {
          position: relative;
          margin-bottom: 30px;
          margin-left: 45px;
        }
        
        .timeline-badge {
          position: absolute;
          top: 15px;
          left: -45px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          z-index: 1;
        }
        `}
      </style>
    </div>
  );
};

export default WitnessTimeline;
