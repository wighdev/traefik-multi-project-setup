import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import moment from 'moment';

const TestHistoryContainer = styled.div`
  padding: 0;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FilterSection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const FilterForm = styled.div`
  display: flex;
  gap: 15px;
  align-items: end;
  flex-wrap: wrap;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 150px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const HistoryTable = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 120px 120px 150px 100px 120px 100px;
  gap: 15px;
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  font-weight: 600;
  font-size: 14px;
  color: #495057;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 120px 120px 150px 100px 120px 100px;
  gap: 15px;
  padding: 15px 20px;
  border-bottom: 1px solid #f1f3f4;
  align-items: center;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TestName = styled.div`
  font-weight: 500;
  color: #333;
  font-size: 14px;
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  
  ${props => {
    switch (props.status) {
      case 'completed':
        return 'background: #d4edda; color: #155724;';
      case 'failed':
        return 'background: #f8d7da; color: #721c24;';
      case 'stopped':
        return 'background: #fff3cd; color: #856404;';
      default:
        return 'background: #e2e3e5; color: #383d41;';
    }
  }}
`;

const TimeInfo = styled.div`
  font-size: 13px;
  color: #666;
`;

const Duration = styled.div`
  font-size: 13px;
  color: #666;
  font-family: 'Monaco', 'Consolas', monospace;
`;

const ConfigInfo = styled.div`
  font-size: 12px;
  color: #888;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  background: #e9ecef;
  color: #495057;
  transition: all 0.2s ease;
  
  &:hover {
    background: #dee2e6;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
  
  .icon {
    font-size: 64px;
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

const LoadingState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
  
  .spinner {
    font-size: 32px;
    margin-bottom: 15px;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

function TestHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: 'all',
    testType: 'all',
    timeRange: '7d'
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/tests/history');
      setHistory(response.data.history || []);
    } catch (error) {
      console.error('Error fetching test history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(test => {
    // Status filter
    if (filter.status !== 'all' && test.status !== filter.status) {
      return false;
    }
    
    // Test type filter
    if (filter.testType !== 'all' && !test.testId.includes(filter.testType)) {
      return false;
    }
    
    // Time range filter
    const testDate = moment(test.startTime);
    const now = moment();
    let cutoffDate;
    
    switch (filter.timeRange) {
      case '1d':
        cutoffDate = now.subtract(1, 'day');
        break;
      case '7d':
        cutoffDate = now.subtract(7, 'days');
        break;
      case '30d':
        cutoffDate = now.subtract(30, 'days');
        break;
      default:
        return true; // 'all' - no time filter
    }
    
    return testDate.isAfter(cutoffDate);
  });

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A';
    
    const start = moment(startTime);
    const end = moment(endTime);
    const duration = moment.duration(end.diff(start));
    
    if (duration.asSeconds() < 60) {
      return `${Math.round(duration.asSeconds())}s`;
    } else if (duration.asMinutes() < 60) {
      return `${Math.round(duration.asMinutes())}m ${duration.seconds()}s`;
    } else {
      return `${Math.floor(duration.asHours())}h ${duration.minutes()}m`;
    }
  };

  const formatConfig = (config) => {
    if (!config) return 'Default';
    
    const parts = [];
    if (config.vus) parts.push(`${config.vus} VUs`);
    if (config.duration) parts.push(config.duration);
    if (config.iterations) parts.push(`${config.iterations} iter`);
    
    return parts.length > 0 ? parts.join(', ') : 'Default';
  };

  const viewLogs = async (testId, runId) => {
    try {
      const response = await axios.get(`/api/tests/${testId}/logs/${runId}`);
      // Open logs in a new window or modal
      const logs = response.data.logs || [];
      const logText = logs.map(log => `[${log.timestamp}] ${log.message}`).join('\n');
      
      const newWindow = window.open('', '_blank');
      newWindow.document.write(`
        <html>
          <head><title>Test Logs - ${testId}</title></head>
          <body>
            <h2>Test Logs: ${testId}</h2>
            <p>Run ID: ${runId}</p>
            <pre style="background: #f5f5f5; padding: 15px; border-radius: 4px; font-family: monospace;">${logText || 'No logs available'}</pre>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  if (loading) {
    return (
      <TestHistoryContainer>
        <LoadingState>
          <div className="spinner">⏳</div>
          <h3>Loading test history...</h3>
        </LoadingState>
      </TestHistoryContainer>
    );
  }

  return (
    <TestHistoryContainer>
      <SectionTitle>📈 Test History</SectionTitle>
      
      <FilterSection>
        <FilterForm>
          <FormGroup>
            <Label>Status</Label>
            <Select
              value={filter.status}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="stopped">Stopped</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label>Test Type</Label>
            <Select
              value={filter.testType}
              onChange={(e) => setFilter(prev => ({ ...prev, testType: e.target.value }))}
            >
              <option value="all">All Types</option>
              <option value="root">Root Endpoint</option>
              <option value="project1">Project 1</option>
              <option value="project2">Project 2</option>
              <option value="jenkins">Jenkins</option>
              <option value="traefik">Traefik</option>
              <option value="full-system">Full System</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label>Time Range</Label>
            <Select
              value={filter.timeRange}
              onChange={(e) => setFilter(prev => ({ ...prev, timeRange: e.target.value }))}
            >
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="all">All time</option>
            </Select>
          </FormGroup>
        </FilterForm>
      </FilterSection>

      <HistoryTable>
        <TableHeader>
          <div>Test Name</div>
          <div>Status</div>
          <div>Start Time</div>
          <div>Duration</div>
          <div>Config</div>
          <div>Run ID</div>
          <div>Actions</div>
        </TableHeader>
        
        {filteredHistory.length > 0 ? (
          filteredHistory.map(test => (
            <TableRow key={test.runId}>
              <TestName>{test.testId}</TestName>
              <StatusBadge status={test.status}>{test.status}</StatusBadge>
              <TimeInfo>
                {moment(test.startTime).format('MMM DD, HH:mm')}
              </TimeInfo>
              <Duration>
                {calculateDuration(test.startTime, test.endTime)}
              </Duration>
              <ConfigInfo>
                {formatConfig(test.config)}
              </ConfigInfo>
              <ConfigInfo>
                {test.runId.substring(0, 8)}...
              </ConfigInfo>
              <ActionButton onClick={() => viewLogs(test.testId, test.runId)}>
                View Logs
              </ActionButton>
            </TableRow>
          ))
        ) : (
          <EmptyState>
            <div className="icon">📋</div>
            <h3>No test history found</h3>
            <p>Run some tests to see their history here.</p>
          </EmptyState>
        )}
      </HistoryTable>
    </TestHistoryContainer>
  );
}

export default TestHistory;