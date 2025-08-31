from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
import os
import uuid
from werkzeug.utils import secure_filename
from src.database.db_init import db
from src.backend.models.evidence_model import Evidence, EvidenceFile, CustodyChange, EvidenceAnalysis
from src.backend.models.evidence_model import EvidenceType, EvidenceStatus, ReliabilityLevel
from src.backend.utils.auth import token_required, has_permission

evidence_bp = Blueprint('evidence', __name__)

@evidence_bp.route('/', methods=['GET'])
@token_required
def get_all_evidence(current_user):
    """Get a list of all evidence items with optional filtering"""
    if not has_permission(current_user, 'evidence:view'):
        return jsonify({'message': 'Not authorized to view evidence'}), 403
    
    # Parse query parameters
    case_id = request.args.get('case_id')
    evidence_type = request.args.get('type')
    status = request.args.get('status')
    collector_id = request.args.get('collector_id')
    key_evidence_only = request.args.get('key_only', 'false').lower() == 'true'
    search_term = request.args.get('search')
    
    # Build query
    query = Evidence.query
    
    if case_id:
        query = query.filter(Evidence.case_id == case_id)
    
    if evidence_type:
        query = query.filter(Evidence.evidence_type == EvidenceType(evidence_type))
        
    if status:
        query = query.filter(Evidence.status == EvidenceStatus(status))
        
    if collector_id:
        query = query.filter(Evidence.collector_id == collector_id)
        
    if key_evidence_only:
        query = query.filter(Evidence.is_key_evidence == True)
        
    if search_term:
        search = f"%{search_term}%"
        query = query.filter((Evidence.evidence_number.ilike(search)) | 
                           (Evidence.description.ilike(search)) | 
                           (Evidence.location_found.ilike(search)))
    
    # Execute query
    evidence_items = query.all()
    
    # Return results
    evidence_list = []
    for item in evidence_items:
        evidence_list.append({
            'id': item.id,
            'evidence_number': item.evidence_number,
            'case_id': item.case_id,
            'evidence_type': item.evidence_type.value,
            'description': item.description,
            'location_found': item.location_found,
            'collection_date': item.collection_date.isoformat() if item.collection_date else None,
            'status': item.status.value,
            'reliability': item.reliability.value,
            'is_key_evidence': item.is_key_evidence,
            'storage_location': item.storage_location,
            'chain_of_custody_complete': item.chain_of_custody_complete,
            'file_count': len(item.files),
            'analysis_count': len(item.analysis_results),
            'custody_changes': len(item.custody_chain)
        })
    
    return jsonify(evidence_list), 200

@evidence_bp.route('/<int:evidence_id>', methods=['GET'])
@token_required
def get_evidence(current_user, evidence_id):
    """Get details for a specific evidence item"""
    if not has_permission(current_user, 'evidence:view'):
        return jsonify({'message': 'Not authorized to view evidence'}), 403
    
    # Log access
    from src.backend.models.evidence_model import EvidenceLog
    log_entry = EvidenceLog(
        evidence_id=evidence_id,
        user_id=current_user.id,
        action='view',
        timestamp=datetime.utcnow(),
        ip_address=request.remote_addr,
        details=f"Evidence viewed by {current_user.username}"
    )
    db.session.add(log_entry)
    db.session.commit()
    
    evidence = Evidence.query.get_or_404(evidence_id)
    
    # Build detailed response
    evidence_detail = {
        'id': evidence.id,
        'evidence_number': evidence.evidence_number,
        'case_id': evidence.case_id,
        'evidence_type': evidence.evidence_type.value,
        'description': evidence.description,
        'location_found': evidence.location_found,
        'collection_date': evidence.collection_date.isoformat() if evidence.collection_date else None,
        'collector_id': evidence.collector_id,
        'collector_name': evidence.collector.get_full_name(),
        'status': evidence.status.value,
        'reliability': evidence.reliability.value,
        'is_key_evidence': evidence.is_key_evidence,
        'notes': evidence.notes,
        'storage_location': evidence.storage_location,
        'chain_of_custody_complete': evidence.chain_of_custody_complete,
        'files': [],
        'custody_chain': [],
        'analysis_results': []
    }
    
    # Add files
    for file in evidence.files:
        evidence_detail['files'].append({
            'id': file.id,
            'file_name': file.file_name,
            'file_type': file.file_type,
            'file_size': file.file_size,
            'upload_date': file.upload_date.isoformat() if file.upload_date else None,
            'uploader_name': file.uploader.get_full_name() if file.uploader else None
        })
    
    # Add custody chain
    for custody in evidence.custody_chain:
        from_name = custody.from_user.get_full_name() if custody.from_user else "Initial Collection"
        evidence_detail['custody_chain'].append({
            'id': custody.id,
            'from_user': from_name,
            'to_user': custody.to_user.get_full_name(),
            'change_time': custody.change_time.isoformat() if custody.change_time else None,
            'reason': custody.reason,
            'location': custody.location
        })
    
    # Add analysis results
    for analysis in evidence.analysis_results:
        evidence_detail['analysis_results'].append({
            'id': analysis.id,
            'analysis_date': analysis.analysis_date.isoformat() if analysis.analysis_date else None,
            'analysis_method': analysis.analysis_method,
            'conclusion': analysis.conclusion,
            'confidence_level': analysis.confidence_level,
            'analyst_name': analysis.analyst.get_full_name() if analysis.analyst else None
        })
    
    return jsonify(evidence_detail), 200

@evidence_bp.route('/', methods=['POST'])
@token_required
def create_evidence(current_user):
    """Create a new evidence item"""
    if not has_permission(current_user, 'evidence:create'):
        return jsonify({'message': 'Not authorized to create evidence'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['case_id', 'evidence_type', 'description', 'collection_date']
    if not all(k in data for k in required_fields):
        return jsonify({'message': 'Missing required fields', 'required': required_fields}), 400
    
    # Generate evidence number if not provided
    if not data.get('evidence_number'):
        case_id = data['case_id']
        count = Evidence.query.filter_by(case_id=case_id).count() + 1
        random_id = str(uuid.uuid4())[:6]
        data['evidence_number'] = f"E-{case_id}-{count:03d}-{random_id}"
    
    # Create new evidence object
    new_evidence = Evidence(
        evidence_number=data['evidence_number'],
        case_id=data['case_id'],
        evidence_type=EvidenceType(data['evidence_type']),
        description=data['description'],
        location_found=data.get('location_found'),
        collection_date=datetime.fromisoformat(data['collection_date']),
        collector_id=data.get('collector_id', current_user.id),
        status=EvidenceStatus(data.get('status', 'collected')),
        reliability=ReliabilityLevel(data.get('reliability', 'unknown')),
        is_key_evidence=data.get('is_key_evidence', False),
        notes=data.get('notes'),
        storage_location=data.get('storage_location')
    )
    
    # Save to database
    db.session.add(new_evidence)
    db.session.commit()
    
    # Create initial custody record
    initial_custody = CustodyChange(
        evidence_id=new_evidence.id,
        to_user_id=current_user.id,
        change_time=datetime.utcnow(),
        reason="Initial collection",
        location=data.get('location_found'),
        notes="Evidence collected and entered into system"
    )
    
    db.session.add(initial_custody)
    db.session.commit()
    
    # Log creation
    from src.backend.models.evidence_model import EvidenceLog
    log_entry = EvidenceLog(
        evidence_id=new_evidence.id,
        user_id=current_user.id,
        action='create',
        timestamp=datetime.utcnow(),
        ip_address=request.remote_addr,
        details=f"Evidence created by {current_user.username}"
    )
    db.session.add(log_entry)
    db.session.commit()
    
    return jsonify({
        'message': 'Evidence created successfully',
        'evidence_id': new_evidence.id,
        'evidence_number': new_evidence.evidence_number
    }), 201

@evidence_bp.route('/<int:evidence_id>', methods=['PUT'])
@token_required
def update_evidence(current_user, evidence_id):
    """Update an existing evidence item"""
    if not has_permission(current_user, 'evidence:update'):
        return jsonify({'message': 'Not authorized to update evidence'}), 403
    
    evidence = Evidence.query.get_or_404(evidence_id)
    data = request.get_json()
    
    # Update fields
    if 'description' in data:
        evidence.description = data['description']
    if 'evidence_type' in data:
        evidence.evidence_type = EvidenceType(data['evidence_type'])
    if 'location_found' in data:
        evidence.location_found = data['location_found']
    if 'collection_date' in data:
        evidence.collection_date = datetime.fromisoformat(data['collection_date']) if data['collection_date'] else None
    if 'status' in data:
        evidence.status = EvidenceStatus(data['status'])
    if 'reliability' in data:
        evidence.reliability = ReliabilityLevel(data['reliability'])
    if 'is_key_evidence' in data:
        evidence.is_key_evidence = data['is_key_evidence']
    if 'notes' in data:
        evidence.notes = data['notes']
    if 'storage_location' in data:
        evidence.storage_location = data['storage_location']
    if 'chain_of_custody_complete' in data:
        evidence.chain_of_custody_complete = data['chain_of_custody_complete']
    
    # Save changes
    db.session.commit()
    
    # Log update
    from src.backend.models.evidence_model import EvidenceLog
    log_entry = EvidenceLog(
        evidence_id=evidence.id,
        user_id=current_user.id,
        action='update',
        timestamp=datetime.utcnow(),
        ip_address=request.remote_addr,
        details=f"Evidence updated by {current_user.username}"
    )
    db.session.add(log_entry)
    db.session.commit()
    
    return jsonify({'message': 'Evidence updated successfully'}), 200

@evidence_bp.route('/<int:evidence_id>/custody', methods=['POST'])
@token_required
def add_custody_change(current_user, evidence_id):
    """Record a custody change for an evidence item"""
    if not has_permission(current_user, 'evidence:update_custody'):
        return jsonify({'message': 'Not authorized to update custody chain'}), 403
    
    evidence = Evidence.query.get_or_404(evidence_id)
    data = request.get_json()
    
    # Validate required fields
    if 'to_user_id' not in data:
        return jsonify({'message': 'Missing required field: to_user_id'}), 400
    
    # Find the most recent custody record to use as the from_user
    last_custody = CustodyChange.query.filter_by(evidence_id=evidence_id).order_by(CustodyChange.change_time.desc()).first()
    from_user_id = last_custody.to_user_id if last_custody else None
    
    # Create custody change record
    custody_change = CustodyChange(
        evidence_id=evidence_id,
        from_user_id=from_user_id,
        to_user_id=data['to_user_id'],
        change_time=datetime.utcnow(),
        reason=data.get('reason', 'Custody transfer'),
        location=data.get('location'),
        witness_id=data.get('witness_id'),
        notes=data.get('notes')
    )
    
    # Save to database
    db.session.add(custody_change)
    db.session.commit()
    
    # Log custody change
    from src.backend.models.evidence_model import EvidenceLog
    log_entry = EvidenceLog(
        evidence_id=evidence_id,
        user_id=current_user.id,
        action='custody_change',
        timestamp=datetime.utcnow(),
        ip_address=request.remote_addr,
        details=f"Custody changed from {from_user_id} to {data['to_user_id']}"
    )
    db.session.add(log_entry)
    db.session.commit()
    
    return jsonify({
        'message': 'Custody change recorded successfully',
        'custody_id': custody_change.id
    }), 201

@evidence_bp.route('/<int:evidence_id>/analysis', methods=['POST'])
@token_required
def add_evidence_analysis(current_user, evidence_id):
    """Add analysis results for an evidence item"""
    if not has_permission(current_user, 'evidence:analyze'):
        return jsonify({'message': 'Not authorized to add analysis'}), 403
    
    evidence = Evidence.query.get_or_404(evidence_id)
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ('analysis_method', 'analysis_details')):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Create analysis record
    analysis = EvidenceAnalysis(
        evidence_id=evidence_id,
        analyst_id=current_user.id,
        analysis_date=datetime.utcnow(),
        analysis_method=data['analysis_method'],
        equipment_used=data.get('equipment_used'),
        analysis_details=data['analysis_details'],
        conclusion=data.get('conclusion'),
        confidence_level=data.get('confidence_level'),
        report_file=data.get('report_file')
    )
    
    # Save to database
    db.session.add(analysis)
    db.session.commit()
    
    # Update evidence status if specified
    if data.get('update_evidence_status'):
        evidence.status = EvidenceStatus(data.get('new_status', 'analyzed'))
        evidence.reliability = ReliabilityLevel(data.get('new_reliability', evidence.reliability.value))
        db.session.commit()
    
    # Log analysis addition
    from src.backend.models.evidence_model import EvidenceLog
    log_entry = EvidenceLog(
        evidence_id=evidence_id,
        user_id=current_user.id,
        action='add_analysis',
        timestamp=datetime.utcnow(),
        ip_address=request.remote_addr,
        details=f"Analysis added by {current_user.username}: {data['analysis_method']}"
    )
    db.session.add(log_entry)
    db.session.commit()
    
    return jsonify({
        'message': 'Analysis added successfully',
        'analysis_id': analysis.id
    }), 201

@evidence_bp.route('/<int:evidence_id>/file', methods=['POST'])
@token_required
def upload_evidence_file(current_user, evidence_id):
    """Upload a file for an evidence item"""
    if not has_permission(current_user, 'evidence:update'):
        return jsonify({'message': 'Not authorized to update evidence'}), 403
    
    evidence = Evidence.query.get_or_404(evidence_id)
    
    # Check if file is in request
    if 'file' not in request.files:
        return jsonify({'message': 'No file part in the request'}), 400
    
    file = request.files['file']
    
    # Check if file was actually selected
    if file.filename == '':
        return jsonify({'message': 'No file selected'}), 400
    
    # Get file metadata
    file_type = request.form.get('file_type', 'unknown')
    is_public = request.form.get('is_public', 'false').lower() == 'true'
    
    if file:
        # Create secure filename to prevent path traversal attacks
        filename = secure_filename(file.filename)
        # Generate unique filename with timestamp to avoid collisions
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        unique_filename = f"{timestamp}_{filename}"
        
        # Ensure evidence file directory exists
        case_id = evidence.case_id
        evidence_dir = os.path.join(current_app.config.get('UPLOAD_FOLDER', 'uploads'), 
                                   f"case_{case_id}", f"evidence_{evidence_id}")
        os.makedirs(evidence_dir, exist_ok=True)
        
        # Save file
        file_path = os.path.join(evidence_dir, unique_filename)
        file.save(file_path)
        
        # Calculate file size
        file_size = os.path.getsize(file_path)
        
        # TODO: Calculate content hash for integrity verification
        content_hash = "placeholder_hash"  # Replace with actual hash calculation
        
        # Create file record
        evidence_file = EvidenceFile(
            evidence_id=evidence_id,
            file_name=filename,
            file_type=file_type,
            file_path=file_path,
            file_size=file_size,
            content_hash=content_hash,
            upload_date=datetime.utcnow(),
            uploader_id=current_user.id,
            is_public=is_public
        )
        
        # Save to database
        db.session.add(evidence_file)
        db.session.commit()
        
        # Log file upload
        from src.backend.models.evidence_model import EvidenceLog
        log_entry = EvidenceLog(
            evidence_id=evidence_id,
            user_id=current_user.id,
            action='upload_file',
            timestamp=datetime.utcnow(),
            ip_address=request.remote_addr,
            details=f"File uploaded: {filename} ({file_size} bytes)"
        )
        db.session.add(log_entry)
        db.session.commit()
        
        return jsonify({
            'message': 'File uploaded successfully',
            'file_id': evidence_file.id,
            'file_name': filename,
            'file_size': file_size
        }), 201
    
    return jsonify({'message': 'Error uploading file'}), 500
