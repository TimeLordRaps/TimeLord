import { ChatPromptTemplate } from "@langchain/core/prompts";
import { model } from "./model";
import { Agent } from "./agent"
import { AgentState } from "./agentState"
import { getFileTree } from "./tools/fileTool";
import { HumanMessage } from "@langchain/core/messages";


const leadTesterSystemPromptTemplate = "You are the Lead Tester for a software engineering company. You are responsible for testing the software and ensuring that it is bug-free and functions according to the requirements document: {requirementsDocument}."

const stakeholdersRequest = "The stakeholders want you to respond to this request: {userRequest}"

const jobTellLeadProgrammerWhatTestsToDo = "Your job is to communicate with the Lead Programmer to tell them what tests should be written and run for the current feature: {currentFeature}."

const showCodeSnippets = "Here are the relevant sections of files provided by the lead Programmer:\n\n{relevantFiles}"

const showFileTree = "Here is the file tree of the project:\n\n{fileTree}"

const generateMessageForLeadProgrammer = stakeholdersRequest + "\n\n" + jobTellLeadProgrammerWhatTestsToDo + "\n\n" + showCodeSnippets

const generateCompletionCheckPromptTemplate = stakeholdersRequest + "\n\n" + "The Lead Programmer has provided you with the following information: {leadProgrammerMessage}.\n\nYour answer should start with the word complete if the project has met the requirements, any other response will be considered incomplete."

class LeadTester extends Agent {
    constructor() {
        super("Lead Tester", leadTesterSystemPromptTemplate, model);
    }
    async generateMessageForLeadProgrammer(agentState: AgentState) {
        const prompt = ChatPromptTemplate.fromMessages([
            ["system", leadTesterSystemPromptTemplate],
            ["user", generateMessageForLeadProgrammer]
        ])
        agentState.messages.push(new HumanMessage(generateMessageForLeadProgrammer))
        const chain = prompt.pipe(model);
        agentState.leadTesterMessages.push(await chain.invoke({
            userRequest: agentState.userMessages[agentState.userMessages.length - 1].content,
            currentFeature: agentState.currentFeature,
            relevantFiles: agentState.relevantFiles,
            fileTree: getFileTree()
        }));
        agentState.messages.push(agentState.leadProgrammerMessages[agentState.leadProgrammerMessages.length - 1])
        console.log(agentState.messages[agentState.messages.length - 1].content)
        return agentState;
    }
}
export { LeadTester };