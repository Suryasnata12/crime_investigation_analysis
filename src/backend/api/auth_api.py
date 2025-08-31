from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from src.database.db_init import db
from src.backend.models.user_model import User, Role, UserActivity
from src.backend.utils.auth import token_required, generate_token, has_permission

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate user and return token"""
    auth = request.json
    
    if not auth or not auth.get('username') or not auth.get('password'):
        return jsonify({'message': 'Authentication required'}), 401
        
    user = User.query.filter_by(username=auth.get('username')).first()
    
    if not user:
        return jsonify({'message': 'Invalid credentials'}), 401
        
    if not user.is_active:
        return jsonify({'message': 'Account is inactive'}), 401
        
    if user.check_password(auth.get('password')):
        # Create authentication token
        token = generate_token(user, expiration_minutes=480, fresh_login=True)
        
        # Record login activity
        activity = UserActivity(
            user_id=user.id,
            activity_type='login',
            description=f"User logged in from {request.remote_addr}",
            ip_address=request.remote_addr,
            timestamp=datetime.utcnow()
        )
        db.session.add(activity)
        db.session.commit()
        
        # Update last login time
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'token': token,
            'user': {
                'id': user.id,
                'username': user.username,
                'full_name': user.get_full_name(),
                'role': user.role.name,
                'department': user.department
            }
        }), 200
        
    return jsonify({'message': 'Invalid credentials'}), 401

@auth_bp.route('/register', methods=['POST'])
@token_required
def register(current_user):
    """Register a new user (admin only)"""
    if not has_permission(current_user, 'user:create'):
        return jsonify({'message': 'Not authorized to create users'}), 403
        
    data = request.json
    
    # Validate required fields
    required_fields = ['username', 'password', 'email', 'first_name', 'last_name', 'role_id']
    if not all(k in data for k in required_fields):
        return jsonify({'message': 'Missing required fields', 'required': required_fields}), 400
    
    # Check if username already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 409
        
    # Check if email already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists'}), 409
    
    # Validate role exists
    role = Role.query.get(data['role_id'])
    if not role:
        return jsonify({'message': 'Invalid role ID'}), 400
    
    # Create new user
    new_user = User(
        username=data['username'],
        email=data['email'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        role_id=data['role_id'],
        badge_number=data.get('badge_number'),
        department=data.get('department'),
        created_at=datetime.utcnow(),
        is_active=True
    )
    
    # Set password hash
    new_user.set_password(data['password'])
    
    # Save user to database
    db.session.add(new_user)
    db.session.commit()
    
    # Log user creation
    activity = UserActivity(
        user_id=current_user.id,
        activity_type='user_create',
        description=f"Created user: {data['username']}",
        ip_address=request.remote_addr,
        timestamp=datetime.utcnow()
    )
    db.session.add(activity)
    db.session.commit()
    
    return jsonify({
        'message': 'User created successfully',
        'user_id': new_user.id
    }), 201

@auth_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    """Get current user profile"""
    profile = {
        'id': current_user.id,
        'username': current_user.username,
        'email': current_user.email,
        'first_name': current_user.first_name,
        'last_name': current_user.last_name,
        'badge_number': current_user.badge_number,
        'department': current_user.department,
        'role': {
            'id': current_user.role_id,
            'name': current_user.role.name,
            'description': current_user.role.description
        },
        'created_at': current_user.created_at.isoformat() if current_user.created_at else None,
        'last_login': current_user.last_login.isoformat() if current_user.last_login else None
    }
    
    return jsonify(profile), 200

@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    """Update current user profile"""
    data = request.json
    
    # Fields allowed to be updated by the user
    allowed_fields = ['email', 'first_name', 'last_name', 'badge_number', 'department']
    
    for field in allowed_fields:
        if field in data:
            setattr(current_user, field, data[field])
    
    # Special handling for password change
    if 'current_password' in data and 'new_password' in data:
        if not current_user.check_password(data['current_password']):
            return jsonify({'message': 'Current password is incorrect'}), 400
            
        current_user.set_password(data['new_password'])
        
        # Log password change
        activity = UserActivity(
            user_id=current_user.id,
            activity_type='password_change',
            description=f"Password changed",
            ip_address=request.remote_addr,
            timestamp=datetime.utcnow()
        )
        db.session.add(activity)
    
    # Save changes
    db.session.commit()
    
    return jsonify({'message': 'Profile updated successfully'}), 200

@auth_bp.route('/users', methods=['GET'])
@token_required
def get_users(current_user):
    """Get list of all users (admin only)"""
    if not has_permission(current_user, 'user:view_all'):
        return jsonify({'message': 'Not authorized to view all users'}), 403
    
    users = User.query.all()
    user_list = []
    
    for user in users:
        user_list.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'full_name': user.get_full_name(),
            'badge_number': user.badge_number,
            'department': user.department,
            'role_id': user.role_id,
            'role_name': user.role.name,
            'is_active': user.is_active,
            'last_login': user.last_login.isoformat() if user.last_login else None
        })
    
    return jsonify(user_list), 200

@auth_bp.route('/users/<int:user_id>', methods=['GET'])
@token_required
def get_user(current_user, user_id):
    """Get details for a specific user (admin only)"""
    # Allow users to view their own profile
    if current_user.id != user_id and not has_permission(current_user, 'user:view_all'):
        return jsonify({'message': 'Not authorized to view this user'}), 403
    
    user = User.query.get_or_404(user_id)
    
    user_detail = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'badge_number': user.badge_number,
        'department': user.department,
        'role': {
            'id': user.role_id,
            'name': user.role.name,
            'description': user.role.description
        },
        'created_at': user.created_at.isoformat() if user.created_at else None,
        'last_login': user.last_login.isoformat() if user.last_login else None,
        'is_active': user.is_active
    }
    
    # Include additional information for admins
    if has_permission(current_user, 'user:view_all'):
        # Get recent activity
        activities = UserActivity.query.filter_by(user_id=user.id).order_by(UserActivity.timestamp.desc()).limit(10).all()
        activity_list = []
        
        for activity in activities:
            activity_list.append({
                'activity_type': activity.activity_type,
                'description': activity.description,
                'timestamp': activity.timestamp.isoformat() if activity.timestamp else None,
                'ip_address': activity.ip_address
            })
        
        user_detail['recent_activity'] = activity_list
    
    return jsonify(user_detail), 200

@auth_bp.route('/users/<int:user_id>', methods=['PUT'])
@token_required
def update_user(current_user, user_id):
    """Update a specific user (admin only)"""
    if not has_permission(current_user, 'user:update'):
        return jsonify({'message': 'Not authorized to update users'}), 403
    
    user = User.query.get_or_404(user_id)
    data = request.json
    
    # Update basic fields
    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'email' in data:
        user.email = data['email']
    if 'badge_number' in data:
        user.badge_number = data['badge_number']
    if 'department' in data:
        user.department = data['department']
    
    # Admin-only fields
    if has_permission(current_user, 'user:admin'):
        if 'role_id' in data:
            role = Role.query.get(data['role_id'])
            if not role:
                return jsonify({'message': 'Invalid role ID'}), 400
            user.role_id = data['role_id']
            
        if 'is_active' in data:
            user.is_active = data['is_active']
            
        # Reset password if requested
        if data.get('reset_password'):
            new_password = data.get('new_password', 'ChangeMe123!')
            user.set_password(new_password)
            
            # Log password reset
            activity = UserActivity(
                user_id=current_user.id,
                activity_type='password_reset',
                description=f"Password reset for user {user.username} by {current_user.username}",
                ip_address=request.remote_addr,
                timestamp=datetime.utcnow()
            )
            db.session.add(activity)
    
    # Save changes
    db.session.commit()
    
    return jsonify({'message': 'User updated successfully'}), 200

@auth_bp.route('/roles', methods=['GET'])
@token_required
def get_roles(current_user):
    """Get list of all roles"""
    # Everyone can view roles, but only basic info if not admin
    roles = Role.query.all()
    role_list = []
    
    for role in roles:
        role_data = {
            'id': role.id,
            'name': role.name,
            'description': role.description
        }
        
        # Include permissions for admins
        if has_permission(current_user, 'user:admin'):
            role_data['permissions'] = role.permissions
            role_data['user_count'] = len(role.users)
        
        role_list.append(role_data)
    
    return jsonify(role_list), 200
