// components/ImageRenderer.js
import React, { useEffect, useRef } from 'react';

const ImageRenderer = ({ data, metadata }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (data && metadata) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      const samples = parseInt(metadata.samples, 10);
      const lines = parseInt(metadata.lines, 10);

      if (isNaN(samples) || isNaN(lines)) {
        console.error('Invalid samples or lines values');
        return;
      }

      // Set canvas width and height to match the image size
      canvas.width = samples;
      canvas.height = lines;

      // Create ImageData to manipulate pixel values
      const imageData = ctx.createImageData(samples, lines);

      for (let i = 0; i < samples * lines; i++) {
        // For simplicity, we will use only the first band for grayscale rendering
        const value = data[0][Math.floor(i / samples)][i % samples]; // First band
        const normalizedValue = Math.floor((value / 255) * 255); // Normalize the value to fit into RGB space

        // Set the RGB channels to the normalized value for grayscale
        imageData.data[i * 4 + 0] = normalizedValue; // Red
        imageData.data[i * 4 + 1] = normalizedValue; // Green
        imageData.data[i * 4 + 2] = normalizedValue; // Blue
        imageData.data[i * 4 + 3] = 255; // Alpha (fully opaque)
      }

      // Put the generated image data into the canvas
      ctx.putImageData(imageData, 0, 0);
    }
  }, [data, metadata]);

  return <canvas ref={canvasRef} />;
};

export default ImageRenderer;
