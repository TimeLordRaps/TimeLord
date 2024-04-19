import { ChatPromptTemplate } from "@langchain/core/prompts";
import { model } from "./model";
import { Agent } from "./agent"
import { AgentState } from "./agentState"
import { HumanMessage } from "@langchain/core/messages";

const featureSuggesterSystemPromptTemplate = "You are the Feature Suggester for a software engineering company. You are responsible for suggesting which feature should be pursued next."

const generateFeatureSuggestionPromptTemplate = "The stakeholders want you to respond to this request: {userRequest} by deciding on what specific feature we should implement next from this requirements document: {requirementsDocument}."

class FeatureSuggester extends Agent {
    constructor() {
        super("Feature Suggester", featureSuggesterSystemPromptTemplate, model);
    }
    async generateFeatureSuggestion(agentState: AgentState) {
        const prompt = ChatPromptTemplate.fromMessages([
            ["system", featureSuggesterSystemPromptTemplate],
            ["user", generateFeatureSuggestionPromptTemplate]
        ])
        agentState.messages.push(new HumanMessage(generateFeatureSuggestionPromptTemplate))
        const chain = prompt.pipe(model);
        agentState.featureSuggesterMessages.push(await chain.invoke({
            userRequest: agentState.userMessages[agentState.userMessages.length - 1].content,
            requirementsDocument: agentState.requirementsDocument
        }));
        agentState.currentFeature = String(agentState.featureSuggesterMessages[agentState.featureSuggesterMessages.length - 1].content);
        agentState.messages.push(agentState.featureSuggesterMessages[agentState.featureSuggesterMessages.length - 1])
        console.log(agentState.messages[agentState.messages.length - 1].content)
        return agentState;
    }
}

export { FeatureSuggester };