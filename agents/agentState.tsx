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
    userMessages: BaseMessage[];
    projectLeadMessages: BaseMessage[];
    leadProgrammerMessages: BaseMessage[];
    componentDesignerStates: ComponentDesignerState[];
    structureAnalystMessages: BaseMessage[];
    leadTesterMessages: BaseMessage[];
    featureSuggesterMessages: BaseMessage[];
    competitiveAnalystMessages: BaseMessage[];
    requirementsDocument: string[];
    currentFeature: string;
    competitiveAnalysisWebQuery: string;
    competitiveAnalysisResults: string;
    identicality: string;
    competitionFeatures: string;
    backlog: string;
    plan: string;
    projectStructure: string;
    environmentSetup: string;
    terminalCommands: string[];
    terminalOutputs: string[];
    previousQuery: string;
    relevantFiles: {[key: string]: [{ content: string, lineStart: number, lineEnd: number, updatedDateTimestamp: number}]};
    complete: boolean;
    


    constructor() {
        this.userMessages = [];
        this.projectLeadMessages = [];
        this.leadProgrammerMessages = [];
        this.componentDesignerStates = [];
        this.structureAnalystMessages = [];
        this.leadTesterMessages = [];
        this.featureSuggesterMessages = [];
        this.competitiveAnalystMessages = [];
        this.requirementsDocument = [];
        this.currentFeature = "";
        this.competitiveAnalysisWebQuery = "";
        this.competitiveAnalysisResults = "";
        this.identicality = "";
        this.competitionFeatures = "";
        this.backlog = "";
        this.plan = "";
        this.projectStructure = "";
        this.environmentSetup = "";
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
}

export { AgentState, ComponentDesignerState };