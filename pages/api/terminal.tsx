// pages/api/terminal.tsx
import { NextApiHandler } from 'next';
import { exec } from 'child_process';

const isDockerized = process.env.DOCKERIZED === 'true';

const executeCommand = (command: string, callback: (error: any, stdout: string, stderr: string) => void) => {
  if (isDockerized) {
    // Send the command to the separate terminal container
    exec(`docker exec timelord-terminal-1 sh -c '${command}'`, callback);
  } else {
    // Send the command to the tmux session called 'timelord'
    exec(`docker exec timelord-terminal-1 tmux send-keys -t timelord '${command}' C-m`, callback);
  }
};

const handler: NextApiHandler = (req, res) => {
  if (req.method === 'POST') {
    const { command } = req.body;
    executeCommand(command, (error, stdout, stderr) => {
      if (error) {
        res.status(500).json({ message: `Command execution error: ${error.message}` });
        return;
      }
      res.status(200).json({ message: "Command executed successfully", stdout, stderr });
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};

export default handler;