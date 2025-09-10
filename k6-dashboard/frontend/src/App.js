import React from 'react';
import { Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import { useToasts } from 'react-toast-notifications';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import TestRunner from './pages/TestRunner';
import TestHistory from './pages/TestHistory';
import TestEditor from './pages/TestEditor';
import SystemInfo from './pages/SystemInfo';
import { WebSocketProvider } from './hooks/useWebSocket';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background: #f5f5f5;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #fff;
  margin: 0 20px 20px 0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

function App() {
  const { addToast } = useToasts();

  return (
    <WebSocketProvider>
      <AppContainer>
        <Sidebar />
        <MainContent>
          <Header />
          <ContentArea>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tests" element={<TestRunner />} />
              <Route path="/tests/:testId" element={<TestEditor />} />
              <Route path="/history" element={<TestHistory />} />
              <Route path="/system" element={<SystemInfo />} />
            </Routes>
          </ContentArea>
        </MainContent>
      </AppContainer>
    </WebSocketProvider>
  );
}

export default App;