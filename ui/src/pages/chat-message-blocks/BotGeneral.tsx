// components/Chat/BotGeneral.tsx
import React, { JSX } from 'react';

interface BotGeneralProps {
  avatarUrl: string;
  timestamp: string;
  content: JSX.Element;
}

const BotGeneral: React.FC<BotGeneralProps> = ({ avatarUrl, timestamp, content }) => (
  <div className="message-row bot-message">
    <div className="avatar-image">
      <img src={avatarUrl} alt="avatar" className="avatar" />
    </div>
    <div className="message-bubble">
      {content}
      <div className="timestamp">{timestamp}</div>
    </div>
    <div className="mt-3 d-flex justify-content-around text-primary">
      <i className="fas fa-pen-to-square" title="Edit"></i>
      <i className="fas fa-trash" title="Delete"></i>
      <i className="fas fa-circle-info" title="Details"></i>
    </div>
  </div>
);

export default BotGeneral;
