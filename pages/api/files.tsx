import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const workspacePath = process.env.FILE_STORAGE_PATH || './workspace';

const readFileTree = (dirPath: string) => {
  const files = fs.readdirSync(dirPath);
  const fileTree = files.map(file => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      return {
        name: file,
        path: filePath,
        isDirectory: true,
        children: readFileTree(filePath),
      };
    } else {
      return {
        name: file,
        path: filePath,
        isDirectory: false,
      };
    }
  });
  return fileTree;
};

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
        // Read the file tree
        const fileTree = readFileTree(workspacePath);
        res.status(200).json({ files: fileTree });
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