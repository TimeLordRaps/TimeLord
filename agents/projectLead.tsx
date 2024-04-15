import { ChatPromptTemplate } from "@langchain/core/prompts";
import { model } from "./model";
import { Agent } from "./agent"
import { AgentState } from "./agentState"
// TODO: Create the Project Lead agent

const projectLeadSystemPromptTemplate = "You are the Project Lead for a software engineering company. You are responsible for the overall success of projects. You will be communicating directly with the Lead Programmer and Lead Tester to guarantee the project has met the requirements of the stakeholders"

const projectLeadRequirementsDocumentPromptTemplateInitial = "The stakeholders want you to respond to this request: {userRequest}. You need to create a requirements document that outlines the project's goals, objectives, and deliverables that lead to accomplishing the stakeholders' request."

const projectLeadRequirementsDocumentPromptTemplateAddition = "The stakeholders want you to respond to this new request: {userRequest}. You only need to add: goals, objectives, and deliverables to the present requirements document:\n{requirementsDocument}.\nOnly provide new information as it will be concatenated to the existing requirements document."

const projectLeadPlanningPromptTemplate = "The stakeholders want you to respond to this new request: {userRequest}. You need to design a plan that outlines the tasks necessary to complete the project. The plan should include explicit steps for implementing the following featues: {backlog}."

const projectLeadCompletionCheckPromptTemplate = "In response to this stakeholder request: {userRequest}. You need to check if the project has met the requirements of the request. The Lead Programmer has provided you with the following information: {leadProgrammerMessage}, and the Lead Tester has provided you with the following information: {leadTesterMessage}. Your answer should start with the word complete if the project has met the requirements, any other response will be considered incomplete."



class ProjectLead extends Agent {
    constructor() {
        super("Project Lead", projectLeadSystemPromptTemplate, model);
    }
    async generateRequirementsDocument(agentState: AgentState) {
        if (agentState.requirementsDocument === "") {
            const prompt = ChatPromptTemplate.fromMessages([
                ["system", projectLeadSystemPromptTemplate],
                ["user", projectLeadRequirementsDocumentPromptTemplateInitial]
            ])
            const chain = prompt.pipe(model);
            agentState.projectLeadMessages.push(await chain.invoke({
                userRequest: agentState.userMessages[agentState.userMessages.length - 1].content
            }));
            agentState.requirementsDocument = String(agentState.projectLeadMessages[agentState.projectLeadMessages.length - 1].content);
            return agentState
        }
        else {
            const prompt = ChatPromptTemplate.fromMessages([
                ["system", projectLeadSystemPromptTemplate],
                ["user", projectLeadRequirementsDocumentPromptTemplateAddition]
            ])
            const chain = prompt.pipe(model);
            agentState.projectLeadMessages.push(await chain.invoke({
                userRequest: agentState.userMessages[agentState.userMessages.length - 1].content,
                requirementsDocument: agentState.requirementsDocument
            }));
            const newRequirements = String(agentState.projectLeadMessages[agentState.projectLeadMessages.length - 1].content);
            agentState.requirementsDocument = agentState.requirementsDocument + "\n" + newRequirements;
            agentState.backlog = newRequirements
            return agentState
        }
    }
    async generatePlan(agentState: AgentState) {
        const prompt = ChatPromptTemplate.fromMessages([
            ["system", projectLeadSystemPromptTemplate],
            ["user", projectLeadPlanningPromptTemplate]
        ])
        const chain = prompt.pipe(model);
        agentState.projectLeadMessages.push(await chain.invoke({
            userRequest: agentState.userMessages[agentState.userMessages.length - 1].content,
            backlog: agentState.backlog
        }));
        agentState.plan = String(agentState.projectLeadMessages[agentState.projectLeadMessages.length - 1].content);
        return agentState
    }        

    async checkCompletion(agentState: AgentState) {
        const prompt = ChatPromptTemplate.fromMessages([
            ["system", projectLeadSystemPromptTemplate],
            ["user", projectLeadCompletionCheckPromptTemplate]
        ])
        const chain = prompt.pipe(model);
        agentState.projectLeadMessages.push(await chain.invoke({
            userRequest: agentState.userMessages[agentState.userMessages.length - 1].content,
            leadProgrammerMessage: agentState.leadProgrammerMessages[agentState.leadProgrammerMessages.length - 1].content,
            leadTesterMessage: agentState.leadTesterMessages[agentState.leadTesterMessages.length - 1].content
        }));

        const completion = agentState.projectLeadMessages[agentState.projectLeadMessages.length - 1].content;
        const isComplete = String(completion).toLowerCase().startsWith("complete");
        if (isComplete) {
            agentState.complete = true;
        }
        return agentState
    }
}

export { ProjectLead };