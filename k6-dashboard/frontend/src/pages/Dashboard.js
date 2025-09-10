import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import axios from 'axios';

const DashboardContainer = styled.div`
  padding: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-left: 4px solid ${props => props.color || '#3498db'};
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #666;
  text-transform: uppercase;
  font-weight: 500;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  color: #333;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ActiveTestsSection = styled.div`
  margin-bottom: 30px;
`;

const TestCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-left: 4px solid #e74c3c;
`;

const TestHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 10px;
`;

const TestName = styled.h3`
  margin: 0;
  color: #333;
  font-size: 16px;
`;

const TestStatus = styled.span`
  background: #e74c3c;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
`;

const TestDetails = styled.div`
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #666;
`;

const QuickActionsSection = styled.div`
  margin-bottom: 30px;
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
`;

const ActionCard = styled(Link)`
  background: white;
  border-radius: 8px;
  padding: 20px;
  text-decoration: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border: 2px solid transparent;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #3498db;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
`;

const ActionIcon = styled.div`
  font-size: 32px;
  margin-bottom: 10px;
`;

const ActionTitle = styled.h3`
  margin: 0 0 5px;
  color: #333;
  font-size: 16px;
`;

const ActionDescription = styled.p`
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
  
  .icon {
    font-size: 48px;
    margin-bottom: 20px;
  }
  
  h3 {
    margin: 0 0 10px;
    color: #333;
  }
  
  p {
    margin: 0;
    font-size: 14px;
  }
`;

function Dashboard() {
  const { activeTests } = useWebSocket();
  const [systemInfo, setSystemInfo] = useState({});
  const [testHistory, setTestHistory] = useState([]);

  useEffect(() => {
    fetchSystemInfo();
    fetchTestHistory();
  }, []);

  const fetchSystemInfo = async () => {
    try {
      const response = await axios.get('/api/system/info');
      setSystemInfo(response.data);
    } catch (error) {
      console.error('Error fetching system info:', error);
    }
  };

  const fetchTestHistory = async () => {
    try {
      const response = await axios.get('/api/tests/history');
      setTestHistory(response.data.history || []);
    } catch (error) {
      console.error('Error fetching test history:', error);
    }
  };

  const formatDuration = (startTime) => {
    if (!startTime) return '0s';
    const now = new Date();
    const start = new Date(startTime);
    const diff = Math.floor((now - start) / 1000);
    
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ${diff % 60}s`;
    return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`;
  };

  const getRecentTestsSuccess = () => {
    const recent = testHistory.slice(0, 10);
    const successful = recent.filter(test => test.status === 'completed');
    return recent.length > 0 ? Math.round((successful.length / recent.length) * 100) : 0;
  };

  return (
    <DashboardContainer>
      <StatsGrid>
        <StatCard color="#3498db">
          <StatValue>{activeTests.length}</StatValue>
          <StatLabel>Active Tests</StatLabel>
        </StatCard>
        <StatCard color="#2ecc71">
          <StatValue>{testHistory.length}</StatValue>
          <StatLabel>Total Tests Run</StatLabel>
        </StatCard>
        <StatCard color="#f39c12">
          <StatValue>{getRecentTestsSuccess()}%</StatValue>
          <StatLabel>Success Rate (Recent)</StatLabel>
        </StatCard>
        <StatCard color="#9b59b6">
          <StatValue>{Math.floor(systemInfo.uptime / 3600) || 0}h</StatValue>
          <StatLabel>System Uptime</StatLabel>
        </StatCard>
      </StatsGrid>

      <ActiveTestsSection>
        <SectionTitle>🚀 Active Tests</SectionTitle>
        {activeTests.length > 0 ? (
          activeTests.map(test => (
            <TestCard key={test.runId}>
              <TestHeader>
                <TestName>{test.testId}</TestName>
                <TestStatus>{test.status}</TestStatus>
              </TestHeader>
              <TestDetails>
                <span>Started: {formatDuration(test.startTime)} ago</span>
                <span>VUs: {test.config?.vus || 'Default'}</span>
                <span>Duration: {test.config?.duration || 'Default'}</span>
              </TestDetails>
            </TestCard>
          ))
        ) : (
          <EmptyState>
            <div className="icon">😴</div>
            <h3>No Active Tests</h3>
            <p>All systems are quiet. Start a new test to monitor performance.</p>
          </EmptyState>
        )}
      </ActiveTestsSection>

      <QuickActionsSection>
        <SectionTitle>🎯 Quick Actions</SectionTitle>
        <ActionsGrid>
          <ActionCard to="/tests">
            <ActionIcon>🧪</ActionIcon>
            <ActionTitle>Run Load Test</ActionTitle>
            <ActionDescription>
              Start a new load test with customizable parameters
            </ActionDescription>
          </ActionCard>
          
          <ActionCard to="/history">
            <ActionIcon>📈</ActionIcon>
            <ActionTitle>View History</ActionTitle>
            <ActionDescription>
              Browse previous test results and performance trends
            </ActionDescription>
          </ActionCard>
          
          <ActionCard to="/system">
            <ActionIcon>⚙️</ActionIcon>
            <ActionTitle>System Status</ActionTitle>
            <ActionDescription>
              Check system information and K6 configuration
            </ActionDescription>
          </ActionCard>
          
          <ActionCard to="http://localhost:58002/grafana" target="_blank">
            <ActionIcon>📊</ActionIcon>
            <ActionTitle>Grafana Dashboards</ActionTitle>
            <ActionDescription>
              View detailed performance metrics and visualizations
            </ActionDescription>
          </ActionCard>
        </ActionsGrid>
      </QuickActionsSection>
    </DashboardContainer>
  );
}

export default Dashboard;