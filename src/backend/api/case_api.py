from flask import Blueprint, request, jsonify
from datetime import datetime
from src.database.db_init import db
from src.backend.models.case_model import Case, CaseNote, TimelineEvent, CaseStatus, CasePriority
from src.backend.models.user_model import User
from src.backend.utils.auth import token_required, has_permission
import uuid

case_bp = Blueprint('case', __name__)

@case_bp.route('/', methods=['GET'])
@token_required
def get_all_cases(current_user):
    """Get a list of all cases with optional filtering"""
    if not has_permission(current_user, 'case:view'):
        return jsonify({'message': 'Not authorized to view cases'}), 403
    
    # Parse query parameters
    status = request.args.get('status')
    priority = request.args.get('priority')
    investigator_id = request.args.get('investigator_id')
    search_term = request.args.get('search')
    sort_by = request.args.get('sort_by', 'opened_date')
    sort_dir = request.args.get('sort_dir', 'desc')
    
    # Build query
    query = Case.query
    
    if status:
        query = query.filter(Case.status == CaseStatus(status))
    
    if priority:
        query = query.filter(Case.priority == CasePriority(priority))
        
    if investigator_id:
        query = query.filter(Case.investigator_id == investigator_id)
        
    if search_term:
        search = f"%{search_term}%"
        query = query.filter((Case.title.ilike(search)) | 
                           (Case.case_number.ilike(search)) | 
                           (Case.description.ilike(search)))
    
    # Apply sorting
    if sort_by == 'opened_date':
        if sort_dir == 'desc':
            query = query.order_by(Case.opened_date.desc())
        else:
            query = query.order_by(Case.opened_date)
    elif sort_by == 'priority':
        if sort_dir == 'desc':
            query = query.order_by(Case.priority.desc())
        else:
            query = query.order_by(Case.priority)
    elif sort_by == 'title':
        if sort_dir == 'desc':
            query = query.order_by(Case.title.desc())
        else:
            query = query.order_by(Case.title)
    
    # Execute query
    cases = query.all()
    
    # Return results
    case_list = []
    for case in cases:
        case_list.append({
            'id': case.id,
            'case_number': case.case_number,
            'title': case.title,
            'status': case.status.value,
            'priority': case.priority.value,
            'crime_type': case.crime_type,
            'opened_date': case.opened_date.isoformat() if case.opened_date else None,
            'investigator_id': case.investigator_id,
            'investigator_name': User.query.get(case.investigator_id).get_full_name(),
            'evidence_count': len(case.evidence_items),
            'suspect_count': len(case.suspects)
        })
    
    return jsonify(case_list), 200

@case_bp.route('/<int:case_id>', methods=['GET'])
@token_required
def get_case(current_user, case_id):
    """Get details for a specific case"""
    if not has_permission(current_user, 'case:view'):
        return jsonify({'message': 'Not authorized to view cases'}), 403
    
    case = Case.query.get_or_404(case_id)
    
    # Collect all investigators for the UI dropdown
    investigators = User.query.filter_by(role_id=2).all()  # Assuming role_id 2 is "Investigator"
    investigator_list = [{'id': i.id, 'name': i.get_full_name()} for i in investigators]
    
    # Build response
    response = {
        'id': case.id,
        'case_number': case.case_number,
        'title': case.title,
        'description': case.description,
        'status': case.status.value,
        'priority': case.priority.value,
        'crime_type': case.crime_type,
        'crime_date': case.crime_date.isoformat() if case.crime_date else None,
        'crime_location': case.crime_location,
        'opened_date': case.opened_date.isoformat() if case.opened_date else None,
        'closed_date': case.closed_date.isoformat() if case.closed_date else None,
        'investigator_id': case.investigator_id,
        'investigator_name': User.query.get(case.investigator_id).get_full_name(),
        'department': case.department,
        'available_investigators': investigator_list,
        'evidence_count': len(case.evidence_items),
        'suspect_count': len(case.suspects),
        'timeline_count': len(case.timeline_events),
        'note_count': len(case.notes),
        'report_count': len(case.reports)
    }
    
    return jsonify(response), 200

@case_bp.route('/', methods=['POST'])
@token_required
def create_case(current_user):
    """Create a new case"""
    if not has_permission(current_user, 'case:create'):
        return jsonify({'message': 'Not authorized to create cases'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ('title', 'crime_type')):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Generate case number if not provided
    if not data.get('case_number'):
        year = datetime.now().year
        month = datetime.now().month
        random_id = str(uuid.uuid4())[:8]
        data['case_number'] = f"CR-{year}-{month:02d}-{random_id}"
    
    # Create new case object
    new_case = Case(
        case_number=data['case_number'],
        title=data['title'],
        description=data.get('description', ''),
        status=CaseStatus(data.get('status', 'active')),
        priority=CasePriority(data.get('priority', 'medium')),
        crime_type=data['crime_type'],
        crime_date=datetime.fromisoformat(data['crime_date']) if data.get('crime_date') else None,
        crime_location=data.get('crime_location'),
        opened_date=datetime.utcnow(),
        investigator_id=data.get('investigator_id', current_user.id),
        department=data.get('department', current_user.department)
    )
    
    # Save to database
    db.session.add(new_case)
    db.session.commit()
    
    # Create initial case note
    initial_note = CaseNote(
        case_id=new_case.id,
        user_id=current_user.id,
        note_text=f"Case created by {current_user.get_full_name()}.",
        created_at=datetime.utcnow()
    )
    
    db.session.add(initial_note)
    db.session.commit()
    
    return jsonify({
        'message': 'Case created successfully',
        'case_id': new_case.id,
        'case_number': new_case.case_number
    }), 201

@case_bp.route('/<int:case_id>', methods=['PUT'])
@token_required
def update_case(current_user, case_id):
    """Update an existing case"""
    if not has_permission(current_user, 'case:update'):
        return jsonify({'message': 'Not authorized to update cases'}), 403
    
    case = Case.query.get_or_404(case_id)
    data = request.get_json()
    
    # Update fields
    if 'title' in data:
        case.title = data['title']
    if 'description' in data:
        case.description = data['description']
    if 'status' in data:
        case.status = CaseStatus(data['status'])
        # If closing the case, set closed date
        if data['status'] == 'closed' and not case.closed_date:
            case.closed_date = datetime.utcnow()
        # If reopening a closed case, clear closed date
        elif data['status'] != 'closed' and case.closed_date:
            case.closed_date = None
    if 'priority' in data:
        case.priority = CasePriority(data['priority'])
    if 'crime_type' in data:
        case.crime_type = data['crime_type']
    if 'crime_date' in data:
        case.crime_date = datetime.fromisoformat(data['crime_date']) if data['crime_date'] else None
    if 'crime_location' in data:
        case.crime_location = data['crime_location']
    if 'investigator_id' in data:
        case.investigator_id = data['investigator_id']
    if 'department' in data:
        case.department = data['department']
    
    # Save changes
    db.session.commit()
    
    # Add note about update if requested
    if data.get('add_update_note'):
        update_note = CaseNote(
            case_id=case.id,
            user_id=current_user.id,
            note_text=f"Case updated by {current_user.get_full_name()}: {data.get('update_note', 'No details provided.')}",
            created_at=datetime.utcnow()
        )
        db.session.add(update_note)
        db.session.commit()
    
    return jsonify({'message': 'Case updated successfully'}), 200

@case_bp.route('/<int:case_id>/timeline', methods=['GET'])
@token_required
def get_case_timeline(current_user, case_id):
    """Get timeline events for a case"""
    if not has_permission(current_user, 'case:view'):
        return jsonify({'message': 'Not authorized to view cases'}), 403
    
    Case.query.get_or_404(case_id)  # Check case exists
    
    timeline_events = TimelineEvent.query.filter_by(case_id=case_id).order_by(TimelineEvent.event_time).all()
    
    events = []
    for event in timeline_events:
        events.append({
            'id': event.id,
            'event_time': event.event_time.isoformat(),
            'event_description': event.event_description,
            'event_location': event.event_location,
            'evidence_id': event.evidence_id,
            'created_by': User.query.get(event.created_by).get_full_name(),
            'is_verified': event.is_verified,
            'verification_method': event.verification_method
        })
    
    return jsonify(events), 200

@case_bp.route('/<int:case_id>/timeline', methods=['POST'])
@token_required
def add_timeline_event(current_user, case_id):
    """Add a new timeline event to a case"""
    if not has_permission(current_user, 'case:update'):
        return jsonify({'message': 'Not authorized to update cases'}), 403
    
    Case.query.get_or_404(case_id)  # Check case exists
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ('event_time', 'event_description')):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Create new timeline event
    new_event = TimelineEvent(
        case_id=case_id,
        event_time=datetime.fromisoformat(data['event_time']),
        event_description=data['event_description'],
        event_location=data.get('event_location'),
        evidence_id=data.get('evidence_id'),
        created_by=current_user.id,
        is_verified=data.get('is_verified', False),
        verification_method=data.get('verification_method')
    )
    
    # Save to database
    db.session.add(new_event)
    db.session.commit()
    
    return jsonify({
        'message': 'Timeline event added successfully',
        'event_id': new_event.id
    }), 201

@case_bp.route('/<int:case_id>/notes', methods=['GET'])
@token_required
def get_case_notes(current_user, case_id):
    """Get notes for a case"""
    if not has_permission(current_user, 'case:view'):
        return jsonify({'message': 'Not authorized to view cases'}), 403
    
    Case.query.get_or_404(case_id)  # Check case exists
    
    # Handle private notes
    if has_permission(current_user, 'notes:view_all'):
        notes = CaseNote.query.filter_by(case_id=case_id).order_by(CaseNote.created_at.desc()).all()
    else:
        notes = CaseNote.query.filter(
            CaseNote.case_id == case_id,
            (CaseNote.is_private == False) | (CaseNote.user_id == current_user.id)
        ).order_by(CaseNote.created_at.desc()).all()
    
    notes_list = []
    for note in notes:
        notes_list.append({
            'id': note.id,
            'note_text': note.note_text,
            'created_at': note.created_at.isoformat(),
            'updated_at': note.updated_at.isoformat() if note.updated_at else None,
            'user_id': note.user_id,
            'user_name': User.query.get(note.user_id).get_full_name(),
            'is_private': note.is_private
        })
    
    return jsonify(notes_list), 200

@case_bp.route('/<int:case_id>/notes', methods=['POST'])
@token_required
def add_case_note(current_user, case_id):
    """Add a new note to a case"""
    if not has_permission(current_user, 'case:update'):
        return jsonify({'message': 'Not authorized to update cases'}), 403
    
    Case.query.get_or_404(case_id)  # Check case exists
    data = request.get_json()
    
    # Validate required fields
    if 'note_text' not in data or not data['note_text'].strip():
        return jsonify({'message': 'Note text is required'}), 400
    
    # Create new note
    new_note = CaseNote(
        case_id=case_id,
        user_id=current_user.id,
        note_text=data['note_text'],
        created_at=datetime.utcnow(),
        is_private=data.get('is_private', False)
    )
    
    # Save to database
    db.session.add(new_note)
    db.session.commit()
    
    return jsonify({
        'message': 'Note added successfully',
        'note_id': new_note.id
    }), 201
