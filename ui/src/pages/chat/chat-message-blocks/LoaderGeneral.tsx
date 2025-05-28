import React from 'react';

interface LoaderGeneralProps {
  timestamp: string;
}

const LoaderGeneral: React.FC<LoaderGeneralProps> = ({ timestamp }) => (
  <div className="message-row bot-message" >
    <div className="message-bubble">
      <div className="loader">
        <span>.</span><span>.</span><span>.</span>
      </div>
      <div className="timestamp">{timestamp}</div>
    </div>
  </div>
);

export default LoaderGeneral;
