// pages/api/upload-hdr.js
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

  // Configure IncomingForm
  const form = new IncomingForm({
    uploadDir,
    keepExtensions: true,
    autoClean: false, // Prevent Formidable from automatically cleaning up the temporary file
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parsing error: ', err);
      return res.status(500).json({ success: false, message: 'Error parsing the form', error: err.message });
    }

    // Log parsed fields and files for debugging
    console.log('Parsed fields: ', fields);
    console.log('Parsed files: ', files);

    // Access the first file in the array
    const file = files.file ? files.file[0] : null;  // Use the first element in case it's an array

    // Check if the file is missing or invalid
    if (!file || !file.filepath) {
      console.error('HDR file is missing or invalid');
      return res.status(400).json({ success: false, message: 'HDR file is missing or invalid' });
    }

    // Ensure the destination directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const destPath = path.join(uploadDir, file.originalFilename);

    try {
      // Check if the file exists before renaming
      if (fs.existsSync(file.filepath)) {
        // Use promises.rename for better error handling
        await fs.promises.rename(file.filepath, destPath);

        return res.status(200).json({ success: true, message: 'HDR file uploaded successfully' });
      } else {
        console.error('HDR file not found at temporary location');
        return res.status(500).json({ success: false, message: 'HDR file not found at temporary location' });
      }
    } catch (error) {
      console.error('Error saving HDR file: ', error);
      return res.status(500).json({ success: false, message: 'Error saving HDR file', error: error.message });
    }
  });
}
