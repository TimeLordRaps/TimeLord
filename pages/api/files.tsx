// pages/api/files.tsx
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { IFile, FileResponse } from '../../utils/types';

// Helper to sanitize input to prevent directory traversal
function sanitizeFilename(filename: string): string {
  return path.basename(filename);
}

// API handler to process file operations
export default function handler(req: NextApiRequest, res: NextApiResponse<FileResponse>) {
  const { query: { filename }, method, body } = req;

  const workspacePath = process.env.FILE_STORAGE_PATH || '/workspace';

  switch (method) {
    case 'GET': // Retrieve a file or list of files
      if (filename) {
        const safeFilename = sanitizeFilename(filename as string);
        const filePath = path.join(workspacePath, safeFilename);
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            console.error('Error reading file:', err);
            return res.status(404).json({ message: 'File not found' });
          }
          res.status(200).json({ message: 'File retrieved successfully', content: data });
        });
      } else {
        fs.readdir(workspacePath, (err, files) => {
          if (err) {
            console.error('Error reading workspace directory:', err);
            return res.status(500).json({ message: 'Error reading workspace directory' });
          }
          const fileList: IFile[] = files.map(file => ({
            name: file,
            path: path.join(workspacePath, file),
          }));
          res.status(200).json({ message: 'Files retrieved successfully', files: fileList });
        });
      }
      break;

    case 'POST': // Create or update a file
      if (!filename) {
        return res.status(400).json({ message: 'Filename is required' });
      }
      if (!body.content) {
        return res.status(400).json({ message: 'File content is required' });
      }
      const safeFilename = sanitizeFilename(filename as string);
      const filePath = path.join(workspacePath, safeFilename);
      fs.writeFile(filePath, body.content, 'utf8', err => {
        if (err) return res.status(500).json({ message: 'Error writing file' });
        res.status(201).json({ message: 'File saved successfully' });
      });
      break;

    case 'PUT': // Update an existing file
      if (!filename) {
        return res.status(400).json({ message: 'Filename is required' });
      }
      if (!body.content) {
        return res.status(400).json({ message: 'File content is required' });
      }
      const safeUpdateFilename = sanitizeFilename(filename as string);
      const updateFilePath = path.join(workspacePath, safeUpdateFilename);
      if (!fs.existsSync(updateFilePath)) {
        return res.status(404).json({ message: 'File not found' });
      }
      fs.writeFile(updateFilePath, body.content, 'utf8', err => {
        if (err) return res.status(500).json({ message: 'Error updating file' });
        res.status(200).json({ message: 'File updated successfully' });
      });
      break;

    case 'DELETE': // Delete a file
      if (!filename) {
        return res.status(400).json({ message: 'Filename is required' });
      }
      const safeDeleteFilename = sanitizeFilename(filename as string);
      const deleteFilePath = path.join(workspacePath, safeDeleteFilename);
      if (!fs.existsSync(deleteFilePath)) {
        return res.status(404).json({ message: 'File not found' });
      }
      fs.unlink(deleteFilePath, err => {
        if (err) return res.status(500).json({ message: 'Error deleting file' });
        res.status(200).json({ message: 'File deleted successfully' });
      });
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}