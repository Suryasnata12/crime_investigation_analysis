from src.database.db_init import db
from datetime import datetime
import enum

class EvidenceType(enum.Enum):
    PHYSICAL = "physical"
    DIGITAL = "digital"
    DOCUMENTARY = "documentary"
    TESTIMONIAL = "testimonial"
    BIOLOGICAL = "biological"
    TRACE = "trace"
    DEMONSTRATIVE = "demonstrative"

class EvidenceStatus(enum.Enum):
    COLLECTED = "collected"
    PROCESSING = "processing"
    ANALYZED = "analyzed"
    VERIFIED = "verified"
    INCONCLUSIVE = "inconclusive"
    CONTAMINATED = "contaminated"
    INADMISSIBLE = "inadmissible"

class ReliabilityLevel(enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    UNKNOWN = "unknown"

class Evidence(db.Model):
    __tablename__ = 'evidence'
    
    id = db.Column(db.Integer, primary_key=True)
    evidence_number = db.Column(db.String(50), unique=True, nullable=False)
    case_id = db.Column(db.Integer, db.ForeignKey('cases.id'), nullable=False)
    evidence_type = db.Column(db.Enum(EvidenceType), nullable=False)
    description = db.Column(db.Text, nullable=False)
    location_found = db.Column(db.String(200))
    collection_date = db.Column(db.DateTime, nullable=False)
    collector_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.Enum(EvidenceStatus), default=EvidenceStatus.COLLECTED)
    reliability = db.Column(db.Enum(ReliabilityLevel), default=ReliabilityLevel.UNKNOWN)
    is_key_evidence = db.Column(db.Boolean, default=False)
    notes = db.Column(db.Text)
    storage_location = db.Column(db.String(200))
    chain_of_custody_complete = db.Column(db.Boolean, default=False)
    
    # Relationships
    collector = db.relationship('User', foreign_keys=[collector_id], backref='collected_evidence')
    analysis_results = db.relationship('EvidenceAnalysis', backref='evidence', lazy=True, cascade="all, delete-orphan")
    custody_chain = db.relationship('CustodyChange', backref='evidence', lazy=True, cascade="all, delete-orphan")
    files = db.relationship('EvidenceFile', backref='evidence', lazy=True, cascade="all, delete-orphan")
    suspect_links = db.relationship('SuspectEvidenceLink', backref='evidence', lazy=True)
    
    def __repr__(self):
        return f'<Evidence {self.evidence_number}: {self.evidence_type.value}>'

class EvidenceFile(db.Model):
    __tablename__ = 'evidence_files'
    
    id = db.Column(db.Integer, primary_key=True)
    evidence_id = db.Column(db.Integer, db.ForeignKey('evidence.id'), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(50))  # e.g., image, document, video
    file_path = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.Integer)  # in bytes
    content_hash = db.Column(db.String(128))  # For integrity verification
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    uploader_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    is_public = db.Column(db.Boolean, default=False)  # Whether viewable by all users
    
    uploader = db.relationship('User', backref='uploaded_files')
    
    def __repr__(self):
        return f'<EvidenceFile {self.file_name} for Evidence {self.evidence_id}>'

class CustodyChange(db.Model):
    __tablename__ = 'custody_changes'
    
    id = db.Column(db.Integer, primary_key=True)
    evidence_id = db.Column(db.Integer, db.ForeignKey('evidence.id'), nullable=False)
    from_user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    to_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    change_time = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    reason = db.Column(db.String(255))
    location = db.Column(db.String(200))
    witness_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    notes = db.Column(db.Text)
    
    from_user = db.relationship('User', foreign_keys=[from_user_id], backref='custody_given')
    to_user = db.relationship('User', foreign_keys=[to_user_id], backref='custody_received')
    witness = db.relationship('User', foreign_keys=[witness_id], backref='custody_witnessed')
    
    def __repr__(self):
        return f'<CustodyChange for Evidence {self.evidence_id} from {self.from_user_id} to {self.to_user_id}>'

class EvidenceAnalysis(db.Model):
    __tablename__ = 'evidence_analyses'
    
    id = db.Column(db.Integer, primary_key=True)
    evidence_id = db.Column(db.Integer, db.ForeignKey('evidence.id'), nullable=False)
    analyst_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    analysis_date = db.Column(db.DateTime, default=datetime.utcnow)
    analysis_method = db.Column(db.String(100), nullable=False)
    equipment_used = db.Column(db.String(255))
    analysis_details = db.Column(db.Text, nullable=False)
    conclusion = db.Column(db.Text)
    confidence_level = db.Column(db.Float)  # 0.0 to 1.0
    verified_by_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    verification_date = db.Column(db.DateTime)
    report_file = db.Column(db.String(500))
    
    analyst = db.relationship('User', foreign_keys=[analyst_id], backref='analyses_performed')
    verifier = db.relationship('User', foreign_keys=[verified_by_id], backref='analyses_verified')
    
    def __repr__(self):
        return f'<EvidenceAnalysis {self.id} for Evidence {self.evidence_id}>'

class EvidenceLog(db.Model):
    __tablename__ = 'evidence_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    evidence_id = db.Column(db.Integer, db.ForeignKey('evidence.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    action = db.Column(db.String(50), nullable=False)  # e.g., view, update, analyze
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    details = db.Column(db.Text)
    ip_address = db.Column(db.String(50))
    
    evidence = db.relationship('Evidence', backref='access_logs')
    
    def __repr__(self):
        return f'<EvidenceLog {self.action} on Evidence {self.evidence_id} by User {self.user_id}>'
