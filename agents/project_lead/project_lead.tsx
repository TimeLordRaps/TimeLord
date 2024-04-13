import { ChatAnthropic } from "@langchain/anthropic";
import { HumanMessage, BaseMessage } from "@langchain/core/messages";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { AgentExecutor, createOpenAIToolsAgent } from "langchain/agents";
import { Runnable } from "@langchain/core/runnables";
import { model } from "../llms/model";
import { askUser } from "../tools/askUser";
// TODO: Create the Project Lead agent