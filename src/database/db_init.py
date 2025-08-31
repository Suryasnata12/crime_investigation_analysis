from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Initialize SQLAlchemy instance
db = SQLAlchemy()

def init_db(app):
    """Initialize the database with the Flask app"""
    db.init_app(app)
    
    # Create tables if they don't exist
    with app.app_context():
        db.create_all()
        
        # Check if we need to add initial data
        from src.backend.models.user_model import User
        if User.query.count() == 0:
            create_default_admin()

def create_default_admin():
    """Create a default admin user if no users exist"""
    from src.backend.models.user_model import User, Role
    from werkzeug.security import generate_password_hash
    
    # Create default roles
    admin_role = Role(name="Administrator", description="Full system access")
    investigator_role = Role(name="Investigator", description="Case management and evidence analysis")
    analyst_role = Role(name="Analyst", description="Evidence analysis only")
    viewer_role = Role(name="Viewer", description="Read-only access")
    
    # Create default admin user
    admin_user = User(
        username="admin",
        email="admin@example.com",
        password_hash=generate_password_hash("change-me-immediately"),
        first_name="System",
        last_name="Administrator",
        role_id=1,  # Admin role
        created_at=datetime.utcnow(),
        is_active=True
    )
    
    db.session.add_all([admin_role, investigator_role, analyst_role, viewer_role, admin_user])
    db.session.commit()
