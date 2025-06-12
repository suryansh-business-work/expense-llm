import React from 'react';
import styled from 'styled-components';
import { Link, NavLink as RouterNavLink } from 'react-router-dom';

const HeaderContainer = styled.header`
  background-color: #343a40;
  color: white;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Logo = styled(Link)`
  font-size: 22px;
  font-weight: bold;
  color: white;
  text-decoration: none;
  
  &:hover {
    color: #f8f9fa;
  }
`;

const Navigation = styled.nav`
  display: flex;
  align-items: center;
`;

const NavLink = styled(RouterNavLink)`
  color: rgba(255, 255, 255, 0.75);
  margin-left: 20px;
  text-decoration: none;
  font-size: 16px;
  
  &:hover {
    color: white;
  }
  
  &.active {
    color: white;
    font-weight: bold;
  }
`;

const StatusIndicator = styled.div<{ isConnected: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.isConnected ? '#28a745' : '#dc3545'};
  margin-right: 5px;
  display: inline-block;
`;

const Status = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  margin-left: 20px;
`;

interface HeaderProps {
  isDockerConnected: boolean;
}

const Header: React.FC<HeaderProps> = ({ isDockerConnected }) => {
  return (
    <HeaderContainer>
      <Logo to="/">Docker Container Manager</Logo>
      
      <Navigation>
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/containers">
          Containers
        </NavLink>
        <NavLink to="/create">
          Create
        </NavLink>
        
        <Status>
          <StatusIndicator isConnected={isDockerConnected} />
          {isDockerConnected ? 'Docker Connected' : 'Docker Disconnected'}
        </Status>
      </Navigation>
    </HeaderContainer>
  );
};

export default Header;