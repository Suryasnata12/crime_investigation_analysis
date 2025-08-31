from flask import Blueprint, request, jsonify
from datetime import datetime
from src.database.db_init import db
from src.backend.models.suspect_model import Suspect, SuspectStatus, SuspectEvidenceLink, SuspectInterview, SuspectAlibi
from src.backend.models.evidence_model import Evidence
from src.backend.utils.auth import token_required, has_permission

suspect_bp = Blueprint('suspect', __name__)

@suspect_bp.route('/', methods=['GET'])
@token_required
def get_all_suspects(current_user):
    """Get a list of all suspects with optional filtering"""
    if not has_permission(current_user, 'suspect:view'):
        return jsonify({'message': 'Not authorized to view suspects'}), 403
    
    # Parse query parameters
    case_id = request.args.get('case_id')
    status = request.args.get('status')
    search_term = request.args.get('search')
    
    # Build query
    query = Suspect.query
    
    if case_id:
        query = query.filter(Suspect.case_id == case_id)
    
    if status:
        query = query.filter(Suspect.status == SuspectStatus(status))
        
    if search_term:
        search = f"%{search_term}%"
        query = query.filter((Suspect.first_name.ilike(search)) | 
                           (Suspect.last_name.ilike(search)) | 
                           (Suspect.alias.ilike(search)))
    
    # Execute query
    suspects = query.all()
    
    # Return results
    suspect_list = []
    for suspect in suspects:
        suspect_list.append({
            'id': suspect.id,
            'case_id': suspect.case_id,
            'name': suspect.get_full_name(),
            'alias': suspect.alias,
            'status': suspect.status.value,
            'evidence_count': len(suspect.evidence_links),
            'interview_count': len(suspect.interviews),
            'risk_assessment': suspect.risk_assessment,
            'match_score': suspect.calculate_match_score()
        })
    
    return jsonify(suspect_list), 200

@suspect_bp.route('/<int:suspect_id>', methods=['GET'])
@token_required
def get_suspect(current_user, suspect_id):
    """Get details for a specific suspect"""
    if not has_permission(current_user, 'suspect:view'):
        return jsonify({'message': 'Not authorized to view suspects'}), 403
    
    suspect = Suspect.query.get_or_404(suspect_id)
    
    # Build detailed response
    suspect_detail = {
        'id': suspect.id,
        'case_id': suspect.case_id,
        'first_name': suspect.first_name,
        'last_name': suspect.last_name,
        'alias': suspect.alias,
        'date_of_birth': suspect.date_of_birth.isoformat() if suspect.date_of_birth else None,
        'gender': suspect.gender,
        'height': suspect.height,
        'weight': suspect.weight,
        'identifying_features': suspect.identifying_features,
        'last_known_address': suspect.last_known_address,
        'contact_information': suspect.contact_information,
        'occupation': suspect.occupation,
        'status': suspect.status.value,
        'notes': suspect.notes,
        'created_at': suspect.created_at.isoformat() if suspect.created_at else None,
        'updated_at': suspect.updated_at.isoformat() if suspect.updated_at else None,
        'added_by': suspect.added_by,
        'risk_assessment': suspect.risk_assessment,
        'match_score': suspect.calculate_match_score(),
        'evidence_links': [],
        'interviews': [],
        'alibis': []
    }
    
    # Add evidence links
    for link in suspect.evidence_links:
        evidence = Evidence.query.get(link.evidence_id)
        suspect_detail['evidence_links'].append({
            'id': link.id,
            'evidence_id': link.evidence_id,
            'evidence_number': evidence.evidence_number if evidence else None,
            'evidence_type': evidence.evidence_type.value if evidence else None,
            'match_status': link.match_status,
            'match_details': link.match_details,
            'confidence': link.confidence,
            'linked_at': link.linked_at.isoformat() if link.linked_at else None
        })
    
    # Add interviews
    for interview in suspect.interviews:
        suspect_detail['interviews'].append({
            'id': interview.id,
            'interview_date': interview.interview_date.isoformat() if interview.interview_date else None,
            'location': interview.location,
            'duration_minutes': interview.duration_minutes,
            'summary': interview.summary,
            'attorney_present': interview.attorney_present,
            'credibility_assessment': interview.credibility_assessment,
            'key_statements': interview.key_statements
        })
    
    # Add alibis
    for alibi in suspect.alibis:
        suspect_detail['alibis'].append({
            'id': alibi.id,
            'alibi_start_time': alibi.alibi_start_time.isoformat() if alibi.alibi_start_time else None,
            'alibi_end_time': alibi.alibi_end_time.isoformat() if alibi.alibi_end_time else None,
            'location': alibi.location,
            'description': alibi.description,
            'witness_name': alibi.witness_name,
            'verification_status': alibi.verification_status
        })
    
    return jsonify(suspect_detail), 200

@suspect_bp.route('/', methods=['POST'])
@token_required
def create_suspect(current_user):
    """Create a new suspect"""
    if not has_permission(current_user, 'suspect:create'):
        return jsonify({'message': 'Not authorized to create suspects'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['case_id', 'first_name', 'last_name']
    if not all(k in data for k in required_fields):
        return jsonify({'message': 'Missing required fields', 'required': required_fields}), 400
    
    # Create new suspect object
    new_suspect = Suspect(
        case_id=data['case_id'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        alias=data.get('alias'),
        date_of_birth=datetime.fromisoformat(data['date_of_birth']) if data.get('date_of_birth') else None,
        gender=data.get('gender'),
        height=data.get('height'),
        weight=data.get('weight'),
        identifying_features=data.get('identifying_features'),
        last_known_address=data.get('last_known_address'),
        contact_information=data.get('contact_information'),
        occupation=data.get('occupation'),
        status=SuspectStatus(data.get('status', 'person_of_interest')),
        notes=data.get('notes'),
        created_at=datetime.utcnow(),
        added_by=current_user.id,
        risk_assessment=data.get('risk_assessment')
    )
    
    # Save to database
    db.session.add(new_suspect)
    db.session.commit()
    
    return jsonify({
        'message': 'Suspect created successfully',
        'suspect_id': new_suspect.id
    }), 201

@suspect_bp.route('/<int:suspect_id>', methods=['PUT'])
@token_required
def update_suspect(current_user, suspect_id):
    """Update an existing suspect"""
    if not has_permission(current_user, 'suspect:update'):
        return jsonify({'message': 'Not authorized to update suspects'}), 403
    
    suspect = Suspect.query.get_or_404(suspect_id)
    data = request.get_json()
    
    # Update fields
    if 'first_name' in data:
        suspect.first_name = data['first_name']
    if 'last_name' in data:
        suspect.last_name = data['last_name']
    if 'alias' in data:
        suspect.alias = data['alias']
    if 'date_of_birth' in data:
        suspect.date_of_birth = datetime.fromisoformat(data['date_of_birth']) if data['date_of_birth'] else None
    if 'gender' in data:
        suspect.gender = data['gender']
    if 'height' in data:
        suspect.height = data['height']
    if 'weight' in data:
        suspect.weight = data['weight']
    if 'identifying_features' in data:
        suspect.identifying_features = data['identifying_features']
    if 'last_known_address' in data:
        suspect.last_known_address = data['last_known_address']
    if 'contact_information' in data:
        suspect.contact_information = data['contact_information']
    if 'occupation' in data:
        suspect.occupation = data['occupation']
    if 'status' in data:
        suspect.status = SuspectStatus(data['status'])
    if 'notes' in data:
        suspect.notes = data['notes']
    if 'risk_assessment' in data:
        suspect.risk_assessment = data['risk_assessment']
    
    # Update updated_at timestamp
    suspect.updated_at = datetime.utcnow()
    
    # Save changes
    db.session.commit()
    
    return jsonify({'message': 'Suspect updated successfully'}), 200

@suspect_bp.route('/<int:suspect_id>/evidence', methods=['POST'])
@token_required
def link_evidence(current_user, suspect_id):
    """Link evidence to a suspect"""
    if not has_permission(current_user, 'suspect:update'):
        return jsonify({'message': 'Not authorized to update suspects'}), 403
    
    suspect = Suspect.query.get_or_404(suspect_id)
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ('evidence_id', 'match_status')):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Check if evidence exists
    evidence = Evidence.query.get(data['evidence_id'])
    if not evidence:
        return jsonify({'message': 'Evidence not found'}), 404
    
    # Check if link already exists
    existing_link = SuspectEvidenceLink.query.filter_by(
        suspect_id=suspect_id,
        evidence_id=data['evidence_id']
    ).first()
    
    if existing_link:
        # Update existing link
        existing_link.match_status = data['match_status']
        existing_link.match_details = data.get('match_details')
        existing_link.linked_by = current_user.id
        existing_link.linked_at = datetime.utcnow()
        existing_link.confidence = data.get('confidence')
        existing_link.verification_method = data.get('verification_method')
        
        db.session.commit()
        
        return jsonify({
            'message': 'Evidence link updated successfully',
            'link_id': existing_link.id
        }), 200
    else:
        # Create new link
        new_link = SuspectEvidenceLink(
            suspect_id=suspect_id,
            evidence_id=data['evidence_id'],
            match_status=data['match_status'],
            match_details=data.get('match_details'),
            linked_by=current_user.id,
            linked_at=datetime.utcnow(),
            confidence=data.get('confidence'),
            verification_method=data.get('verification_method')
        )
        
        db.session.add(new_link)
        db.session.commit()
        
        return jsonify({
            'message': 'Evidence linked successfully',
            'link_id': new_link.id
        }), 201

@suspect_bp.route('/<int:suspect_id>/interview', methods=['POST'])
@token_required
def add_interview(current_user, suspect_id):
    """Add an interview record for a suspect"""
    if not has_permission(current_user, 'suspect:interview'):
        return jsonify({'message': 'Not authorized to add interviews'}), 403
    
    suspect = Suspect.query.get_or_404(suspect_id)
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ('interview_date', 'summary')):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Create interview record
    interview = SuspectInterview(
        suspect_id=suspect_id,
        interviewer_id=current_user.id,
        interview_date=datetime.fromisoformat(data['interview_date']),
        location=data.get('location'),
        duration_minutes=data.get('duration_minutes'),
        summary=data['summary'],
        transcript_file=data.get('transcript_file'),
        recording_file=data.get('recording_file'),
        attorney_present=data.get('attorney_present', False),
        witness_present=data.get('witness_present', False),
        miranda_given=data.get('miranda_given'),
        credibility_assessment=data.get('credibility_assessment'),
        key_statements=data.get('key_statements'),
        notes=data.get('notes')
    )
    
    # Save to database
    db.session.add(interview)
    db.session.commit()
    
    return jsonify({
        'message': 'Interview added successfully',
        'interview_id': interview.id
    }), 201

@suspect_bp.route('/<int:suspect_id>/alibi', methods=['POST'])
@token_required
def add_alibi(current_user, suspect_id):
    """Add an alibi record for a suspect"""
    if not has_permission(current_user, 'suspect:update'):
        return jsonify({'message': 'Not authorized to update suspects'}), 403
    
    suspect = Suspect.query.get_or_404(suspect_id)
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['alibi_start_time', 'alibi_end_time', 'location', 'description']
    if not all(k in data for k in required_fields):
        return jsonify({'message': 'Missing required fields', 'required': required_fields}), 400
    
    # Create alibi record
    alibi = SuspectAlibi(
        suspect_id=suspect_id,
        alibi_start_time=datetime.fromisoformat(data['alibi_start_time']),
        alibi_end_time=datetime.fromisoformat(data['alibi_end_time']),
        location=data['location'],
        description=data['description'],
        witness_name=data.get('witness_name'),
        witness_contact=data.get('witness_contact'),
        verification_status=data.get('verification_status', 'unverified'),
        verification_method=data.get('verification_method'),
        verified_by=current_user.id if data.get('verification_status') != 'unverified' else None,
        verification_date=datetime.utcnow() if data.get('verification_status') != 'unverified' else None,
        notes=data.get('notes')
    )
    
    # Save to database
    db.session.add(alibi)
    db.session.commit()
    
    return jsonify({
        'message': 'Alibi added successfully',
        'alibi_id': alibi.id
    }), 201
