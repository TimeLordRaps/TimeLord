import { BaseMessage } from "@langchain/core/messages";

class ComponentDesignerState {
    componentDesignerTitle: string;
    componentDesignerPrompt: string;
    componentDesignerMessages: BaseMessage[];

    constructor(title: string, prompt: string) {
        this.componentDesignerTitle = title;
        this.componentDesignerPrompt = prompt;
        this.componentDesignerMessages = [];
    }
}

class AgentState {
    messages: BaseMessage[];
    userMessages: BaseMessage[];
    projectLeadMessages: BaseMessage[];
    leadProgrammerMessages: BaseMessage[];
    componentDesignerStates: ComponentDesignerState[];
    structureAnalystMessages: BaseMessage[];
    leadTesterMessages: BaseMessage[];
    featureSuggesterMessages: BaseMessage[];
    competitiveAnalystMessages: BaseMessage[];
    requirementsDocument: string;
    currentFeature: string;
    competitiveAnalysisWebQuery: string;
    competitiveAnalysisResults: string;
    identicality: string;
    competitionFeatures: string;
    plan: string;
    projectStructure: string;
    environmentSetup: string;
    environmentState: string;
    terminalCommands: string[];
    terminalOutputs: string[];
    previousQuery: string;
    relevantFiles: {[key: string]: [{ content: string, lineStart: number, lineEnd: number, updatedDateTimestamp: number}]};
    complete: boolean;
    


    constructor() {
        this.messages = [];
        this.userMessages = [];
        this.projectLeadMessages = [];
        this.leadProgrammerMessages = [];
        this.componentDesignerStates = [];
        this.structureAnalystMessages = [];
        this.leadTesterMessages = [];
        this.featureSuggesterMessages = [];
        this.competitiveAnalystMessages = [];
        this.requirementsDocument = "";
        this.currentFeature = "";
        this.competitiveAnalysisWebQuery = "";
        this.competitiveAnalysisResults = "";
        this.identicality = "";
        this.competitionFeatures = "";
        this.plan = "";
        this.projectStructure = "";
        this.environmentSetup = "";
        this.environmentState = "";
        this.terminalCommands = [];
        this.terminalOutputs = [];
        this.previousQuery = "";
        this.relevantFiles = {
            "fileNameGoesHere": [{
                content: "fileContentGoesHere",
                lineStart: 0,
                lineEnd: 0,
                updatedDateTimestamp: Date.now()
            }]
        };
        this.complete = false;
    }
    update(y: AgentState) {
        this.messages = y.messages;
        this.userMessages = y.userMessages;
        this.projectLeadMessages = y.projectLeadMessages;
        this.leadProgrammerMessages = y.leadProgrammerMessages;
        this.componentDesignerStates = y.componentDesignerStates;
        this.structureAnalystMessages = y.structureAnalystMessages;
        this.leadTesterMessages = y.leadTesterMessages;
        this.featureSuggesterMessages = y.featureSuggesterMessages;
        this.competitiveAnalystMessages = y.competitiveAnalystMessages;
        this.requirementsDocument = y.requirementsDocument;
        this.currentFeature = y.currentFeature;
        this.competitiveAnalysisWebQuery = y.competitiveAnalysisWebQuery;
        this.competitiveAnalysisResults = y.competitiveAnalysisResults;
        this.identicality = y.identicality;
        this.competitionFeatures = y.competitionFeatures;
        this.plan = y.plan;
        this.projectStructure = y.projectStructure;
        this.environmentSetup = y.environmentSetup;
        this.environmentState = y.environmentState;
        this.terminalCommands = y.terminalCommands;
        this.terminalOutputs = y.terminalOutputs;
        this.previousQuery = y.previousQuery;
        this.relevantFiles = y.relevantFiles;
        this.complete = y.complete;
        return this;
    }
}

export { AgentState, ComponentDesignerState };