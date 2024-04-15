import { ChatPromptTemplate } from "@langchain/core/prompts";
import { model } from "./model";
import { Agent } from "./agent"
import { AgentState } from "./agentState"

const competitiveAnalystSystemPromptTemplate = "You are the Competitive Analyst for a software engineering company. You are responsible for analyzing the competition and providing insights to the stakeholders on how to improve the company's products and services."

const generateWebSearchQueryPromptTemplate = "The stakeholders want you to respond to this request: {userRequest} by generating a web search query that will provide you with the information you need to analyze the competition."

const identicalityDecisionPromptTemplate = "The stakeholders want you to respond to this request: {userRequest}. You have found this information on the competition: {competitiveAnalysisResults}. You need to decide if the competition is identical to and will fulfill the request. If it is identical your response should start with the word identical and include information that represents what and how it accomplishes the request, any other response will be considered non-identical and used to generate a backlog of features we need to implement based on the competition."

class CompetitiveAnalyst extends Agent {
    constructor() {
        super("Competitive Analyst", competitiveAnalystSystemPromptTemplate, model);
    }
    async generateWebSearchQuery(agentState: AgentState) {
        const prompt = ChatPromptTemplate.fromMessages([
            ["system", competitiveAnalystSystemPromptTemplate],
            ["user", generateWebSearchQueryPromptTemplate]
        ])
        const chain = prompt.pipe(model);
        agentState.competitiveAnalystMessages.push(await chain.invoke({
            userRequest: agentState.userMessages[agentState.userMessages.length - 1].content
        }));

        const webSearchQuery = String(agentState.competitiveAnalystMessages[agentState.competitiveAnalystMessages.length - 1].content);
        agentState.competitiveAnalysisWebQuery = String(webSearchQuery);
        return agentState;
    }
    async decideIdenticality(agentState: AgentState) {
        const prompt = ChatPromptTemplate.fromMessages([
            ["system", competitiveAnalystSystemPromptTemplate],
            ["user", identicalityDecisionPromptTemplate]
        ])
        const chain = prompt.pipe(model);
        agentState.competitiveAnalystMessages.push(await chain.invoke({
            userRequest: agentState.userMessages[agentState.userMessages.length - 1].content,
            competitiveAnalysisResults: agentState.competitiveAnalysisResults
        }));
        const identicalityResponse = String(agentState.competitiveAnalystMessages[agentState.competitiveAnalystMessages.length - 1].content);
        const isIdentical = identicalityResponse.toLowerCase().startsWith("identical");
        if (isIdentical) {
            agentState.identicality = String(identicalityResponse);
        } else {
            agentState.competitionFeatures = String(identicalityResponse);
        }
        return agentState;
    }
}

export { CompetitiveAnalyst };