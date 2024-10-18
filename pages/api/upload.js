// pages/api/upload.js
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  // Ensure the upload directory exists, with detailed logging
  try {
    if (!fs.existsSync(uploadDir)) {
      console.log('Uploads directory does not exist. Creating it...');
      fs.mkdirSync(uploadDir, { recursive: true });
    } else {
      console.log('Uploads directory exists:', uploadDir);
    }
  } catch (err) {
    console.error('Error ensuring uploads directory exists:', err);
    return res.status(500).json({ success: false, message: 'Failed to create uploads directory', error: err.message });
  }

  const form = new IncomingForm({
    uploadDir,
    keepExtensions: true,
    autoClean: false,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parsing error: ', err);
      return res.status(500).json({ success: false, message: 'Form parsing failed', error: err.message });
    }

    const { chunkNumber, totalChunks, fileName } = fields;

    // Log chunkNumber and fileName for debugging
    console.log('Chunk Number:', chunkNumber);
    console.log('File Name:', fileName);

    // Use dynamic handling for files.chunk (might not always be an array)
    const chunk = Array.isArray(files.chunk) ? files.chunk[0] : files.chunk;

    // Log chunk for debugging
    console.log('Chunk Filepath:', chunk?.filepath);

    // Verify chunk and fileName exist
    if (!fileName || !chunk || !chunk.filepath) {
      return res.status(400).json({ success: false, message: 'Invalid chunk, fileName, or file path' });
    }

    try {
      // Convert chunkNumber and fileName to strings if they are arrays
      const chunkNumberStr = Array.isArray(chunkNumber) ? chunkNumber[0] : chunkNumber;
      const fileNameStr = Array.isArray(fileName) ? fileName[0] : fileName;

      const chunkFilePath = Array.isArray(chunk.filepath) ? chunk.filepath[0] : chunk.filepath;
      const chunkPath = path.join(uploadDir, `${fileNameStr}.part-${chunkNumberStr}`);

      console.log('Saving chunk to:', chunkPath);

      // Save the current chunk
      await fs.promises.rename(chunkFilePath, chunkPath);

      // If this is the last chunk, combine the file
      if (parseInt(chunkNumberStr, 10) === parseInt(totalChunks, 10)) {
        const combinedPath = path.join(uploadDir, fileNameStr);
        const writeStream = fs.createWriteStream(combinedPath);

        for (let i = 1; i <= totalChunks; i++) {
          let partPath = path.join(uploadDir, `${fileNameStr}.part-${i}`);

          // Validate partPath is a string and not an array
          partPath = Array.isArray(partPath) ? partPath[0] : partPath;
          partPath = typeof partPath === 'string' ? partPath : String(partPath);

          console.log(`Processing part ${i}, partPath:`, partPath);

          const data = await fs.promises.readFile(partPath);
          writeStream.write(data);
          await fs.promises.unlink(partPath); // Clean up the chunk
        }

        writeStream.end();
        return res.status(200).json({ success: true, message: 'File upload complete and combined' });
      } else {
        return res.status(200).json({ success: true, message: `Chunk ${chunkNumberStr} uploaded` });
      }
    } catch (error) {
      console.error('Error handling file chunks:', error);
      return res.status(500).json({ success: false, message: 'File chunk handling failed', error: error.message });
    }
  });
}
