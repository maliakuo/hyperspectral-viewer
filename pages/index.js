// pages/index.js
import { useState } from 'react';
import FileUpload from '../components/FileUpload';
import ImageRenderer from '../components/ImageRenderer';
import { parseHDRFile, parseBSQFile } from '../utils/parseHyperspectral';

export default function Home() {
  const [hdrMetadata, setHdrMetadata] = useState(null);
  const [imageData, setImageData] = useState(null);

  const handleUploadComplete = async (fileName) => {
    const hdrResponse = await fetch(`/uploads/${fileName.replace('.bsq', '.hdr')}`);
    const hdrText = await hdrResponse.text();
    const hdrFile = new File([hdrText], `${fileName}.hdr`, { type: 'text/plain' });
    const metadata = await parseHDRFile(hdrFile);

    const bsqResponse = await fetch(`/uploads/${fileName}`);
    const bsqBuffer = await bsqResponse.arrayBuffer();
    const bsqFile = new File([bsqBuffer], fileName, { type: 'application/octet-stream' });

    const data = await parseBSQFile(bsqFile, metadata);

    setHdrMetadata(metadata);
    setImageData(data);
  };

  return (
    <div>
      <h1>Hyperspectral Data Viewer</h1>
      <FileUpload onUploadComplete={handleUploadComplete} />
      {imageData && hdrMetadata && <ImageRenderer data={imageData} metadata={hdrMetadata} />}
    </div>
  );
}
