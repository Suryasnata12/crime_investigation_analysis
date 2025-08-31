from src.database.db_init import db
from datetime import datetime
import enum

class SuspectStatus(enum.Enum):
    PERSON_OF_INTEREST = "person_of_interest"
    PRIMARY_SUSPECT = "primary_suspect"
    SECONDARY_SUSPECT = "secondary_suspect"
    CLEARED = "cleared"
    CHARGED = "charged"
    CONVICTED = "convicted"
    ACQUITTED = "acquitted"

class Suspect(db.Model):
    __tablename__ = 'suspects'
    
    id = db.Column(db.Integer, primary_key=True)
    case_id = db.Column(db.Integer, db.ForeignKey('cases.id'), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    alias = db.Column(db.String(100))
    date_of_birth = db.Column(db.Date)
    gender = db.Column(db.String(20))
    height = db.Column(db.String(20))  # Stored as string to handle different formats
    weight = db.Column(db.String(20))
    identifying_features = db.Column(db.Text)
    last_known_address = db.Column(db.String(255))
    contact_information = db.Column(db.String(100))
    occupation = db.Column(db.String(100))
    status = db.Column(db.Enum(SuspectStatus), default=SuspectStatus.PERSON_OF_INTEREST)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)
    added_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    risk_assessment = db.Column(db.Float)  # 0-100 score
    
    # Relationships
    creator = db.relationship('User', backref='suspects_added', foreign_keys=[added_by])
    evidence_links = db.relationship('SuspectEvidenceLink', backref='suspect', lazy=True, cascade="all, delete-orphan")
    interviews = db.relationship('SuspectInterview', backref='suspect', lazy=True, cascade="all, delete-orphan")
    alibis = db.relationship('SuspectAlibi', backref='suspect', lazy=True, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f'<Suspect {self.id}: {self.first_name} {self.last_name}>'
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def calculate_match_score(self):
        """Calculate the suspect's match score based on linked evidence"""
        total_evidence = len(self.evidence_links)
        if total_evidence == 0:
            return 0
            
        # Sum all positive matches weighted by reliability
        reliability_weights = {'high': 1.0, 'medium': 0.7, 'low': 0.4, 'unknown': 0.2}
        match_scores = {'match': 1.0, 'partial_match': 0.5, 'possible_match': 0.3, 'no_match': 0.0}
        
        score = 0
        for link in self.evidence_links:
            reliability = link.evidence.reliability.value
            match_status = link.match_status
            
            if match_status in match_scores and reliability in reliability_weights:
                score += match_scores[match_status] * reliability_weights[reliability]
        
        # Normalize to percentage
        return min(round((score / total_evidence) * 100), 100)

class SuspectEvidenceLink(db.Model):
    __tablename__ = 'suspect_evidence_links'
    
    id = db.Column(db.Integer, primary_key=True)
    suspect_id = db.Column(db.Integer, db.ForeignKey('suspects.id'), nullable=False)
    evidence_id = db.Column(db.Integer, db.ForeignKey('evidence.id'), nullable=False)
    match_status = db.Column(db.String(50), nullable=False)  # match, partial_match, possible_match, no_match
    match_details = db.Column(db.Text)
    linked_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    linked_at = db.Column(db.DateTime, default=datetime.utcnow)
    confidence = db.Column(db.Float)  # 0-1 confidence level
    verification_method = db.Column(db.String(100))
    
    linker = db.relationship('User', backref='evidence_links_created')
    
    def __repr__(self):
        return f'<SuspectEvidenceLink Suspect {self.suspect_id} to Evidence {self.evidence_id}>'

class SuspectInterview(db.Model):
    __tablename__ = 'suspect_interviews'
    
    id = db.Column(db.Integer, primary_key=True)
    suspect_id = db.Column(db.Integer, db.ForeignKey('suspects.id'), nullable=False)
    interviewer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    interview_date = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(200))
    duration_minutes = db.Column(db.Integer)
    summary = db.Column(db.Text, nullable=False)
    transcript_file = db.Column(db.String(500))
    recording_file = db.Column(db.String(500))
    attorney_present = db.Column(db.Boolean, default=False)
    witness_present = db.Column(db.Boolean, default=False)
    miranda_given = db.Column(db.Boolean)
    credibility_assessment = db.Column(db.Integer)  # 1-10 scale
    key_statements = db.Column(db.Text)
    notes = db.Column(db.Text)
    
    interviewer = db.relationship('User', backref='interviews_conducted')
    
    def __repr__(self):
        return f'<SuspectInterview {self.id} with Suspect {self.suspect_id}>'

class SuspectAlibi(db.Model):
    __tablename__ = 'suspect_alibis'
    
    id = db.Column(db.Integer, primary_key=True)
    suspect_id = db.Column(db.Integer, db.ForeignKey('suspects.id'), nullable=False)
    alibi_start_time = db.Column(db.DateTime, nullable=False)
    alibi_end_time = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    witness_name = db.Column(db.String(100))
    witness_contact = db.Column(db.String(100))
    verification_status = db.Column(db.String(50))  # verified, disproven, unverified
    verification_method = db.Column(db.String(100))
    verified_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    verification_date = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    
    verifier = db.relationship('User', backref='alibis_verified')
    
    def __repr__(self):
        return f'<SuspectAlibi {self.id} for Suspect {self.suspect_id}>'
