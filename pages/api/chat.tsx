// pages/api/chat.tsx
import { v4 as uuidv4 } from 'uuid';  // For generating unique message IDs
import { NextApiRequest, NextApiResponse } from 'next';
import { runnable } from '../../agents/langgraph'
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { AgentState } from '../../agents/agentState'

let agentState = new AgentState();

class Message { 
  constructor(
    public id: string,
    public user: string, 
    public content: string,
    public timestamp: Date,
    public parentId: string | null,
    public childrenIds: string[]
  ) {}
}

class ChatHistory {
  private messages: Map<string, Message>;
  
  constructor() {
    this.messages = new Map();
  }
  
  addMessage(user: string, content: string, parentId: string | null): Message {
    const newMessage = new Message(
      uuidv4(), // Generate a unique ID
      user,
      content,
      new Date(),
      parentId,
      []
    );
    this.messages.set(newMessage.id, newMessage);
  
    // Link to parent message if applicable
    if (parentId && this.messages.has(parentId)) {
      const parentMessage = this.messages.get(parentId);
      if(!parentMessage) return newMessage;
      parentMessage.childrenIds.push(newMessage.id || '');
      this.messages.set(parentId, parentMessage as Message);
    }
    return newMessage;
  }
  
  updateMessage(messageId: string, content: string): Message | undefined {
    const message = this.messages.get(messageId);
    if (message) {
      const updatedMessage = new Message(
        message.id,
        message.user,
        content,
        message.timestamp,
        message.parentId,
        message.childrenIds
      );
      this.messages.set(messageId, updatedMessage);
      return updatedMessage;
    }
    return undefined;
  }
  
  getMessageById(messageId: string): Message | undefined {
    return this.messages.get(messageId);
  }
  
  getMessagesFrom(messageId: string): Message[] {
    const result: Message[] = [];
    const queue: string[] = [messageId];
  
    while (queue.length > 0) {
      const currentMessageId = queue.shift() || '';
      const message = this.messages.get(currentMessageId);
      if (message) {
        result.push(message);
        queue.push(...message.childrenIds);
      }
    }
  
    return result;
  }
  
  getAllMessages(): Message[] {
    return Array.from(this.messages.values());
  }
}
  
const chatHistory = new ChatHistory();

async function generateChatResponseFromOutput(output: AgentState, newMessage: Message): Promise<Message> {
  let lastMessage = newMessage;
  for(let i = 0; i < output.messages.length; i++) {
    const message = output.messages[i];
    if(message instanceof AIMessage) {
      lastMessage = chatHistory.addMessage("AI", String(message.content), lastMessage.id);
    }
  }
  return lastMessage;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { messageId } = req.query;
      if (messageId) {
        const messages = chatHistory.getMessagesFrom(messageId as string);
        res.status(200).json(messages);
      } else {
        const messages = chatHistory.getAllMessages();
        res.status(200).json(messages);
      }
    } else if (req.method === 'POST') {
      const { user, content, parentId } = req.body;
      agentState.userMessages.push(new HumanMessage(content));
      const inputs = {
        messages: agentState
      }
      let finishedOutput = await runnable.invoke(inputs);
      const newMessage = chatHistory.addMessage(user, content, parentId);
      let output = await generateChatResponseFromOutput(finishedOutput, newMessage);
      res.status(201).json(output);
    } else if (req.method === 'PUT') {
      const { messageId } = req.query;
      const { content } = req.body;
      const updatedMessage = chatHistory.updateMessage(messageId as string, content);
      if (updatedMessage) {
        res.status(200).json(updatedMessage);
      } else {
        res.status(404).json({ message: 'Message not found' });
      }
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    if(error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

export default handler;