// components/Chat/LoaderGeneral.tsx
import React from 'react';

interface LoaderGeneralProps {
  avatarUrl: string;
  timestamp: string;
}

const LoaderGeneral: React.FC<LoaderGeneralProps> = ({ avatarUrl, timestamp }) => (
  <div className="message-row bot-message">
    <div className="avatar-image">
      <img src={avatarUrl} alt="avatar" className="avatar" />
    </div>
    <div className="message-bubble">
      <div className="loader">
        <span>.</span><span>.</span><span>.</span>
      </div>
      <div className="timestamp">{timestamp}</div>
    </div>
  </div>
);

export default LoaderGeneral;
