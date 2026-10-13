import React, { useState } from 'react';
import styled from 'styled-components';
import { uploadBusinessLogo } from '../firebase/storage';

const TestContainer = styled.div`
  padding: 2rem;
  max-width: 400px;
  margin: 0 auto;
`;

const TestButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  margin: 1rem 0;
  
  &:hover {
    background: #2563eb;
  }
`;

const Status = styled.div`
  padding: 1rem;
  background: #f3f4f6;
  border-radius: 8px;
  margin: 1rem 0;
  font-family: monospace;
  font-size: 0.875rem;
`;

export default function StorageTest() {
  const [status, setStatus] = useState('Ready to test...');
  const [loading, setLoading] = useState(false);

  const testStorage = async () => {
    setLoading(true);
    setStatus('Testing Firebase Storage...');
    
    try {
      // Create a test file
      const testContent = 'This is a test file for Firebase Storage';
      const testFile = new Blob([testContent], { type: 'text/plain' });
      testFile.name = 'test.txt';
      
      setStatus('Uploading test file...');
      const result = await uploadBusinessLogo('test-user-id', testFile);
      
      if (result.success) {
        setStatus(`✅ Success! File uploaded to: ${result.url}`);
      } else {
        setStatus(`❌ Upload failed: ${result.error}`);
      }
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TestContainer>
      <h2>Firebase Storage Test</h2>
      <TestButton onClick={testStorage} disabled={loading}>
        {loading ? 'Testing...' : 'Test Storage Upload'}
      </TestButton>
      <Status>{status}</Status>
    </TestContainer>
  );
}
