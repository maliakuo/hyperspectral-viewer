// pages/api/upload.js
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

// New path inside the public folder
const uploadDir = path.join(process.cwd(), 'public', 'uploads'); 

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const form = new IncomingForm({ uploadDir, keepExtensions: true });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('Form parsing error: ', err);
      return res.status(500).json({ success: false, message: 'Error parsing the form', error: err.message });
    }

    const file = files.file ? files.file[0] : null;
    if (!file || !file.filepath) {
      return res.status(400).json({ success: false, message: 'File is missing or invalid' });
    }

    try {
      const destPath = path.join(uploadDir, file.originalFilename); // Correct path inside public/uploads
      fs.renameSync(file.filepath, destPath);
      return res.status(200).json({ success: true, message: 'File uploaded successfully' });
    } catch (error) {
      console.error('Error saving file:', error);
      return res.status(500).json({ success: false, message: 'Error saving file', error: error.message });
    }
  });
}
