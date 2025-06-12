import React from 'react';
import { Container } from '../../types';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { startContainer, stopContainer, deleteContainer } from '../../services/api';

const Card = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: white;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const Title = styled.h3`
  margin: 0;
  color: #333;
`;

const Status = styled.span<{ status: string }>`
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
  background-color: ${props => 
    props.status === 'running' ? '#d4edda' : 
    props.status === 'created' ? '#cce5ff' :
    props.status === 'exited' ? '#f8d7da' : '#e2e3e5'
  };
  color: ${props => 
    props.status === 'running' ? '#155724' : 
    props.status === 'created' ? '#004085' :
    props.status === 'exited' ? '#721c24' : '#383d41'
  };
`;

const Details = styled.div`
  margin-bottom: 15px;
`;

const DetailItem = styled.div`
  margin-bottom: 5px;
  display: flex;
  align-items: flex-start;
`;

const Label = styled.span`
  font-weight: bold;
  min-width: 120px;
`;

const Value = styled.span`
  overflow-wrap: break-word;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button<{ variant?: 'primary' | 'danger' | 'warning' | 'success' }>`
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${props => 
    props.variant === 'primary' ? '#007bff' :
    props.variant === 'danger' ? '#dc3545' :
    props.variant === 'warning' ? '#ffc107' :
    props.variant === 'success' ? '#28a745' : '#6c757d'
  };
  color: ${props => props.variant === 'warning' ? '#212529' : 'white'};
  &:hover {
    opacity: 0.8;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface ContainerCardProps {
  container: Container;
  onActionComplete: () => void;
}

const ContainerCard: React.FC<ContainerCardProps> = ({ container, onActionComplete }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  
  const handleStart = async () => {
    try {
      setLoading(true);
      await startContainer(container.id);
      onActionComplete();
    } catch (error) {
      console.error('Error starting container:', error);
      alert(`Failed to start container: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleStop = async () => {
    try {
      setLoading(true);
      await stopContainer(container.id);
      onActionComplete();
    } catch (error) {
      console.error('Error stopping container:', error);
      alert(`Failed to stop container: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this container?')) {
      return;
    }
    
    try {
      setLoading(true);
      await deleteContainer(container.id);
      onActionComplete();
    } catch (error) {
      console.error('Error deleting container:', error);
      alert(`Failed to delete container: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };
  
  const openTerminal = () => {
    navigate(`/terminal/${container.id}`);
  };
  
  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };
  
  return (
    <Card>
      <Header>
        <Title>{container.name}</Title>
        <Status status={container.status}>{container.status}</Status>
      </Header>
      
      <Details>
        <DetailItem>
          <Label>ID:</Label>
          <Value>{container.id.slice(0, 12)}</Value>
        </DetailItem>
        <DetailItem>
          <Label>Image:</Label>
          <Value>{container.image}</Value>
        </DetailItem>
        <DetailItem>
          <Label>Created:</Label>
          <Value>{formatDate(container.created)}</Value>
        </DetailItem>
        {container.ports && container.ports.length > 0 && (
          <DetailItem>
            <Label>Ports:</Label>
            <Value>
              {container.ports.map((port, index) => (
                <div key={index}>
                  {port.publicPort ? `${port.publicPort}:${port.privatePort}` : port.privatePort} ({port.type})
                </div>
              ))}
            </Value>
          </DetailItem>
        )}
      </Details>
      
      <Actions>
        {container.status === 'running' ? (
          <Button 
            variant="warning" 
            onClick={handleStop} 
            disabled={loading}
          >
            Stop
          </Button>
        ) : (
          <Button 
            variant="success" 
            onClick={handleStart} 
            disabled={loading || container.status === 'created'}
          >
            Start
          </Button>
        )}
        <Button 
          variant="primary" 
          onClick={openTerminal}
        >
          Terminal
        </Button>
        <Button 
          variant="danger" 
          onClick={handleDelete} 
          disabled={loading}
        >
          Delete
        </Button>
      </Actions>
    </Card>
  );
};

export default ContainerCard;