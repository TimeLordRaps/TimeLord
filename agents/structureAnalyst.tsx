import { ChatPromptTemplate } from "@langchain/core/prompts";
import { model } from "./model";
import { Agent } from "./agent"
import { AgentState } from "./agentState"

const structureAnalystSystemPromptTemplate = "You are the Structure Analyst for a software engineering company. You are responsible for deciding on the project structure and environment setup."

const generateStructureAnalysisPromptTemplate = "The stakeholders want you to respond to this request by generating a project structure: {userRequest} \nThe project lead has provided you with the following information on the project's requirements:\n {requirementsDocument}.\nThis is the current feature we are trying to implement: {currentFeature}\n\nPlease use this information to generate the project structure so that we can most effectively and efficiently implement the specific feature we are working on."

const generateEnvironmentSetupPromptTemplate = "The stakeholders want you to respond to this request: {userRequest} by generating effective instructions to be used in a fresh ubuntu:latest docker environment to setup the project structure that you previously provided:\n{projectStructure}."

const generateEnvironmentImprovementPromptTemplate = "The stakeholders want you to respond to this request: {userRequest} by generating effective instructions in an ubuntu:latest docker environment that was previously setup for this project structure: {projectStructure}.\nThe environment has these things installed:\n{environmentState}."

class StructureAnalyst extends Agent {
    constructor() {
        super("Structure Analyst", structureAnalystSystemPromptTemplate, model);
    }
    async generateStructureAnalysis(agentState: AgentState) {
        const prompt = ChatPromptTemplate.fromMessages([
            ["system", structureAnalystSystemPromptTemplate],
            ["user", generateStructureAnalysisPromptTemplate]
        ])
        const chain = prompt.pipe(model);
        agentState.structureAnalystMessages.push(await chain.invoke({
            userRequest: agentState.userMessages[agentState.userMessages.length - 1].content,
            requirementsDocument: agentState.requirementsDocument,
        }));
        agentState.projectStructure = String(agentState.structureAnalystMessages[agentState.structureAnalystMessages.length - 1].content);
        console.log(agentState.projectStructure)
        return agentState;
    }
    async generateEnvironmentSetup(agentState: AgentState) {
        if(agentState.environmentState === "") {
            const prompt = ChatPromptTemplate.fromMessages([
                ["system", structureAnalystSystemPromptTemplate],
                ["user", generateEnvironmentSetupPromptTemplate]
            ])
            const chain = prompt.pipe(model);
            agentState.structureAnalystMessages.push(await chain.invoke({
                userRequest: agentState.userMessages[agentState.userMessages.length - 1].content,
                projectStructure: agentState.plan
            }));
            agentState.environmentSetup = String(agentState.structureAnalystMessages[agentState.structureAnalystMessages.length - 1].content);
            console.log(agentState.environmentSetup)
            return agentState;
        } else {
            const prompt = ChatPromptTemplate.fromMessages([
                ["system", structureAnalystSystemPromptTemplate],
                ["user", generateEnvironmentImprovementPromptTemplate]
            ])
            const chain = prompt.pipe(model);
            agentState.structureAnalystMessages.push(await chain.invoke({
                userRequest: agentState.userMessages[agentState.userMessages.length - 1].content,
                projectStructure: agentState.plan,
                environmentSetup: agentState.environmentSetup
            }));
            agentState.environmentState = String(agentState.structureAnalystMessages[agentState.structureAnalystMessages.length - 1].content);
            console.log(agentState.environmentState)
            return agentState;
        }
    }
}
export { StructureAnalyst };