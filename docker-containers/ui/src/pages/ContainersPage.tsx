import React from 'react';
import styled from 'styled-components';
import ContainerList from '../components/containers/ContainerList';
import { Link } from 'react-router-dom';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  color: #343a40;
  margin: 0;
`;

const CreateButton = styled(Link)`
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  
  &:hover {
    background-color: #218838;
  }
`;

const ContainersPage: React.FC = () => {
  return (
    <Container>
      <Header>
        <Title>Docker Containers</Title>
        <CreateButton to="/create">Create New Container</CreateButton>
      </Header>
      
      <ContainerList />
    </Container>
  );
};

export default ContainersPage;