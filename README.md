# Criminal Evidence Analysis System

A comprehensive system for analyzing and managing criminal evidence, designed for law enforcement agencies, forensic teams, and legal professionals.

## Project Overview

The Criminal Evidence Analysis System provides a structured approach to collecting, processing, and analyzing evidence to determine suspect culpability. This system incorporates modern forensic methodologies, statistical analysis, and machine learning techniques to provide evidence-based determinations.

## Features

- **Evidence Management**: Collect, document, and track all types of evidence
- **Case Management**: Organize evidence by cases with comprehensive metadata
- **Advanced Analysis Tools**: Apply statistical and machine learning models to evidence
- **Visualization**: Interactive graphs and charts for evidence relationships
- **Timeline Creation**: Build and analyze event timelines
- **Report Generation**: Create comprehensive analysis reports
- **User Management**: Role-based access control for different stakeholders
- **Audit Trails**: Track all system interactions for legal accountability

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 16+
- MongoDB or PostgreSQL
- Modern web browser

### Installation

1. Clone this repository
2. Install backend dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Install frontend dependencies:
   ```
   npm install
   ```
4. Configure the database connection in `.env` file (see `.env.example`)
5. Run database migrations:
   ```
   python src/database/init_db.py
   ```
6. Start the backend server:
   ```
   python src/backend/server.py
   ```
7. Start the frontend development server:
   ```
   npm start
   ```

## Usage

After starting both the backend and frontend servers, navigate to `http://localhost:3000` to access the application. First-time users will need to create an account with the appropriate permissions.

## Project Structure

- `/src/frontend/`: React-based user interface
- `/src/backend/`: Flask-based API server
- `/src/database/`: Database models and migration scripts
- `/src/analysis_tools/`: Evidence analysis algorithms and utilities

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Ethics Statement

This system is designed to aid in evidence-based investigation and should be used in accordance with all applicable laws and regulations. Users are responsible for ensuring that all analyses comply with local, state, and federal guidelines for admissibility in court proceedings.
