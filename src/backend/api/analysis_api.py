from flask import Blueprint, request, jsonify
from datetime import datetime
import json
from src.database.db_init import db
from src.backend.models.analysis_model import AnalysisReport, PatternAnalysis, EvidenceCorrelation, ProbabilityAssessment
from src.backend.models.analysis_model import AnalysisType, ConfidenceLevel
from src.backend.models.evidence_model import Evidence
from src.backend.models.suspect_model import Suspect
from src.backend.utils.auth import token_required, has_permission
from src.analysis_tools.evidence_correlation import find_evidence_correlations
from src.analysis_tools.pattern_detection import detect_patterns
from src.analysis_tools.probability_calculator import calculate_suspect_probabilities

analysis_bp = Blueprint('analysis', __name__)

@analysis_bp.route('/reports', methods=['GET'])
@token_required
def get_all_reports(current_user):
    """Get a list of all analysis reports with optional filtering"""
    if not has_permission(current_user, 'analysis:view'):
        return jsonify({'message': 'Not authorized to view analysis reports'}), 403
    
    # Parse query parameters
    case_id = request.args.get('case_id')
    analysis_type = request.args.get('type')
    analyst_id = request.args.get('analyst_id')
    is_final = request.args.get('is_final', '').lower() == 'true'
    
    # Build query
    query = AnalysisReport.query
    
    if case_id:
        query = query.filter(AnalysisReport.case_id == case_id)
    
    if analysis_type:
        query = query.filter(AnalysisReport.analysis_type == AnalysisType(analysis_type))
        
    if analyst_id:
        query = query.filter(AnalysisReport.analyst_id == analyst_id)
        
    if request.args.get('is_final') is not None:
        query = query.filter(AnalysisReport.is_final == is_final)
    
    # Execute query with sorting
    reports = query.order_by(AnalysisReport.created_at.desc()).all()
    
    # Return results
    report_list = []
    for report in reports:
        report_list.append({
            'id': report.id,
            'case_id': report.case_id,
            'title': report.title,
            'analysis_type': report.analysis_type.value,
            'analyst_id': report.analyst_id,
            'analyst_name': report.analyst.get_full_name() if report.analyst else None,
            'created_at': report.created_at.isoformat() if report.created_at else None,
            'updated_at': report.updated_at.isoformat() if report.updated_at else None,
            'overall_confidence': report.overall_confidence.value if report.overall_confidence else None,
            'is_final': report.is_final,
            'reviewer_id': report.reviewer_id,
            'reviewer_name': report.reviewer.get_full_name() if report.reviewer else None,
            'pattern_count': len(report.identified_patterns),
            'correlation_count': len(report.evidence_correlations),
            'probability_count': len(report.probability_assessments)
        })
    
    return jsonify(report_list), 200

@analysis_bp.route('/reports/<int:report_id>', methods=['GET'])
@token_required
def get_report(current_user, report_id):
    """Get details for a specific analysis report"""
    if not has_permission(current_user, 'analysis:view'):
        return jsonify({'message': 'Not authorized to view analysis reports'}), 403
    
    report = AnalysisReport.query.get_or_404(report_id)
    
    # Build detailed response
    report_detail = {
        'id': report.id,
        'case_id': report.case_id,
        'title': report.title,
        'analysis_type': report.analysis_type.value,
        'analyst_id': report.analyst_id,
        'analyst_name': report.analyst.get_full_name() if report.analyst else None,
        'created_at': report.created_at.isoformat() if report.created_at else None,
        'updated_at': report.updated_at.isoformat() if report.updated_at else None,
        'executive_summary': report.executive_summary,
        'methodology': report.methodology,
        'findings': report.findings,
        'conclusions': report.conclusions,
        'recommendations': report.recommendations,
        'overall_confidence': report.overall_confidence.value if report.overall_confidence else None,
        'supporting_evidence_ids': report.supporting_evidence_ids,
        'report_file': report.report_file,
        'is_final': report.is_final,
        'reviewer_id': report.reviewer_id,
        'reviewer_name': report.reviewer.get_full_name() if report.reviewer else None,
        'review_comments': report.review_comments,
        'review_date': report.review_date.isoformat() if report.review_date else None,
        'patterns': [],
        'correlations': [],
        'probability_assessments': []
    }
    
    # Add patterns
    for pattern in report.identified_patterns:
        report_detail['patterns'].append({
            'id': pattern.id,
            'pattern_name': pattern.pattern_name,
            'description': pattern.description,
            'detection_method': pattern.detection_method,
            'confidence_score': pattern.confidence_score,
            'evidence_ids': pattern.evidence_ids,
            'visual_representation': pattern.visual_representation,
            'created_at': pattern.created_at.isoformat() if pattern.created_at else None
        })
    
    # Add correlations
    for correlation in report.evidence_correlations:
        evidence_a = Evidence.query.get(correlation.evidence_a_id)
        evidence_b = Evidence.query.get(correlation.evidence_b_id)
        
        report_detail['correlations'].append({
            'id': correlation.id,
            'evidence_a_id': correlation.evidence_a_id,
            'evidence_a_number': evidence_a.evidence_number if evidence_a else None,
            'evidence_b_id': correlation.evidence_b_id,
            'evidence_b_number': evidence_b.evidence_number if evidence_b else None,
            'correlation_type': correlation.correlation_type,
            'correlation_strength': correlation.correlation_strength,
            'description': correlation.description,
            'detected_by': correlation.detected_by
        })
    
    # Add probability assessments
    for assessment in report.probability_assessments:
        suspect = Suspect.query.get(assessment.suspect_id)
        
        report_detail['probability_assessments'].append({
            'id': assessment.id,
            'suspect_id': assessment.suspect_id,
            'suspect_name': suspect.get_full_name() if suspect else None,
            'hypothesis': assessment.hypothesis,
            'probability_score': assessment.probability_score,
            'confidence_interval': assessment.confidence_interval,
            'assessment_method': assessment.assessment_method,
            'factors_considered': assessment.factors_considered,
            'supporting_evidence_ids': assessment.supporting_evidence_ids,
            'conflicting_evidence_ids': assessment.conflicting_evidence_ids
        })
    
    return jsonify(report_detail), 200

@analysis_bp.route('/reports', methods=['POST'])
@token_required
def create_report(current_user):
    """Create a new analysis report"""
    if not has_permission(current_user, 'analysis:create'):
        return jsonify({'message': 'Not authorized to create analysis reports'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['case_id', 'title', 'analysis_type', 'executive_summary', 'findings']
    if not all(k in data for k in required_fields):
        return jsonify({'message': 'Missing required fields', 'required': required_fields}), 400
    
    # Create new report object
    new_report = AnalysisReport(
        case_id=data['case_id'],
        title=data['title'],
        analysis_type=AnalysisType(data['analysis_type']),
        analyst_id=current_user.id,
        created_at=datetime.utcnow(),
        executive_summary=data['executive_summary'],
        methodology=data.get('methodology'),
        findings=data['findings'],
        conclusions=data.get('conclusions'),
        recommendations=data.get('recommendations'),
        overall_confidence=ConfidenceLevel(data['overall_confidence']) if data.get('overall_confidence') else None,
        supporting_evidence_ids=data.get('supporting_evidence_ids'),
        report_file=data.get('report_file'),
        is_final=data.get('is_final', False)
    )
    
    # Save to database
    db.session.add(new_report)
    db.session.commit()
    
    return jsonify({
        'message': 'Analysis report created successfully',
        'report_id': new_report.id
    }), 201

@analysis_bp.route('/reports/<int:report_id>', methods=['PUT'])
@token_required
def update_report(current_user, report_id):
    """Update an existing analysis report"""
    if not has_permission(current_user, 'analysis:update'):
        return jsonify({'message': 'Not authorized to update analysis reports'}), 403
    
    report = AnalysisReport.query.get_or_404(report_id)
    
    # Check if user is the analyst or has admin privileges
    if report.analyst_id != current_user.id and not has_permission(current_user, 'analysis:update_any'):
        return jsonify({'message': 'You can only update your own reports'}), 403
    
    # Check if report is final and user doesn't have finalized update permission
    if report.is_final and not has_permission(current_user, 'analysis:update_final'):
        return jsonify({'message': 'Cannot update finalized reports'}), 403
    
    data = request.get_json()
    
    # Update fields
    if 'title' in data:
        report.title = data['title']
    if 'analysis_type' in data:
        report.analysis_type = AnalysisType(data['analysis_type'])
    if 'executive_summary' in data:
        report.executive_summary = data['executive_summary']
    if 'methodology' in data:
        report.methodology = data['methodology']
    if 'findings' in data:
        report.findings = data['findings']
    if 'conclusions' in data:
        report.conclusions = data['conclusions']
    if 'recommendations' in data:
        report.recommendations = data['recommendations']
    if 'overall_confidence' in data:
        report.overall_confidence = ConfidenceLevel(data['overall_confidence']) if data['overall_confidence'] else None
    if 'supporting_evidence_ids' in data:
        report.supporting_evidence_ids = data['supporting_evidence_ids']
    if 'report_file' in data:
        report.report_file = data['report_file']
    if 'is_final' in data and has_permission(current_user, 'analysis:finalize'):
        report.is_final = data['is_final']
    
    # Update timestamp
    report.updated_at = datetime.utcnow()
    
    # Save changes
    db.session.commit()
    
    return jsonify({'message': 'Analysis report updated successfully'}), 200

@analysis_bp.route('/reports/<int:report_id>/review', methods=['POST'])
@token_required
def review_report(current_user, report_id):
    """Add review comments to a report"""
    if not has_permission(current_user, 'analysis:review'):
        return jsonify({'message': 'Not authorized to review analysis reports'}), 403
    
    report = AnalysisReport.query.get_or_404(report_id)
    data = request.get_json()
    
    # Validate required fields
    if 'review_comments' not in data:
        return jsonify({'message': 'Review comments are required'}), 400
    
    # Update review information
    report.reviewer_id = current_user.id
    report.review_comments = data['review_comments']
    report.review_date = datetime.utcnow()
    
    # Update status if requested
    if 'is_final' in data and has_permission(current_user, 'analysis:finalize'):
        report.is_final = data['is_final']
    
    # Save changes
    db.session.commit()
    
    return jsonify({'message': 'Report review added successfully'}), 200

@analysis_bp.route('/reports/<int:report_id>/patterns', methods=['POST'])
@token_required
def add_pattern(current_user, report_id):
    """Add a pattern analysis to a report"""
    if not has_permission(current_user, 'analysis:update'):
        return jsonify({'message': 'Not authorized to update analysis reports'}), 403
    
    report = AnalysisReport.query.get_or_404(report_id)
    
    # Check if user is the analyst or has admin privileges
    if report.analyst_id != current_user.id and not has_permission(current_user, 'analysis:update_any'):
        return jsonify({'message': 'You can only update your own reports'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ('pattern_name', 'description')):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Create pattern record
    pattern = PatternAnalysis(
        report_id=report_id,
        pattern_name=data['pattern_name'],
        description=data['description'],
        detection_method=data.get('detection_method'),
        confidence_score=data.get('confidence_score'),
        evidence_ids=data.get('evidence_ids'),
        visual_representation=data.get('visual_representation'),
        created_at=datetime.utcnow(),
        created_by=current_user.id
    )
    
    # Save to database
    db.session.add(pattern)
    db.session.commit()
    
    return jsonify({
        'message': 'Pattern added successfully',
        'pattern_id': pattern.id
    }), 201

@analysis_bp.route('/reports/<int:report_id>/correlations', methods=['POST'])
@token_required
def add_correlation(current_user, report_id):
    """Add an evidence correlation to a report"""
    if not has_permission(current_user, 'analysis:update'):
        return jsonify({'message': 'Not authorized to update analysis reports'}), 403
    
    report = AnalysisReport.query.get_or_404(report_id)
    
    # Check if user is the analyst or has admin privileges
    if report.analyst_id != current_user.id and not has_permission(current_user, 'analysis:update_any'):
        return jsonify({'message': 'You can only update your own reports'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['evidence_a_id', 'evidence_b_id', 'correlation_type', 'correlation_strength', 'description']
    if not all(k in data for k in required_fields):
        return jsonify({'message': 'Missing required fields', 'required': required_fields}), 400
    
    # Verify evidence exists
    evidence_a = Evidence.query.get(data['evidence_a_id'])
    evidence_b = Evidence.query.get(data['evidence_b_id'])
    
    if not evidence_a or not evidence_b:
        return jsonify({'message': 'One or both evidence items not found'}), 404
    
    # Create correlation record
    correlation = EvidenceCorrelation(
        report_id=report_id,
        evidence_a_id=data['evidence_a_id'],
        evidence_b_id=data['evidence_b_id'],
        correlation_type=data['correlation_type'],
        correlation_strength=data['correlation_strength'],
        description=data['description'],
        detected_by=data.get('detected_by'),
        created_at=datetime.utcnow(),
        verified_by=current_user.id if data.get('verified', False) else None,
        verification_notes=data.get('verification_notes')
    )
    
    # Save to database
    db.session.add(correlation)
    db.session.commit()
    
    return jsonify({
        'message': 'Correlation added successfully',
        'correlation_id': correlation.id
    }), 201

@analysis_bp.route('/reports/<int:report_id>/probabilities', methods=['POST'])
@token_required
def add_probability(current_user, report_id):
    """Add a probability assessment to a report"""
    if not has_permission(current_user, 'analysis:update'):
        return jsonify({'message': 'Not authorized to update analysis reports'}), 403
    
    report = AnalysisReport.query.get_or_404(report_id)
    
    # Check if user is the analyst or has admin privileges
    if report.analyst_id != current_user.id and not has_permission(current_user, 'analysis:update_any'):
        return jsonify({'message': 'You can only update your own reports'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['suspect_id', 'hypothesis', 'probability_score']
    if not all(k in data for k in required_fields):
        return jsonify({'message': 'Missing required fields', 'required': required_fields}), 400
    
    # Verify suspect exists
    suspect = Suspect.query.get(data['suspect_id'])
    if not suspect:
        return jsonify({'message': 'Suspect not found'}), 404
    
    # Create probability assessment record
    assessment = ProbabilityAssessment(
        report_id=report_id,
        suspect_id=data['suspect_id'],
        hypothesis=data['hypothesis'],
        probability_score=data['probability_score'],
        confidence_interval=data.get('confidence_interval'),
        assessment_method=data.get('assessment_method'),
        factors_considered=data.get('factors_considered'),
        supporting_evidence_ids=data.get('supporting_evidence_ids'),
        conflicting_evidence_ids=data.get('conflicting_evidence_ids'),
        created_at=datetime.utcnow(),
        assessed_by=current_user.id
    )
    
    # Save to database
    db.session.add(assessment)
    db.session.commit()
    
    return jsonify({
        'message': 'Probability assessment added successfully',
        'assessment_id': assessment.id
    }), 201

@analysis_bp.route('/analyze/correlations', methods=['POST'])
@token_required
def analyze_correlations(current_user):
    """Automatically detect correlations between evidence items"""
    if not has_permission(current_user, 'analysis:run'):
        return jsonify({'message': 'Not authorized to run automated analysis'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    if 'case_id' not in data:
        return jsonify({'message': 'Case ID is required'}), 400
    
    # Get all evidence for the case
    case_evidence = Evidence.query.filter_by(case_id=data['case_id']).all()
    if not case_evidence:
        return jsonify({'message': 'No evidence found for this case'}), 404
    
    # Prepare evidence data for analysis
    evidence_data = []
    for evidence in case_evidence:
        evidence_data.append({
            'id': evidence.id,
            'evidence_number': evidence.evidence_number,
            'type': evidence.evidence_type.value,
            'description': evidence.description,
            'location': evidence.location_found,
            'date': evidence.collection_date.isoformat() if evidence.collection_date else None,
            'status': evidence.status.value,
            'reliability': evidence.reliability.value
        })
    
    # Run correlation analysis algorithm
    correlations = find_evidence_correlations(evidence_data, min_strength=data.get('min_strength', 0.3))
    
    # Return results
    return jsonify({
        'message': f'Found {len(correlations)} potential correlations',
        'correlations': correlations
    }), 200

@analysis_bp.route('/analyze/patterns', methods=['POST'])
@token_required
def analyze_patterns(current_user):
    """Automatically detect patterns in evidence and case data"""
    if not has_permission(current_user, 'analysis:run'):
        return jsonify({'message': 'Not authorized to run automated analysis'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    if 'case_id' not in data:
        return jsonify({'message': 'Case ID is required'}), 400
    
    # Get all evidence for the case
    case_evidence = Evidence.query.filter_by(case_id=data['case_id']).all()
    if not case_evidence:
        return jsonify({'message': 'No evidence found for this case'}), 404
    
    # Prepare evidence data for analysis
    evidence_data = []
    for evidence in case_evidence:
        evidence_data.append({
            'id': evidence.id,
            'evidence_number': evidence.evidence_number,
            'type': evidence.evidence_type.value,
            'description': evidence.description,
            'location': evidence.location_found,
            'date': evidence.collection_date.isoformat() if evidence.collection_date else None
        })
    
    # Run pattern detection algorithm
    patterns = detect_patterns(evidence_data, min_confidence=data.get('min_confidence', 0.5))
    
    # Return results
    return jsonify({
        'message': f'Found {len(patterns)} potential patterns',
        'patterns': patterns
    }), 200

@analysis_bp.route('/analyze/probabilities', methods=['POST'])
@token_required
def analyze_probabilities(current_user):
    """Calculate probability scores for suspects based on evidence"""
    if not has_permission(current_user, 'analysis:run'):
        return jsonify({'message': 'Not authorized to run automated analysis'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    if 'case_id' not in data:
        return jsonify({'message': 'Case ID is required'}), 400
    
    # Get all suspects for the case
    case_suspects = Suspect.query.filter_by(case_id=data['case_id']).all()
    if not case_suspects:
        return jsonify({'message': 'No suspects found for this case'}), 404
    
    # Get evidence links for all suspects
    suspect_data = []
    for suspect in case_suspects:
        # Get evidence links
        evidence_links = []
        for link in suspect.evidence_links:
            evidence = Evidence.query.get(link.evidence_id)
            if evidence:
                evidence_links.append({
                    'evidence_id': link.evidence_id,
                    'evidence_type': evidence.evidence_type.value,
                    'match_status': link.match_status,
                    'confidence': link.confidence,
                    'reliability': evidence.reliability.value
                })
        
        suspect_data.append({
            'id': suspect.id,
            'name': suspect.get_full_name(),
            'status': suspect.status.value,
            'evidence_links': evidence_links
        })
    
    # Run probability calculation algorithm
    probabilities = calculate_suspect_probabilities(suspect_data)
    
    # Return results
    return jsonify({
        'message': f'Calculated probabilities for {len(probabilities)} suspects',
        'probabilities': probabilities
    }), 200
