// components/FileUpload.js
import React, { useState } from 'react';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB per chunk

const FileUpload = ({ onUploadComplete }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const uploadFiles = async (hdrFile, bsqFile) => {
    setUploading(true);

    // Upload the HDR file (single request)
    const hdrFormData = new FormData();
    hdrFormData.append('file', hdrFile);
    hdrFormData.append('fileName', hdrFile.name);

    const hdrUploadResponse = await fetch('/api/upload-hdr', {
      method: 'POST',
      body: hdrFormData,
    });

    if (!hdrUploadResponse.ok) {
      alert('HDR file upload failed');
      setUploading(false);
      return;
    }

    // Upload the BSQ file in chunks
    const totalChunks = Math.ceil(bsqFile.size / CHUNK_SIZE);
    for (let currentChunk = 0; currentChunk < totalChunks; currentChunk++) {
      const start = currentChunk * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, bsqFile.size);
      const chunk = bsqFile.slice(start, end);

      const bsqFormData = new FormData();
      bsqFormData.append('chunk', chunk);
      bsqFormData.append('chunkNumber', currentChunk + 1);
      bsqFormData.append('totalChunks', totalChunks);
      bsqFormData.append('fileName', bsqFile.name); // Ensure fileName is passed

      const bsqUploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: bsqFormData,
      });

      if (!bsqUploadResponse.ok) {
        alert('BSQ chunk upload failed');
        setUploading(false);
        return;
      }

      setUploadProgress(((currentChunk + 1) / totalChunks) * 100);
    }

    setUploading(false);
    setUploadProgress(100);
    onUploadComplete(bsqFile.name);
  };

  const handleFileUpload = (files) => {
    const hdrFile = [...files].find(file => file.name.endsWith('.hdr'));
    const bsqFile = [...files].find(file => file.name.endsWith('.bsq'));

    if (hdrFile && bsqFile) {
      uploadFiles(hdrFile, bsqFile);
    } else {
      alert('Please upload both .hdr and .bsq files.');
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".bsq,.hdr"
        multiple
        onChange={(e) => handleFileUpload(e.target.files)}
        disabled={uploading}
      />
      {uploading && (
        <div>
          <progress value={uploadProgress} max="100"></progress>
          <p>{Math.round(uploadProgress)}% uploaded</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
