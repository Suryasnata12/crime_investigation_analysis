from src.database.db_init import db
from datetime import datetime
import enum

class CaseStatus(enum.Enum):
    ACTIVE = "active"
    PENDING = "pending_analysis"
    REVIEW = "under_review"
    CLOSED = "closed"
    ARCHIVED = "archived"

class CasePriority(enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class Case(db.Model):
    __tablename__ = 'cases'
    
    id = db.Column(db.Integer, primary_key=True)
    case_number = db.Column(db.String(50), unique=True, nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.Enum(CaseStatus), default=CaseStatus.ACTIVE)
    priority = db.Column(db.Enum(CasePriority), default=CasePriority.MEDIUM)
    crime_type = db.Column(db.String(100))
    crime_date = db.Column(db.DateTime)
    crime_location = db.Column(db.String(200))
    opened_date = db.Column(db.DateTime, default=datetime.utcnow)
    closed_date = db.Column(db.DateTime)
    investigator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    department = db.Column(db.String(100))
    
    # Relationships
    evidence_items = db.relationship('Evidence', backref='case', lazy=True, cascade="all, delete-orphan")
    suspects = db.relationship('Suspect', backref='case', lazy=True, cascade="all, delete-orphan")
    timeline_events = db.relationship('TimelineEvent', backref='case', lazy=True, cascade="all, delete-orphan")
    notes = db.relationship('CaseNote', backref='case', lazy=True, cascade="all, delete-orphan")
    reports = db.relationship('AnalysisReport', backref='case', lazy=True)
    
    def __repr__(self):
        return f'<Case {self.case_number}: {self.title}>'
        
    def get_summary(self):
        return {
            'id': self.id,
            'case_number': self.case_number,
            'title': self.title,
            'status': self.status.value,
            'priority': self.priority.value,
            'opened_date': self.opened_date,
            'evidence_count': len(self.evidence_items),
            'suspect_count': len(self.suspects)
        }

class CaseNote(db.Model):
    __tablename__ = 'case_notes'
    
    id = db.Column(db.Integer, primary_key=True)
    case_id = db.Column(db.Integer, db.ForeignKey('cases.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    note_text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)
    is_private = db.Column(db.Boolean, default=False)
    
    user = db.relationship('User', backref='case_notes', lazy=True)
    
    def __repr__(self):
        return f'<CaseNote for Case {self.case_id} by User {self.user_id}>'

class TimelineEvent(db.Model):
    __tablename__ = 'timeline_events'
    
    id = db.Column(db.Integer, primary_key=True)
    case_id = db.Column(db.Integer, db.ForeignKey('cases.id'), nullable=False)
    event_time = db.Column(db.DateTime, nullable=False)
    event_description = db.Column(db.String(500), nullable=False)
    event_location = db.Column(db.String(200))
    evidence_id = db.Column(db.Integer, db.ForeignKey('evidence.id'))
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_verified = db.Column(db.Boolean, default=False)
    verification_method = db.Column(db.String(100))
    
    evidence = db.relationship('Evidence', backref='timeline_mentions', lazy=True)
    creator = db.relationship('User', backref='timeline_entries', lazy=True)
    
    def __repr__(self):
        return f'<TimelineEvent {self.event_time}: {self.event_description[:30]}...>'
