import { Avatar, Tooltip } from '@mui/material';
import React, { JSX } from 'react';

export interface UserContext {
  timezone: string;
  profileImage: string;
  firstName: string;
  lastName: string;
  email: string;
  isUserVerified: boolean;
  role: 'admin' | 'user' | 'moderator';
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface UserGeneralProps {
  userContext: UserContext;
  timestamp: string;
  content: JSX.Element;
  chatAppearance: any;
}

const UserGeneral: React.FC<UserGeneralProps> = ({ userContext, timestamp, content, chatAppearance }) => (
  <div className="message-row user-message">
    <div className="avatar-image">
      <Tooltip title={`${userContext?.firstName} ${userContext?.lastName}`} placement="top" arrow>
        <Avatar
          src={userContext?.profileImage}
          alt={`${userContext?.firstName} ${userContext?.lastName}`}
          sx={{ width: 40, height: 40 }}
        />
      </Tooltip>
    </div>
    <div className="user-name mb-2" style={{fontSize: '12px', color: '#333', opacity: '0.8'}}>{`${userContext.firstName} ${userContext.lastName}`}</div>
    <div className="message-bubble" style={{ backgroundColor: chatAppearance?.user?.bubble?.background || '#f0f0f0', color: chatAppearance?.user?.bubble?.textColor || '#000' }} tabIndex={1}>
      {content}
    </div>
    <div className="timestamp">{timestamp}</div>
  </div>
);

export default UserGeneral;
