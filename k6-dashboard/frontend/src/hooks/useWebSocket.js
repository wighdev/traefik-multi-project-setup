import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useToasts } from 'react-toast-notifications';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [ws, setWs] = useState(null);
  const [connected, setConnected] = useState(false);
  const [activeTests, setActiveTests] = useState([]);
  const { addToast } = useToasts();
  const reconnectTimeoutRef = useRef();

  const connect = () => {
    try {
      const wsUrl = process.env.NODE_ENV === 'production' 
        ? `ws://${window.location.hostname}:3002`
        : 'ws://localhost:3002';
        
      const websocket = new WebSocket(wsUrl);
      
      websocket.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
        setWs(websocket);
        
        // Clear any existing reconnection timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
        
        addToast('Connected to K6 service', { 
          appearance: 'success',
          autoDismiss: true 
        });
      };
      
      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      websocket.onclose = () => {
        console.log('WebSocket disconnected');
        setConnected(false);
        setWs(null);
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 3000);
        
        addToast('Disconnected from K6 service', { 
          appearance: 'warning',
          autoDismiss: true 
        });
      };
      
      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        addToast('Connection error', { 
          appearance: 'error',
          autoDismiss: true 
        });
      };
      
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  };

  const handleMessage = (data) => {
    switch (data.type) {
      case 'active-tests':
        setActiveTests(data.tests || []);
        break;
        
      case 'test-started':
        setActiveTests(prev => [...prev, {
          runId: data.runId,
          testId: data.testId,
          startTime: data.startTime,
          status: 'running',
          config: data.config
        }]);
        
        addToast(`Test "${data.testId}" started`, {
          appearance: 'info',
          autoDismiss: true
        });
        break;
        
      case 'test-completed':
        setActiveTests(prev => 
          prev.filter(test => test.testId !== data.testId)
        );
        
        const statusAppearance = data.status === 'completed' ? 'success' : 'error';
        addToast(`Test "${data.testId}" ${data.status}`, {
          appearance: statusAppearance,
          autoDismiss: true
        });
        break;
        
      case 'test-stopped':
        setActiveTests(prev => 
          prev.filter(test => test.testId !== data.testId)
        );
        
        addToast(`Test "${data.testId}" stopped`, {
          appearance: 'warning',
          autoDismiss: true
        });
        break;
        
      case 'test-output':
        // Handle real-time output if needed
        console.log('Test output:', data.output);
        break;
        
      case 'test-error':
        // Handle test errors
        console.error('Test error:', data.output);
        break;
        
      default:
        console.log('Unknown message type:', data.type);
    }
  };

  useEffect(() => {
    connect();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws) {
        ws.close();
      }
    };
  }, []); // Empty dependency array for component mount only

  const sendMessage = (message) => {
    if (ws && connected) {
      ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected');
    }
  };

  const value = {
    connected,
    activeTests,
    sendMessage,
    reconnect: connect
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};