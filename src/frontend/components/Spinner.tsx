import React from 'react';
import './Spinner.css';

interface SpinnerProps {
  message?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="spinner-container" style={{ height: 'unset', padding: '2rem 0' }}>
      <div className="spinner"></div>
      <p className="spinner-text">{message}</p>
    </div>
  );
};

export default Spinner;
