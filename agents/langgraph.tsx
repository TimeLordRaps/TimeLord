// Todo Create the high level graph for the agent system
// agents/langgraph.tsx
import { StateGraph, END } from "@langchain/langgraph";
import { ProjectLead } from "./projectLead";
import { LeadProgrammer } from "./leadProgrammer";
import { LeadTester } from "./leadTester";
// import { CompetitiveAnalyst } from "./competitiveAnalyst";
import { StructureAnalyst } from "./structureAnalyst";
import { FeatureSuggester } from "./featureSuggester";
import { AgentState } from "./agentState";

const agentState = {
  messages : {
    value : (x: AgentState, y: AgentState) => x.update(y),
    default : () => new AgentState()
  }
};




const chatGraph = new StateGraph({
  channels: agentState,
});

const chooseJob = (state: AgentState) => {
  if (String(state.leadProgrammerMessages[state.leadProgrammerMessages.length - 1].content).toLowerCase().includes("commands")) {
    return "Lead Programmer Generate Terminal Commands For Feature Implementation";
  } else if(String(state.leadProgrammerMessages[state.leadProgrammerMessages.length - 1].content).toLowerCase().includes("query")) {
    return "Lead Programmer Generate Query Command For Feature Implementation";
  } else if(String(state.leadProgrammerMessages[state.leadProgrammerMessages.length - 1].content).toLowerCase().includes("edit")) {
    return "Lead Programmer Generate Edit Command For Feature Implementation";
  } else if(String(state.leadProgrammerMessages[state.leadProgrammerMessages.length - 1].content).toLowerCase().includes("summon")) {
    return "Lead Programmer Generate Summon Command For Feature Implementation";
  } else if(String(state.leadProgrammerMessages[state.leadProgrammerMessages.length - 1].content).toLowerCase().includes("complete")) {
    return "Lead Tester Generate Message For Lead Programmer";
  }
}

const testsWork = (state: AgentState) => {
  if (String(state.leadTesterMessages[state.leadTesterMessages.length - 1].content).toLowerCase().startsWith("complete")) {
    return "Project Lead Check Completion";
  }
  return "Lead Tester Generate Message For Lead Programmer";
}

const projectLeadApproves = (state: AgentState) => {
  if (String(state.projectLeadMessages[state.projectLeadMessages.length - 1].content).toLowerCase().startsWith("complete")) {
    return "Complete";
  }
  return "Incomplete";
}
const projectLead = new ProjectLead();
const leadProgrammer = new LeadProgrammer();
const leadTester = new LeadTester();
// const competitiveAnalyst = new CompetitiveAnalyst();
const structureAnalyst = new StructureAnalyst();
const featureSuggester = new FeatureSuggester();



chatGraph.addNode("Project Lead Requirements Document", projectLead.generateRequirementsDocument);
chatGraph.addNode("Project Lead Plan", projectLead.generatePlan);
chatGraph.addNode("Project Lead Check Completion", projectLead.checkCompletion);
chatGraph.addNode("Feature Suggester Generate Feature Suggestion", featureSuggester.generateFeatureSuggestion);
chatGraph.addNode("Lead Programmer Generate Terminal Commands For Environment Setup", leadProgrammer.generateTerminalCommandsForEnvironmentSetup);
chatGraph.addNode("Lead Programmer Generate Terminal Commands For Feature Implementation", leadProgrammer.generateTerminalCommandsForFeatureImplementation);
chatGraph.addNode("Lead Programmer Generate Query Command For Feature Implementation", leadProgrammer.generateQueryCommandForFeatureImplementation);
chatGraph.addNode("Lead Programmer Generate Edit Command For Feature Implementation", leadProgrammer.generateEditCommandForFeatureImplementation);
chatGraph.addNode("Lead Programmer Generate Summon Command For Feature Implementation", leadProgrammer.generateSummonCommandForFeatureImplementation);
chatGraph.addNode("Lead Programmer Generate Job Action Decision", leadProgrammer.generateJobActionDecision);
chatGraph.addNode("Lead Tester Generate Message For Lead Programmer", leadTester.generateMessageForLeadProgrammer);
// chatGraph.addNode("Competitive Analyst Generate Web Search Query", competitiveAnalyst.generateWebSearchQuery);
// chatGraph.addNode("Competitive Analyst Decide Identicality", competitiveAnalyst.decideIdenticality);
chatGraph.addNode("Structure Analyst Generate Structure Analysis", structureAnalyst.generateStructureAnalysis);
chatGraph.addNode("Structure Analyst Generate Environment Setup", structureAnalyst.generateEnvironmentSetup);

chatGraph.setEntryPoint("Project Lead Requirements Document");
chatGraph.addEdge("Project Lead Requirements Document", "Project Lead Plan");
chatGraph.addEdge("Project Lead Plan", "Feature Suggester Generate Feature Suggestion");
chatGraph.addEdge("Feature Suggester Generate Feature Suggestion", "Structure Analyst Generate Structure Analysis");
chatGraph.addEdge("Structure Analyst Generate Structure Analysis", "Structure Analyst Generate Environment Setup");
chatGraph.addEdge("Structure Analyst Generate Environment Setup", "Lead Programmer Generate Terminal Commands For Environment Setup");
chatGraph.addEdge("Lead Programmer Generate Terminal Commands For Environment Setup", "Lead Programmer Generate Job Action Decision");
chatGraph.addConditionalEdges("Lead Programmer Generate Job Action Decision", chooseJob, {
  "Lead Programmer Generate Terminal Commands For Feature Implementation": "Lead Programmer Generate Terminal Commands For Feature Implementation",
  "Lead Programmer Generate Query Command For Feature Implementation": "Lead Programmer Generate Query Command For Feature Implementation",
  "Lead Programmer Generate Edit Command For Feature Implementation": "Lead Programmer Generate Edit Command For Feature Implementation",
  "Lead Programmer Generate Summon Command For Feature Implementation": "Lead Programmer Generate Summon Command For Feature Implementation",
  "Lead Tester Generate Message For Lead Programmer": "Lead Tester Generate Message For Lead Programmer"
});
chatGraph.addEdge("Lead Programmer Generate Terminal Commands For Feature Implementation", "Lead Programmer Generate Job Action Decision");
chatGraph.addEdge("Lead Programmer Generate Query Command For Feature Implementation", "Lead Programmer Generate Job Action Decision");
chatGraph.addEdge("Lead Programmer Generate Edit Command For Feature Implementation", "Lead Programmer Generate Job Action Decision");
chatGraph.addEdge("Lead Programmer Generate Summon Command For Feature Implementation", "Lead Programmer Generate Job Action Decision");
chatGraph.addConditionalEdges("Lead Tester Generate Message For Lead Programmer", testsWork, {
  "Lead Tester Generate Message For Lead Programmer": "Lead Tester Generate Message For Lead Programmer",
  "Project Lead Check Completion": "Project Lead Check Completion"
});
chatGraph.addConditionalEdges("Project Lead Check Completion", projectLeadApproves, {
  "Complete": END,
  "Incomplete": "Lead Tester Generate Message For Lead Programmer"
});



export const runnable = chatGraph.compile();