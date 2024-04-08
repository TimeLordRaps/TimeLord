import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const workspacePath = './workspace'; // Update with your actual workspace directory

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;

  switch (method) {
    case 'GET':
      if (query.file) {
        // Read a specific file
        const filePath = path.join(workspacePath, query.file as string);
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            res.status(404).json({ message: 'File not found' });
          } else {
            res.status(200).json({ content: data });
          }
        });
      } else {
        // Read all files in the workspace directory
        fs.readdir(workspacePath, (err, files) => {
          if (err) {
            res.status(500).json({ message: 'Error reading workspace directory' });
          } else {
            const fileList = files.map(file => ({
              name: file,
              path: path.join(workspacePath, file),
            }));
            res.status(200).json({ files: fileList });
          }
        });
      }
      break;

    case 'PUT':
      // Update a specific file
      const filePath = path.join(workspacePath, query.file as string);
      const fileContent = req.body.content;
      fs.writeFile(filePath, fileContent, 'utf8', (err) => {
        if (err) {
          res.status(500).json({ message: 'Error updating file' });
        } else {
          res.status(200).json({ message: 'File updated successfully' });
        }
      });
      break;

    default:
      res.status(405).json({ message: 'Method not allowed' });
  }
}