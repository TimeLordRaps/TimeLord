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
    requirementsDocument: string;
    competitiveAnalysisWebQuery: string;
    competitiveAnalysisResults: string;
    identicality: string;
    competitionFeatures: string;
    backlog: string;
    plan: string;
    projectStructure: string;
    environmentSetup: string;
    environmentState: string;
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
        this.requirementsDocument = "";
        this.competitiveAnalysisWebQuery = "";
        this.competitiveAnalysisResults = "";
        this.identicality = "";
        this.competitionFeatures = "";
        this.backlog = "";
        this.plan = "";
        this.projectStructure = "";
        this.environmentSetup = "";
        this.environmentState = "";
        this.complete = false;
    }
}

export { AgentState, ComponentDesignerState };