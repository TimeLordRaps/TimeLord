import { ChatPromptTemplate } from "@langchain/core/prompts";
import { model } from "./model";
import { Agent } from "./agent"
import { AgentState } from "./agentState"

const featureSuggesterSystemPromptTemplate = "You are the Feature Suggester for a software engineering company. You are responsible for suggesting new features for the company's products and services."

const generateFeatureSuggestionPromptTemplate = "The stakeholders want you to respond to this request: {userRequest} by generating a prioritized list of feature suggestions that will satisfy the request efficiently and effectively. Our competitive analyst has provided you with the following information on the competition:\n {competitionFeatures}.\nThe project lead has provided you with the following information on the project's requirements:\n {requirementsDocument}.\nPlease use this information to generate the feature suggestions."

class FeatureSuggester extends Agent {
    constructor() {
        super("Feature Suggester", featureSuggesterSystemPromptTemplate, model);
    }
    async generateFeatureSuggestion(agentState: AgentState) {
        const prompt = ChatPromptTemplate.fromMessages([
            ["system", featureSuggesterSystemPromptTemplate],
            ["user", generateFeatureSuggestionPromptTemplate]
        ])
        const chain = prompt.pipe(model);
        agentState.featureSuggesterMessages.push(await chain.invoke({
            userRequest: agentState.userMessages[agentState.userMessages.length - 1].content,
            competitionFeatures: agentState.competitionFeatures
        }));
        agentState.backlog = String(agentState.featureSuggesterMessages[agentState.featureSuggesterMessages.length - 1].content);
        return agentState;
    }
}
