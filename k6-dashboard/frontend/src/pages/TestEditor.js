import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import AceEditor from 'react-ace';
import axios from 'axios';

import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-github';

const TestEditorContainer = styled.div`
  padding: 0;
  height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
`;

const EditorHeader = styled.div`
  background: white;
  padding: 15px 20px;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 0;
`;

const TestInfo = styled.div`
  flex: 1;
`;

const TestTitle = styled.h2`
  margin: 0 0 5px;
  color: #333;
  font-size: 20px;
`;

const TestPath = styled.p`
  margin: 0;
  color: #666;
  font-size: 14px;
  font-family: 'Monaco', 'Consolas', monospace;
`;

const EditorActions = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
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
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ThemeToggle = styled.select`
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const EditorWrapper = styled.div`
  flex: 1;
  background: white;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
  position: relative;
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
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

const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #e74c3c;
  
  .icon {
    font-size: 48px;
    margin-bottom: 15px;
  }
  
  h3 {
    margin: 0 0 10px;
    color: #c0392b;
  }
  
  p {
    margin: 0;
    color: #666;
    font-size: 14px;
  }
`;

const InfoPanel = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-top: 1px solid #e9ecef;
  font-size: 14px;
  color: #495057;
  
  h4 {
    margin: 0 0 10px;
    color: #343a40;
    font-size: 16px;
  }
  
  ul {
    margin: 0;
    padding-left: 20px;
  }
  
  li {
    margin-bottom: 5px;
  }
  
  code {
    background: #e9ecef;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Monaco', 'Consolas', monospace;
  }
`;

function TestEditor() {
  const { testId } = useParams();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('github');
  const [testPath, setTestPath] = useState('');
  const [readonly] = useState(true); // For now, make it read-only

  useEffect(() => {
    if (testId) {
      fetchTestContent();
    }
  }, [testId]);

  const fetchTestContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/tests/${testId}`);
      setContent(response.data.content);
      setTestPath(response.data.path);
    } catch (error) {
      console.error('Error fetching test content:', error);
      setError(error.response?.data?.error || 'Failed to load test file');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const downloadFile = () => {
    const blob = new Blob([content], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${testId}.js`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <TestEditorContainer>
        <LoadingState>
          <div className="spinner">⏳</div>
          <h3>Loading test file...</h3>
        </LoadingState>
      </TestEditorContainer>
    );
  }

  if (error) {
    return (
      <TestEditorContainer>
        <ErrorState>
          <div className="icon">❌</div>
          <h3>Failed to load test</h3>
          <p>{error}</p>
        </ErrorState>
      </TestEditorContainer>
    );
  }

  return (
    <TestEditorContainer>
      <EditorHeader>
        <TestInfo>
          <TestTitle>{testId}.js</TestTitle>
          <TestPath>{testPath}</TestPath>
        </TestInfo>
        <EditorActions>
          <ThemeToggle
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            <option value="github">Light Theme</option>
            <option value="monokai">Dark Theme</option>
          </ThemeToggle>
          <Button onClick={copyToClipboard}>
            📋 Copy
          </Button>
          <Button onClick={downloadFile}>
            💾 Download
          </Button>
          <Button primary onClick={() => window.close()}>
            ✕ Close
          </Button>
        </EditorActions>
      </EditorHeader>

      <EditorWrapper>
        <AceEditor
          mode="javascript"
          theme={theme}
          value={content}
          onChange={setContent}
          readOnly={readonly}
          width="100%"
          height="100%"
          fontSize={14}
          showPrintMargin={true}
          showGutter={true}
          highlightActiveLine={true}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: false,
            showLineNumbers: true,
            tabSize: 2,
            useWorker: false
          }}
          editorProps={{
            $blockScrolling: Infinity
          }}
        />
        
        <InfoPanel>
          <h4>📚 K6 Test Script Reference</h4>
          <ul>
            <li><code>import http from 'k6/http';</code> - HTTP requests module</li>
            <li><code>import {'{ check, sleep }'} from 'k6';</code> - Validation and timing</li>
            <li><code>export const options = {'{ ... }'}</code> - Test configuration (VUs, duration, thresholds)</li>
            <li><code>export default function() {'{ ... }'}</code> - Main test function</li>
            <li><code>check(response, {'{ ... }'})</code> - Response validation</li>
            <li><code>sleep(1)</code> - Add delay between requests</li>
          </ul>
        </InfoPanel>
      </EditorWrapper>
    </TestEditorContainer>
  );
}

export default TestEditor;