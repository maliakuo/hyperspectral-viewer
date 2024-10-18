// components/ImageRenderer.js
import React, { useEffect, useRef, useState } from 'react';

const ImageRenderer = ({ data, metadata }) => {
  const canvasRef = useRef(null);
  let defaultBands = false;

  useEffect(() => {
    if (data && metadata) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      let defaultVals, defaultRed, defaultGreen, defaultBlue;

      const samples = parseInt(metadata.samples, 10);
      const lines = parseInt(metadata.lines, 10);

      // Checking to see if .hdr has default bands for visualization
      if (metadata["default bands"]) {
        defaultBands = true;
        defaultVals = metadata["default bands"].replace(/[{}]/g, '').split(',').map(Number);
        defaultRed = defaultVals[0];
        defaultGreen = defaultVals[1];
        defaultBlue = defaultVals[2];
      } else {
        defaultBands = false;
      }

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

        if (defaultBands) {
          const redValue = data[defaultRed][Math.floor(i / samples)][i % samples];
          const normalizedRed = Math.floor((redValue / 255) * 255);
  
          const greenValue = data[defaultGreen][Math.floor(i / samples)][i % samples];
          const normalizedGreen = Math.floor((greenValue / 255) * 255);
  
          const blueValue = data[defaultBlue][Math.floor(i / samples)][i % samples];
          const normalizedBlue = Math.floor((blueValue / 255) * 255);
  
          // Set the RGB channels 
          imageData.data[i * 4 + 0] = normalizedRed; // Red
          imageData.data[i * 4 + 1] = normalizedGreen; // Green
          imageData.data[i * 4 + 2] = normalizedBlue; // Blue
          imageData.data[i * 4 + 3] = 255; // Alpha (fully opaque)
        } else {
            const value = data[0][Math.floor(i / samples)][i % samples]; // First band
            const normalizedValue = Math.floor((value / 255) * 255); // Normalize the value to fit into 

            // Set the RGB channels to the normalized value for grayscale
            imageData.data[i * 4 + 0] = normalizedValue; // Red
            imageData.data[i * 4 + 1] = normalizedValue; // Green
            imageData.data[i * 4 + 2] = normalizedValue; // Blue
            imageData.data[i * 4 + 3] = 255; // Alpha (fully opaque)
        }

        
      }

      // Put the generated image data into the canvas
      ctx.putImageData(imageData, 0, 0);
    }
  }, [data, metadata]);

  return <canvas ref={canvasRef} />;
};

export default ImageRenderer;
