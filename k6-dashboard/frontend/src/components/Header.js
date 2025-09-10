import React from 'react';
import styled from 'styled-components';
import { useWebSocket } from '../hooks/useWebSocket';

const HeaderContainer = styled.header`
  background: #fff;
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 20px 0 0;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Title = styled.h1`
  margin: 0;
  color: #333;
  font-size: 24px;
  font-weight: 600;
`;

const StatusArea = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const ConnectionStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  
  ${props => props.connected ? `
    background: #e8f5e8;
    color: #2e7d2e;
  ` : `
    background: #ffe8e8;
    color: #d32f2f;
  `}
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.connected ? '#4caf50' : '#f44336'};
`;

const ActiveTestsCounter = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
`;

const TestIcon = styled.span`
  font-size: 16px;
`;

function Header() {
  const { connected, activeTests } = useWebSocket();

  return (
    <HeaderContainer>
      <Title>K6 Load Testing Dashboard</Title>
      <StatusArea>
        <ActiveTestsCounter>
          <TestIcon>🧪</TestIcon>
          {activeTests.length} Active Tests
        </ActiveTestsCounter>
        <ConnectionStatus connected={connected}>
          <StatusDot connected={connected} />
          {connected ? 'Connected' : 'Disconnected'}
        </ConnectionStatus>
      </StatusArea>
    </HeaderContainer>
  );
}

export default Header;