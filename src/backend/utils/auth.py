from functools import wraps
from flask import request, jsonify, current_app
import jwt
from datetime import datetime, timedelta
from src.backend.models.user_model import User, UserActivity

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # Get token from header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401

        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        try:
            # Decode token
            data = jwt.decode(
                token, 
                current_app.config['JWT_SECRET_KEY'], 
                algorithms=['HS256']
            )
            
            # Get user from database
            current_user = User.query.filter_by(id=data['user_id']).first()
            
            if not current_user:
                return jsonify({'message': 'User not found'}), 401
                
            if not current_user.is_active:
                return jsonify({'message': 'User account is inactive'}), 401
                
            # Update last login time
            if data.get('fresh_login', False):
                current_user.last_login = datetime.utcnow()
                # Log user activity
                activity = UserActivity(
                    user_id=current_user.id,
                    activity_type='login',
                    description=f"User logged in from {request.remote_addr}",
                    ip_address=request.remote_addr
                )
                from src.database.db_init import db
                db.session.add(activity)
                db.session.commit()
                
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401

        # Pass user to view
        return f(current_user, *args, **kwargs)
    
    return decorated

def has_permission(user, permission_code):
    """Check if a user has a specific permission"""
    
    # Super admin has all permissions
    if user.role.name == 'Administrator':
        return True
        
    # Convert permission string to JSON if needed
    import json
    if user.role.permissions is None:
        permissions = []
    else:
        try:
            permissions = json.loads(user.role.permissions)
        except:
            permissions = []
    
    return permission_code in permissions

def generate_token(user, expiration_minutes=60, fresh_login=False):
    """Generate a JWT token for authentication"""
    
    # Create token payload
    payload = {
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(minutes=expiration_minutes),
        'iat': datetime.utcnow(),
        'fresh_login': fresh_login
    }
    
    # Create token
    token = jwt.encode(
        payload,
        current_app.config['JWT_SECRET_KEY'],
        algorithm='HS256'
    )
    
    return token

def log_user_activity(user_id, activity_type, description=None, ip_address=None):
    """Log user activity for audit purposes"""
    
    activity = UserActivity(
        user_id=user_id,
        activity_type=activity_type,
        description=description,
        ip_address=ip_address or request.remote_addr
    )
    
    from src.database.db_init import db
    db.session.add(activity)
    db.session.commit()
    
    return True
