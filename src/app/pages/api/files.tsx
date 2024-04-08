// pages/api/files.tsx
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { IFile } from '../utils/types';
import { FileResponse } from '../utils/types';


// Helper to sanitize input to prevent directory traversal
function sanitizeFilename(filename: string): string {
  return path.basename(filename);
}

// API handler to process file operations
export default function handler(req: NextApiRequest, res: NextApiResponse<FileResponse>) {
  const { query: { filename }, method, body } = req;

  // Construct file path from filename query parameter
  const safeFilename = sanitizeFilename(filename as string);
  const filePath = path.join(process.env.FILE_STORAGE_PATH || '/workspace', safeFilename);

  switch (method) {
    case 'GET': // Retrieve a file
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(404).json({ message: 'File not found' });
        res.status(200).json({ message: 'File retrieved successfully', content: data });
      });
      break;

    case 'POST': // Create or update a file
      fs.writeFile(filePath, body.content, 'utf8', err => {
        if (err) return res.status(500).json({ message: 'Error writing file' });
        res.status(201).json({ message: 'File saved successfully' });
      });
      break;

    case 'PUT': // Update an existing file
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found' });
      }
      fs.writeFile(filePath, body.content, 'utf8', err => {
        if (err) return res.status(500).json({ message: 'Error updating file' });
        res.status(200).json({ message: 'File updated successfully' });
      });
      break;

    case 'DELETE': // Delete a file
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found' });
      }
      fs.unlink(filePath, err => {
        if (err) return res.status(500).json({ message: 'Error deleting file' });
        res.status(200).json({ message: 'File deleted successfully' });
      });
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}
