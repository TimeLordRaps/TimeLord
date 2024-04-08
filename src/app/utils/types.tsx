// src\app\types.ts

export interface IFile {
    name: string;
    path: string;
    size?: number;
    lastModified?: string;
  }
  
  export interface FileResponse {
    message: string;
    content?: string;
    files?: IFile[];
  }
  
  export interface User {
    id: string;
    username: string;
    email: string;
  }
  
  export interface Project {
    id: string;
    name: string;
    description: string;
    files: IFile[];
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Tool {
    id: string;
    name: string;
    description: string;
    command: string;
    args: string[];
    outputType: 'file' | 'directory' | 'stdout';
  }
  
  export interface FileChange {
    path: string;
    content: string;
    type: 'create' | 'update' | 'delete';
  }
  
  export interface Commit {
    id: string;
    message: string;
    author: User;
    files: FileChange[];
    createdAt: string;
  }