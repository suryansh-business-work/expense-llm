import React, { JSX } from 'react';

interface UserGeneralProps {
  avatarUrl: string;
  timestamp: string;
  content: JSX.Element;
}

const UserGeneral: React.FC<UserGeneralProps> = ({ avatarUrl, timestamp, content }) => (
  <div className="message-row user-message">
    <div className="avatar-image">
      <img src={avatarUrl} alt="avatar" className="avatar" />
    </div>
    <div className="message-bubble">
      {content}
      <div className="timestamp">{timestamp}</div>
    </div>
  </div>
);

export default UserGeneral;
