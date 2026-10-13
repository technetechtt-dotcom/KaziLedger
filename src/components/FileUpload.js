import React, { useState } from 'react';
import styled from 'styled-components';
import { FiUpload, FiX, FiImage, FiFile } from 'react-icons/fi';

const UploadContainer = styled.div`
  position: relative;
  width: 100%;
`;

const UploadArea = styled.div`
  border: 2px dashed ${props => props.isDragOver ? '#3b82f6' : '#d1d5db'};
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  background: ${props => props.isDragOver ? '#f8fafc' : '#ffffff'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #3b82f6;
    background: #f8fafc;
  }
`;

const UploadIcon = styled.div`
  font-size: 2rem;
  color: #6b7280;
  margin-bottom: 1rem;
`;

const UploadText = styled.div`
  color: #374151;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`;

const UploadSubtext = styled.div`
  color: #6b7280;
  font-size: 0.75rem;
`;

const FileInput = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
`;

const PreviewContainer = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const PreviewItem = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PreviewFile = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  color: #6b7280;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  
  &:hover {
    background: rgba(220, 38, 38, 0.9);
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.5rem;
`;

export default function FileUpload({ 
  onFileSelect, 
  onFileRemove, 
  files = [], 
  loading = false, 
  error = null,
  accept = "image/*",
  maxFiles = 1,
  type = "image" // "image" or "file"
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = (fileList) => {
    if (fileList.length === 0) return;
    
    if (fileList.length > maxFiles) {
      alert(`You can only upload ${maxFiles} file(s) at a time.`);
      return;
    }

    fileList.forEach(file => {
      if (accept && !file.type.match(accept.replace('*', '.*'))) {
        alert(`Invalid file type. Please select a ${type} file.`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB.');
        return;
      }

      onFileSelect(file);
    });
  };

  const handleRemoveFile = (index) => {
    onFileRemove(index);
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return <FiImage />;
    }
    return <FiFile />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <UploadContainer>
      <UploadArea
        isDragOver={isDragOver}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <FileInput
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={handleFileInput}
        />
        
        <UploadIcon>
          {loading ? <LoadingSpinner /> : <FiUpload />}
        </UploadIcon>
        
        <UploadText>
          {loading ? 'Uploading...' : `Drop ${type}s here or click to browse`}
        </UploadText>
        
        <UploadSubtext>
          {type === 'image' ? 'PNG, JPG, GIF up to 5MB' : 'Any file type up to 5MB'}
        </UploadSubtext>
      </UploadArea>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {files.length > 0 && (
        <PreviewContainer>
          {files.map((file, index) => (
            <PreviewItem key={index}>
              {file.type.startsWith('image/') ? (
                <PreviewImage 
                  src={file.preview || file.url} 
                  alt={file.name}
                />
              ) : (
                <PreviewFile>
                  {getFileIcon(file)}
                  <div style={{ fontSize: '10px', marginTop: '4px' }}>
                    {file.name.length > 10 ? file.name.substring(0, 10) + '...' : file.name}
                  </div>
                  <div style={{ fontSize: '8px', color: '#9ca3af' }}>
                    {formatFileSize(file.size)}
                  </div>
                </PreviewFile>
              )}
              
              <RemoveButton onClick={() => handleRemoveFile(index)}>
                <FiX />
              </RemoveButton>
            </PreviewItem>
          ))}
        </PreviewContainer>
      )}
    </UploadContainer>
  );
}
