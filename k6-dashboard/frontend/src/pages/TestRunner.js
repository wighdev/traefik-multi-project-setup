import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useToasts } from 'react-toast-notifications';
import axios from 'axios';

const TestRunnerContainer = styled.div`
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

const TestGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const TestCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 2px solid ${props => props.running ? '#e74c3c' : 'transparent'};
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transform: translateY(-2px);
  }
`;

const TestHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: flex-start;
  margin-bottom: 15px;
`;

const TestName = styled.h3`
  margin: 0;
  color: #333;
  font-size: 18px;
  flex: 1;
`;

const TestStatus = styled.span`
  background: ${props => props.running ? '#e74c3c' : '#95a5a6'};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
`;

const TestDescription = styled.p`
  margin: 0 0 15px;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
`;

const TestMetadata = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  font-size: 12px;
  color: #888;
`;

const TestActions = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.primary ? `
    background: #3498db;
    color: white;
    
    &:hover:not(:disabled) {
      background: #2980b9;
    }
  ` : `
    background: #ecf0f1;
    color: #333;
    
    &:hover:not(:disabled) {
      background: #d5dbdb;
    }
  `}
  
  ${props => props.danger && `
    background: #e74c3c;
    color: white;
    
    &:hover:not(:disabled) {
      background: #c0392b;
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ConfigSection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 20px;
`;

const ConfigForm = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
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

function TestRunner() {
  const [tests, setTests] = useState([]);
  const [activeTests, setActiveTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState({
    baseUrl: 'http://localhost:58002',
    vus: 10,
    duration: '30s',
    iterations: ''
  });
  const { addToast } = useToasts();

  useEffect(() => {
    fetchTests();
    fetchActiveTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await axios.get('/api/tests');
      setTests(response.data.tests || []);
    } catch (error) {
      console.error('Error fetching tests:', error);
      addToast('Failed to load tests', { appearance: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveTests = async () => {
    try {
      const response = await axios.get('/api/tests/active');
      setActiveTests(response.data.active || []);
    } catch (error) {
      console.error('Error fetching active tests:', error);
    }
  };

  const isTestRunning = (testId) => {
    return activeTests.some(test => test.testId === testId);
  };

  const startTest = async (testId) => {
    try {
      await axios.post(`/api/tests/${testId}/start`, config);
      addToast(`Test "${testId}" started successfully`, { appearance: 'success' });
      fetchActiveTests();
    } catch (error) {
      console.error('Error starting test:', error);
      const message = error.response?.data?.error || 'Failed to start test';
      addToast(message, { appearance: 'error' });
    }
  };

  const stopTest = async (testId) => {
    try {
      await axios.post(`/api/tests/${testId}/stop`);
      addToast(`Test "${testId}" stopped`, { appearance: 'warning' });
      fetchActiveTests();
    } catch (error) {
      console.error('Error stopping test:', error);
      const message = error.response?.data?.error || 'Failed to stop test';
      addToast(message, { appearance: 'error' });
    }
  };

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <TestRunnerContainer>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <h3>Loading tests...</h3>
        </div>
      </TestRunnerContainer>
    );
  }

  return (
    <TestRunnerContainer>
      <SectionTitle>🧪 Test Configuration</SectionTitle>
      
      <ConfigSection>
        <h3 style={{ margin: '0 0 15px', color: '#333' }}>Global Test Settings</h3>
        <ConfigForm>
          <FormGroup>
            <Label>Base URL</Label>
            <Input
              type="text"
              value={config.baseUrl}
              onChange={(e) => handleConfigChange('baseUrl', e.target.value)}
              placeholder="http://localhost:58002"
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Virtual Users (VUs)</Label>
            <Input
              type="number"
              value={config.vus}
              onChange={(e) => handleConfigChange('vus', parseInt(e.target.value) || 1)}
              min="1"
              max="1000"
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Duration</Label>
            <Select
              value={config.duration}
              onChange={(e) => handleConfigChange('duration', e.target.value)}
            >
              <option value="30s">30 seconds</option>
              <option value="1m">1 minute</option>
              <option value="2m">2 minutes</option>
              <option value="5m">5 minutes</option>
              <option value="10m">10 minutes</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label>Iterations (Optional)</Label>
            <Input
              type="number"
              value={config.iterations}
              onChange={(e) => handleConfigChange('iterations', e.target.value)}
              placeholder="Leave empty for duration-based"
              min="1"
            />
          </FormGroup>
        </ConfigForm>
      </ConfigSection>

      <SectionTitle>🚀 Available Tests</SectionTitle>
      
      <TestGrid>
        {tests.map(test => {
          const running = isTestRunning(test.id);
          
          return (
            <TestCard key={test.id} running={running}>
              <TestHeader>
                <TestName>{test.name.replace('.js', '')}</TestName>
                <TestStatus running={running}>
                  {running ? 'Running' : 'Ready'}
                </TestStatus>
              </TestHeader>
              
              <TestDescription>
                {test.description}
              </TestDescription>
              
              <TestMetadata>
                <span>{formatFileSize(test.size)}</span>
                <span>Modified: {formatDate(test.modified)}</span>
              </TestMetadata>
              
              <TestActions>
                <Button
                  primary
                  disabled={running}
                  onClick={() => startTest(test.id)}
                >
                  {running ? 'Running...' : 'Start Test'}
                </Button>
                
                {running && (
                  <Button
                    danger
                    onClick={() => stopTest(test.id)}
                  >
                    Stop
                  </Button>
                )}
                
                <Button onClick={() => window.open(`/tests/${test.id}`, '_blank')}>
                  View Code
                </Button>
              </TestActions>
            </TestCard>
          );
        })}
      </TestGrid>
      
      {tests.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📁</div>
          <h3>No tests available</h3>
          <p>Make sure your test scripts are in the correct directory.</p>
        </div>
      )}
    </TestRunnerContainer>
  );
}

export default TestRunner;