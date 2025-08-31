from src.database.db_init import db
from datetime import datetime
import enum

class AnalysisType(enum.Enum):
    EVIDENCE_CORRELATION = "evidence_correlation"
    SUSPECT_PROFILE = "suspect_profile"
    TIMELINE_ANALYSIS = "timeline_analysis"
    DIGITAL_FORENSICS = "digital_forensics"
    FINGERPRINT_ANALYSIS = "fingerprint_analysis"
    DNA_ANALYSIS = "dna_analysis"
    BEHAVIORAL_ANALYSIS = "behavioral_analysis"
    STATISTICAL_ANALYSIS = "statistical_analysis"
    COMPREHENSIVE = "comprehensive"

class ConfidenceLevel(enum.Enum):
    INCONCLUSIVE = "inconclusive"
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    VERY_HIGH = "very_high"

class AnalysisReport(db.Model):
    __tablename__ = 'analysis_reports'
    
    id = db.Column(db.Integer, primary_key=True)
    case_id = db.Column(db.Integer, db.ForeignKey('cases.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    analysis_type = db.Column(db.Enum(AnalysisType), nullable=False)
    analyst_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)
    executive_summary = db.Column(db.Text, nullable=False)
    methodology = db.Column(db.Text)
    findings = db.Column(db.Text, nullable=False)
    conclusions = db.Column(db.Text)
    recommendations = db.Column(db.Text)
    overall_confidence = db.Column(db.Enum(ConfidenceLevel))
    supporting_evidence_ids = db.Column(db.String(500))  # Comma-separated IDs
    report_file = db.Column(db.String(500))
    is_final = db.Column(db.Boolean, default=False)
    reviewer_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    review_comments = db.Column(db.Text)
    review_date = db.Column(db.DateTime)
    
    # Relationships
    analyst = db.relationship('User', foreign_keys=[analyst_id], backref='reports_authored')
    reviewer = db.relationship('User', foreign_keys=[reviewer_id], backref='reports_reviewed')
    
    def __repr__(self):
        return f'<AnalysisReport {self.id}: {self.title}>'

class PatternAnalysis(db.Model):
    __tablename__ = 'pattern_analyses'
    
    id = db.Column(db.Integer, primary_key=True)
    report_id = db.Column(db.Integer, db.ForeignKey('analysis_reports.id'), nullable=False)
    pattern_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    detection_method = db.Column(db.String(200))
    confidence_score = db.Column(db.Float)  # 0-1 scale
    evidence_ids = db.Column(db.String(500))  # Comma-separated IDs
    visual_representation = db.Column(db.String(500))  # Path to graph or image
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    report = db.relationship('AnalysisReport', backref='identified_patterns')
    creator = db.relationship('User', backref='pattern_analyses')
    
    def __repr__(self):
        return f'<PatternAnalysis {self.id}: {self.pattern_name}>'

class EvidenceCorrelation(db.Model):
    __tablename__ = 'evidence_correlations'
    
    id = db.Column(db.Integer, primary_key=True)
    report_id = db.Column(db.Integer, db.ForeignKey('analysis_reports.id'), nullable=False)
    evidence_a_id = db.Column(db.Integer, db.ForeignKey('evidence.id'), nullable=False)
    evidence_b_id = db.Column(db.Integer, db.ForeignKey('evidence.id'), nullable=False)
    correlation_type = db.Column(db.String(100), nullable=False)  # e.g., temporal, spatial, causal
    correlation_strength = db.Column(db.Float, nullable=False)  # 0-1 scale
    description = db.Column(db.Text, nullable=False)
    detected_by = db.Column(db.String(100))  # Algorithm or method name
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    verified_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    verification_notes = db.Column(db.Text)
    
    report = db.relationship('AnalysisReport', backref='evidence_correlations')
    evidence_a = db.relationship('Evidence', foreign_keys=[evidence_a_id])
    evidence_b = db.relationship('Evidence', foreign_keys=[evidence_b_id])
    verifier = db.relationship('User', backref='verified_correlations')
    
    def __repr__(self):
        return f'<EvidenceCorrelation {self.id}: {self.correlation_type}>'

class ProbabilityAssessment(db.Model):
    __tablename__ = 'probability_assessments'
    
    id = db.Column(db.Integer, primary_key=True)
    report_id = db.Column(db.Integer, db.ForeignKey('analysis_reports.id'), nullable=False)
    suspect_id = db.Column(db.Integer, db.ForeignKey('suspects.id'), nullable=False)
    hypothesis = db.Column(db.String(255), nullable=False)
    probability_score = db.Column(db.Float, nullable=False)  # 0-1 scale
    confidence_interval = db.Column(db.String(50))  # e.g., "0.65-0.85"
    assessment_method = db.Column(db.String(100))
    factors_considered = db.Column(db.Text)
    supporting_evidence_ids = db.Column(db.String(500))  # Comma-separated IDs
    conflicting_evidence_ids = db.Column(db.String(500))  # Comma-separated IDs
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    assessed_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    report = db.relationship('AnalysisReport', backref='probability_assessments')
    suspect = db.relationship('Suspect', backref='probability_assessments')
    assessor = db.relationship('User', backref='probability_assessments')
    
    def __repr__(self):
        return f'<ProbabilityAssessment {self.id} for Suspect {self.suspect_id}>'
