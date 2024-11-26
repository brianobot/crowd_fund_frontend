import React from 'react';

const ProgressBar = ({ currentAmount, targetAmount }) => {
  const progress = Math.min((currentAmount / targetAmount) * 100, 100); // Ensure it doesn't exceed 100%

  return (
    <div style={{ width: '100%', backgroundColor: '#ddd', borderRadius: '8px', overflow: 'hidden', marginBottom: '10px' }}>
      <div
        style={{
          height: '12px',
          width: `${progress}%`,
          backgroundColor: '#4caf50',
        //   backgroundImage: "linear-gradient(to right, #6366F1, #C026D3)",
          textAlign: 'center',
          color: 'black',
          fontSize: '10px',
          lineHeight: '10px',
        }}
      >
        {Math.round(progress)}%
      </div>
    </div>
  );
};

export default ProgressBar;
