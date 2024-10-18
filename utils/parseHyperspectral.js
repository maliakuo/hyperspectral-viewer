// utils/parseHyperspectral.js

export async function parseHDRFile(hdrFile) {
    const text = await hdrFile.text(); // Read the content of the HDR file as a string
    const metadata = {};
  
    // Parse the HDR file line by line
    text.split('\n').forEach((line) => {
      const [key, value] = line.split('=');
      if (key && value) {
        metadata[key.trim()] = value.trim();
      }
    });
  
    // Convert essential metadata into numbers (samples and lines)
    return {
      ...metadata,
      samples: parseInt(metadata.samples, 10),
      lines: parseInt(metadata.lines, 10),
      bands: parseInt(metadata.bands, 10),  // Assuming "bands" is provided in the hdr
    };
  }
  
  export async function parseBSQFile(bsqFile, metadata) {
    const { samples, lines, bands } = metadata;
    const buffer = await bsqFile.arrayBuffer(); // Read the entire binary content of the BSQ file
    const view = new DataView(buffer);
  
    const data = [];
    const bytesPerSample = 2; // Assuming 16-bit data (2 bytes per sample)
  
    // Iterate over each band, line, and sample to extract data
    for (let band = 0; band < bands; band++) {
      const bandData = [];
      for (let line = 0; line < lines; line++) {
        const lineData = [];
        for (let sample = 0; sample < samples; sample++) {
          const offset = band * lines * samples * bytesPerSample + line * samples * bytesPerSample + sample * bytesPerSample;
          lineData.push(view.getUint16(offset, true)); // Read 16-bit unsigned integer
        }
        bandData.push(lineData);
      }
      data.push(bandData);
    }
  
    return data; // The data array contains [band][line][sample] values
  }
  