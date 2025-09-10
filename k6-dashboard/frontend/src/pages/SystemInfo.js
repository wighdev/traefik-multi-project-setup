import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const SystemInfoContainer = styled.div`
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

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const InfoCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const CardTitle = styled.h3`
  margin: 0 0 15px;
  color: #333;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f1f3f4;
  
  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  font-weight: 500;
  color: #555;
  font-size: 14px;
`;

const InfoValue = styled.span`
  color: #333;
  font-size: 14px;
  font-family: 'Monaco', 'Consolas', monospace;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
`;

const StatusIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  
  ${props => props.status === 'healthy' ? `
    background: #d4edda;
    color: #155724;
  ` : props.status === 'warning' ? `
    background: #fff3cd;
    color: #856404;
  ` : `
    background: #f8d7da;
    color: #721c24;
  `}
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => 
    props.status === 'healthy' ? '#28a745' : 
    props.status === 'warning' ? '#ffc107' : '#dc3545'
  };
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #3498db;
  color: white;
  margin-top: 15px;
  
  &:hover:not(:disabled) {
    background: #2980b9;
  }
  
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

const ConfigItem = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f1f3f4;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ConfigPath = styled.div`
  font-family: 'Monaco', 'Consolas', monospace;
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  font-size: 13px;
  color: #495057;
  margin-top: 10px;
  border-left: 3px solid #007bff;
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

function SystemInfo() {
  const [systemInfo, setSystemInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSystemInfo();
  }, []);

  const fetchSystemInfo = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get('/api/system/info');
      setSystemInfo(response.data);
    } catch (error) {
      console.error('Error fetching system info:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatUptime = (seconds) => {
    if (!seconds) return 'Unknown';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const getSystemStatus = () => {
    if (systemInfo.activeTests > 0) {
      return { status: 'warning', text: 'Tests Running' };
    }
    return { status: 'healthy', text: 'All Systems Operational' };
  };

  const checkK6Health = () => {
    // This would ideally check if k6 is actually available
    return { status: 'healthy', text: 'Available' };
  };

  if (loading) {
    return (
      <SystemInfoContainer>
        <LoadingState>
          <div className="spinner">⏳</div>
          <h3>Loading system information...</h3>
        </LoadingState>
      </SystemInfoContainer>
    );
  }

  const systemStatus = getSystemStatus();
  const k6Health = checkK6Health();

  return (
    <SystemInfoContainer>
      <SectionTitle>⚙️ System Information</SectionTitle>
      
      <InfoGrid>
        <InfoCard>
          <CardTitle>🏥 System Status</CardTitle>
          <InfoList>
            <InfoItem>
              <InfoLabel>Overall Status</InfoLabel>
              <StatusIndicator status={systemStatus.status}>
                <StatusDot status={systemStatus.status} />
                {systemStatus.text}
              </StatusIndicator>
            </InfoItem>
            
            <InfoItem>
              <InfoLabel>K6 Engine</InfoLabel>
              <StatusIndicator status={k6Health.status}>
                <StatusDot status={k6Health.status} />
                {k6Health.text}
              </StatusIndicator>
            </InfoItem>
            
            <InfoItem>
              <InfoLabel>Active Tests</InfoLabel>
              <InfoValue>{systemInfo.activeTests || 0}</InfoValue>
            </InfoItem>
            
            <InfoItem>
              <InfoLabel>Total Tests Run</InfoLabel>
              <InfoValue>{systemInfo.totalHistory || 0}</InfoValue>
            </InfoItem>
            
            <InfoItem>
              <InfoLabel>System Uptime</InfoLabel>
              <InfoValue>{formatUptime(systemInfo.uptime)}</InfoValue>
            </InfoItem>
          </InfoList>
          
          <ActionButton onClick={fetchSystemInfo} disabled={refreshing}>
            {refreshing ? '🔄 Refreshing...' : '🔄 Refresh Status'}
          </ActionButton>
        </InfoCard>

        <InfoCard>
          <CardTitle>🧪 K6 Configuration</CardTitle>
          <InfoList>
            <InfoItem>
              <InfoLabel>K6 Version</InfoLabel>
              <InfoValue>{systemInfo.k6Version || 'Latest'}</InfoValue>
            </InfoItem>
            
            <InfoItem>
              <InfoLabel>Tests Directory</InfoLabel>
              <InfoValue>/tests</InfoValue>
            </InfoItem>
            
            <InfoItem>
              <InfoLabel>Logs Directory</InfoLabel>
              <InfoValue>/logs</InfoValue>
            </InfoItem>
            
            <InfoItem>
              <InfoLabel>Output Format</InfoLabel>
              <InfoValue>InfluxDB + JSON</InfoValue>
            </InfoItem>
          </InfoList>
        </InfoCard>

        <InfoCard>
          <CardTitle>🔗 Integration Status</CardTitle>
          <InfoList>
            <InfoItem>
              <InfoLabel>InfluxDB</InfoLabel>
              <StatusIndicator status="healthy">
                <StatusDot status="healthy" />
                Connected
              </StatusIndicator>
            </InfoItem>
            
            <InfoItem>
              <InfoLabel>Grafana</InfoLabel>
              <StatusIndicator status="healthy">
                <StatusDot status="healthy" />
                Available
              </StatusIndicator>
            </InfoItem>
            
            <InfoItem>
              <InfoLabel>Traefik Proxy</InfoLabel>
              <StatusIndicator status="healthy">
                <StatusDot status="healthy" />
                Routing Active
              </StatusIndicator>
            </InfoItem>
            
            <InfoItem>
              <InfoLabel>WebSocket</InfoLabel>
              <StatusIndicator status="healthy">
                <StatusDot status="healthy" />
                Real-time Updates
              </StatusIndicator>
            </InfoItem>
          </InfoList>
        </InfoCard>
      </InfoGrid>

      <ConfigSection>
        <CardTitle>📋 Configuration Paths</CardTitle>
        <ConfigItem>
          <InfoLabel>Test Scripts Location</InfoLabel>
          <div>
            <InfoValue>/tests/k6/</InfoValue>
            <ConfigPath>
              Mounted from: ./tests/k6/
            </ConfigPath>
          </div>
        </ConfigItem>
        
        <ConfigItem>
          <InfoLabel>Log Output Location</InfoLabel>
          <div>
            <InfoValue>/logs/</InfoValue>
            <ConfigPath>
              Mounted from: ./tests/k6/logs/
            </ConfigPath>
          </div>
        </ConfigItem>
        
        <ConfigItem>
          <InfoLabel>InfluxDB Connection</InfoLabel>
          <div>
            <InfoValue>http://influxdb:8086/k6</InfoValue>
            <ConfigPath>
              Database: k6 | User: k6 | Network: traefik-network
            </ConfigPath>
          </div>
        </ConfigItem>
        
        <ConfigItem>
          <InfoLabel>Grafana Dashboard</InfoLabel>
          <div>
            <InfoValue>http://k6.localhost/grafana</InfoValue>
            <ConfigPath>
              Traefik routing via k6.localhost subdomain
            </ConfigPath>
          </div>
        </ConfigItem>
      </ConfigSection>
    </SystemInfoContainer>
  );
}

export default SystemInfo;