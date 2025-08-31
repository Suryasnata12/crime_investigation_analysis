import sys
import os

# Add the project root directory to Python's path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
sys.path.insert(0, project_root)

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from src.backend.api.evidence_api import evidence_bp
from src.backend.api.case_api import case_bp
from src.backend.api.suspect_api import suspect_bp
from src.backend.api.analysis_api import analysis_bp
from src.backend.api.auth_api import auth_bp
from src.backend.api.report_api import report_bp
from src.database.db_init import init_db

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure database
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI', 'sqlite:///evidence_analysis.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'development-secret-key')

# Initialize database
init_db(app)

# Register API blueprints
app.register_blueprint(evidence_bp, url_prefix='/api/evidence')
app.register_blueprint(case_bp, url_prefix='/api/case')
app.register_blueprint(suspect_bp, url_prefix='/api/suspect')
app.register_blueprint(analysis_bp, url_prefix='/api/analysis')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(report_bp, url_prefix='/api/report')

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'version': '1.0.0'
    }), 200

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('ENVIRONMENT', 'development') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
