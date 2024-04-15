// Todo Create the high level graph for the agent system
// agents/langgraph.tsx
import { StateGraph, END } from "@langchain/langgraph";
import { BaseMessage, AIMessage, HumanMessage } from "@langchain/core/messages";
import { model } from "./model";


chatGraph.addNode("response", async (state: BaseMessage[]) => {
  const lastMessage = state[state.length - 1] as HumanMessage;
  const response = await model.invoke([lastMessage]);
  return { messages: [new AIMessage(response.content)] };
});

chatGraph.addEdge("response", END);
chatGraph.setEntryPoint("response");

export const runnable = chatGraph.compile();
