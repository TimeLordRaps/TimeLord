//TODO:add messages push to each generate function in all agents
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { model } from "./model";
import { Agent } from "./agent"
import { AgentState } from "./agentState"
import { HumanMessage } from "@langchain/core/messages";
import { findInFiles, goToLine, querySemantic, replaceInFile, insertInFile, getFileTree } from "./tools/fileTool"


// The system prompt template for the Lead Programmer agent
const leadProgrammerSystemPromptTemplate = "You are the Lead Programmer for a software engineering company. You are responsible for setting up the project's environment, creating the project's structure, and implementing the features that the project lead has outlined in the requirements document:{requirementsDocument}."


// The prompt template for generating terminal commands
const terminalCommandDescription = "You have the ability to run commands by prefacing the start of a line with the $ symbol. For example, to run the command 'ls', you would type:'\n$ ls'\n\nYou can run multiple commands in sequence by ordering your response in the order you would run the commands in the terminal. Each new command should be on a new line and prefaced with the $ symbol.\n\nHere is a file tree of the project directory:\n\n{fileTree}\n\n"

const showTerminalOutput = "You have previously run these command(s) in the terminal with their respective outputs:\n\n{previousCommands}\n\nYou should use the output of these commands to inform your response.\n\n"

const commandCompletionClause = "If you believe the environment has already been setup correctly, your response should begin with the word complete and you should not attempt to run any additional commands.\n\n"

const stakeholdersRequest = "The stakeholders want you to design a solution to this request: {userRequest}.\n\n"

const showCurrentFeature = "You are currently working on implementing this feature: {currentFeature}.\n\n"

const jobTerminalCommandsForEnvironmentSetup = "Your job is to generate effective commands to be run in an ubuntu:latest docker terminal to setup the environment and project structure:\n\n{projectStructure}\n\nUsing the following enviornment setup instructions:\n\n{environmentSetup}\n\n" 

const jobTerminalCommandsForFeatureImplementation = "Your job is to generate effective commands to be run in an ubuntu:latest docker terminal to implement the feature\n\n"

const generateTerminalCommandsForEnvironmentSetup = stakeholdersRequest + jobTerminalCommandsForEnvironmentSetup + terminalCommandDescription + showTerminalOutput + commandCompletionClause

const generateTerminalCommandsForFeatureImplementation = stakeholdersRequest + showCurrentFeature + 
+ jobTerminalCommandsForFeatureImplementation + terminalCommandDescription + showTerminalOutput + commandCompletionClause


// The prompt template for generating queries to retrieve code snippets
const queryCommandDescription = "You have the ability to generate queries to find relevant code snippets from files in a project directory that has the following file tree:\n\n{fileTree}\n\nYou should respond with multiple queries to retrieve specific sections of files in the project directory. Each query should be designed to retrieve a specific section of the files. You have these ways of querying the project directory:\n1. Start a new line with the keyword findInFiles followed by a regular expression to search for a regular expression in the files.\n2. Start a new line with the keyword goToLine followed by a line number and filepath to go to a specific line in a file.\n3. Start a new line with the keyword querySemantic followed by a semantic query to query the files as you would using natural language embeddings.\nExamples: 1. findInFiles 'import { v4 as uuidv4 } from 'uuid'' 2. goToLine 10 'pages/api/chat.tsx' 3. querySemantic 'import unique message IDs'\n\nEach query should be on a new line. You should run multiple queries in the order you want the returned sections to be displayed.\n\nEach query will return between 8 and 32 lines of code. In the case of a findInFiles query, the lines returned will be the 4 lines before and after each line that matches the regular expression. In the case of a goToLine query, the lines returned will be the 8 lines before and after the line specified by the line number. In the case of a querySemantic query, the lines returned will be any of 8, 16, 24, or 32 lines of code that most closely match the semantic query.\n\n"

const showCodeSnippets = "Here are the relevant sections of files you queried previously:\n\n{relevantFiles}"

const generateQueryCommandForFeatureImplementation = stakeholdersRequest + showCurrentFeature + queryCommandDescription + showCodeSnippets + showTerminalOutput


// The prompt template for editing files
const editCommandDescription = "You have the the ability to insert new lines of code or replace existing lines of code in files in a project directory that has the following file tree:\n\n{fileTree}\n\nYou should respond with a replace command that will make the necessary changes to the files in the project directory. To use the command start a new line with the keyword replace followed by two line numbers, a file path, and the code you want to replace the lines with (inclusive).\nExamples\n1. replace 1 5 'main.py' 'import numpy as np\nimport pandas as pd'\n\nTo insert a new line of code, use the keyword insert followed by a line number, a file path, and the code you want to insert.\nExample:\ninsert 5 'main.py' 'import numpy as np'\n\nThe specific behavior of the insert command is that it will simply paste in the code you provide at the start of the line specified, so if the line is not empty what was previously there will be appended to the end with no other modifications, so make sure to add a new line at the end of any inserts. Each replace or insert command should be on a new line. You can run multiple replace or insert commands in sequence by ordering your response in the order you want the changes to be made.\n\nTo remove lines simply replace with an empty replacement string.\nTo create a new file just pass in a file path that does not exist with lineStart as 1, and for replace make sure to make lineEnd 1 as well.\nAll file paths should be relative to the project directory.\n\n"

const editCompletionClause = "If you believe the files have already been edited correctly, your response should begin with the word complete and you should not attempt to run any additional edits.\n\n"

const generateEditCommandForFeatureImplementation = stakeholdersRequest + showCurrentFeature + editCommandDescription + showCodeSnippets + showTerminalOutput + editCompletionClause


// The prompt template for summoning a component designer
const summonCommandDescription = "You have the ability to summon a component designer to assist you with a specific task, they will have a larger, different, specialized context window than you that is directly relevant to implementing a component of the feature. To summon a new component designer, start a new line with the keyword summon followed by the name of the component designer you want to summmon, followed by the task you want them to assist you with, followed by any relevant context you wish to provide them, followed by a few (<5) web search queries for the information you want them to have as context.\nExample:\nsummon 'langchain_gguf_specialist' 'Provide me with code snippets and instructions on how to integrate a GGUF model using langchain into a chat interface' 'I already have the chat interface implemented and I have a GGUF model that I want to use for the language model in path/to/model/model.gguf' 'code examples for using gguf models with langchain' 'code examples for chat apps built with langchain'\n\n"

const generateSummonCommandForFeatureImplementation = stakeholdersRequest + showCurrentFeature + summonCommandDescription + showCodeSnippets + showTerminalOutput


// The prompt template for deciding which action to take
const jobActionDecisionFeatureImplementation = "Your job is to decide what action from the following list you will take to implement the feature in the fewest amount of actions:\n1. Run commands in the terminal (commands).\n2. Generate queries to retrieve new code snippets for the feature (query).\n3. Edit files in the project directory to implement the feature(edit).\n4. Summon a component designer specialized in the domain of the feature to assist you (summmon).\n5. The feature is complete and working as expected (complete).\n\nHere are situations when to use each action:\n1. Use commands when you need to setup the environment or project structure.\n2. Use queries when you need to find relevant code snippets or if the relevant code snippets contain too much irrelevant code.\n3. Use edits when you need to make changes to the codebase.\n4. Use summon when you need specialized help.\n5. Use complete when the feature is working as expected.\n\n"


const generateJobActionDecision = stakeholdersRequest + showCurrentFeature + jobActionDecisionFeatureImplementation + showCodeSnippets + showTerminalOutput

//The prompt template for responding to the lead tester
const showLeadTesterMessage = "The Lead Tester has sent you this message:\n\n{leadTesterMessage}\n\n"

const jobActionDecisionTesting = "Your job is to decide what action from the following list you will take to implement the test the lead tester told you that you need to implement in the fewest amount of actions:\n1. Run commands in the terminal (commands).\n2. Generate queries to retrieve new code snippets for the feature (query).\n3. Edit files in the project directory to implement the feature(edit).\n4. The tests are complete and passing as expected (complete).\n\nHere are situations when to use each action:\n1. Use commands when you need to run tests.\n2. Use queries when you need to find relevant code snippets or if the relevant code snippets contain too much irrelevant code.\n3. Use edits when you need to make changes to the codebase.\n4. Use complete when the test are passing as expected.\n\n"

class LeadProgrammer extends Agent {
    constructor() {
        super("Lead Programmer", leadProgrammerSystemPromptTemplate, model);
    }

    async sendTerminalCommand(command: string) {
        try {
            const response = await fetch('/api/terminal', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({ command }),
            });
    
            if (response.ok) {
                const data = await response.text();
                return data;
            } else {
                console.error('Error sending command:', response.statusText);
            }
        } catch (error) {
            console.error('Error sending command:', error);
        }
    }

    async queryFileSystem(agentState: AgentState): Promise<AgentState> {
        //Behavior is currently a complete replacement, but should be changed to a moving context window based strategy
        const queryLines = String(agentState.leadProgrammerMessages[agentState.leadProgrammerMessages.length - 1].content).split("\n");
        agentState.relevantFiles = {};
        const results = [];
        for (let i = 0; i < queryLines.length; i++) {
            if (queryLines[i].startsWith("findInFiles")) {
                const query = queryLines[i].substring(13);
                const data = await findInFiles(query);
                for (let i = 0; i < data.length; i++){
                    agentState.relevantFiles[data[i]["path"]].push({
                        "content": data[i]["content"],
                        "lineStart": data[i]["lineStart"],
                        "lineEnd": data[i]["lineEnd"],
                        "updatedDateTimestamp": Date.now()
                    });
                }
            } else if (queryLines[i].startsWith("goToLine")) {
                const query = queryLines[i].substring(9);
                const lineToGoTo = query.substring(0, query.indexOf(" ")).trim();
                const fileToGoTo = query.substring(query.indexOf(" ")).trim();
                const data = await goToLine(fileToGoTo, Number(lineToGoTo));
                agentState.relevantFiles[data["path"]].push({
                    "content": data["content"],
                    "lineStart": data["lineStart"],
                    "lineEnd": data["lineEnd"],
                    "updatedDateTimestamp": Date.now()
                });
            } else if (queryLines[i].startsWith("querySemantic")) {
                const query = queryLines[i].substring(13);
                const data = await querySemantic(query);
                for (let i = 0; i < data.length; i++){
                    agentState.relevantFiles[data[i]["path"]].push({
                        "content": data[i]["content"],
                        "lineStart": data[i]["lineStart"],
                        "lineEnd": data[i]["lineEnd"],
                        "updatedDateTimestamp": Date.now()
                    });
                }
            }
        }
        return agentState;
    }

    async joinCommands(agentState: AgentState) {
        const previousCommands = [];
        for (let i = 0; i < agentState.terminalCommands.length; i++) {
            previousCommands.push(agentState.terminalCommands[i] + "\n" + agentState.terminalOutputs[i]);
        }
    }

    async generateTerminalCommandsForEnvironmentSetup(agentState: AgentState) {
        const prompt = ChatPromptTemplate.fromMessages([
            ["system", leadProgrammerSystemPromptTemplate],
            ["user", generateTerminalCommandsForEnvironmentSetup]
        ])
        agentState.messages.push(new HumanMessage(generateTerminalCommandsForEnvironmentSetup));
        const chain = prompt.pipe(model);
        const previousCommands = this.joinCommands(agentState);
        agentState.leadProgrammerMessages.push(await chain.invoke({
            requirementsDocument: agentState.requirementsDocument,
            userRequest: agentState.userMessages[agentState.userMessages.length - 1].content,
            projectStructure: agentState.projectStructure,
            environmentSetup: agentState.environmentSetup,
            previousCommands: previousCommands,
            fileTree: getFileTree()
        }));
        const terminalCommandLines = String(agentState.leadProgrammerMessages[agentState.leadProgrammerMessages.length - 1].content).split("\n");
        for (let i = 0; i < terminalCommandLines.length; i++) {
            if (terminalCommandLines[i].startsWith("$")) {
                const command = terminalCommandLines[i].substring(2);
                agentState.terminalCommands.push(command);
                const data = await this.sendTerminalCommand(command);
                agentState.terminalOutputs.push(data||""); 
            }
        }
        agentState.messages.push(agentState.leadProgrammerMessages[agentState.leadProgrammerMessages.length - 1])
        console.log(agentState.messages[agentState.messages.length - 1].content)
        return agentState;
    }

    async generateTerminalCommandsForFeatureImplementation(agentState: AgentState) {
        const prompt = ChatPromptTemplate.fromMessages([
            ["system", leadProgrammerSystemPromptTemplate],
            ["user", generateTerminalCommandsForFeatureImplementation]
        ])
        agentState.messages.push(new HumanMessage(generateTerminalCommandsForFeatureImplementation));
        const chain = prompt.pipe(model);
        agentState.leadProgrammerMessages.push(await chain.invoke({
            requirementsDocument: agentState.requirementsDocument,
            userRequest: agentState.userMessages[agentState.userMessages.length - 1].content,
            currentFeature: agentState.currentFeature,
            previousCommands: this.joinCommands(agentState),
            fileTree: getFileTree()
        }));
        const terminalCommandLines = String(agentState.leadProgrammerMessages[agentState.leadProgrammerMessages.length - 1].content).split("\n");
        for (let i = 0; i < terminalCommandLines.length; i++) {
            if (terminalCommandLines[i].startsWith("$")) {
                const command = terminalCommandLines[i].substring(2);
                agentState.terminalCommands.push(command);
                const data = await this.sendTerminalCommand(command);
                agentState.terminalOutputs.push(data||""); 
            }
        }
        agentState.messages.push(agentState.leadProgrammerMessages[agentState.leadProgrammerMessages.length - 1])
        console.log(agentState.messages[agentState.messages.length - 1].content)
        return agentState;
    }
    async generateQueryCommandForFeatureImplementation(agentState: AgentState) {
        const prompt = ChatPromptTemplate.fromMessages([
            ["system", leadProgrammerSystemPromptTemplate],
            ["user", generateQueryCommandForFeatureImplementation]
        ])
        agentState.messages.push(new HumanMessage(generateQueryCommandForFeatureImplementation));
        const chain = prompt.pipe(model);
        if(agentState.relevantFiles["fileNameGoesHere"]) {
            agentState.leadProgrammerMessages.push(await chain.invoke({
                requirementsDocument: agentState.requirementsDocument,
                userRequest: agentState.userMessages[agentState.userMessages.length - 1].content,
                currentFeature: agentState.currentFeature,
                fileTree: getFileTree(),
                previousCommands: this.joinCommands(agentState),
                relevantFiles: "You need to query for relevant files first."
            }));
        } else {
            agentState.leadProgrammerMessages.push(await chain.invoke({
                requirementsDocument: agentState.requirementsDocument,
                userRequest: agentState.userMessages[agentState.userMessages.length - 1].content,
                currentFeature: agentState.currentFeature,
                fileTree: getFileTree(),
                previousCommands: this.joinCommands(agentState),
                relevantFiles: "\n\n" + JSON.stringify(agentState.relevantFiles) + "\n\n"
            }));
        }
        
        agentState = await this.queryFileSystem(agentState);
        agentState.messages.push(agentState.leadProgrammerMessages[agentState.leadProgrammerMessages.length - 1])
        console.log(agentState.messages[agentState.messages.length - 1].content)
        return agentState;
    }

    async updateRelevantFilesOnReplace(agentState: AgentState, filePath: string, lineStart: number, lineEnd: number, replacement: string): Promise<AgentState>{
        const fileEntries = agentState.relevantFiles[filePath] || [];
        for (let entry of fileEntries) {
            if (entry.lineStart <= lineEnd && entry.lineEnd >= lineStart) {
                const startOffset = lineStart - entry.lineStart;
                const endOffset = entry.lineEnd - lineEnd;
                entry.content = [
                    entry.content.substring(0, startOffset),
                    replacement,
                    entry.content.substring(endOffset)
                ].join('');
                entry.lineEnd = entry.lineStart + startOffset + replacement.split('\n').length - 1;
            }
        }
        agentState.relevantFiles[filePath] = fileEntries;
        return agentState;
    }
    
    async updateRelevantFilesOnInsert(agentState: AgentState, filePath: string, lineStart: number, insertion: string) : Promise<AgentState>{
        const fileEntries = agentState.relevantFiles[filePath] || [];
        const insertLinesCount = insertion.split('\n').length;
        for (let entry of fileEntries) {
            if (entry.lineStart >= lineStart) {
                entry.lineStart += insertLinesCount;
                entry.lineEnd += insertLinesCount;
            }
            // Update entries that span the insertion point
            if (entry.lineStart < lineStart && entry.lineEnd >= lineStart) {
                entry.content = entry.content.substring(0, lineStart - entry.lineStart) + "\n" + insertion + entry.content.substring(lineStart - entry.lineStart);
                entry.lineEnd += insertLinesCount;
            }
        }
        agentState.relevantFiles[filePath] = fileEntries;
        return agentState;
    }

    async generateEditCommandForFeatureImplementation(agentState: AgentState): Promise<AgentState> {
        const prompt = ChatPromptTemplate.fromMessages([
            ["system", leadProgrammerSystemPromptTemplate],
            ["user", generateEditCommandForFeatureImplementation]
        ]);
        agentState.messages.push(new HumanMessage(generateEditCommandForFeatureImplementation));
        const chain = prompt.pipe(model);
        agentState.leadProgrammerMessages.push(await chain.invoke({
            requirementsDocument: agentState.requirementsDocument,
            userRequest: agentState.userMessages[agentState.userMessages.length - 1].content,
            currentFeature: agentState.currentFeature,
            fileTree: getFileTree(),
            previousCommands: this.joinCommands(agentState),
            relevantFiles: agentState.relevantFiles
            
        }));
    
        const editCommands = String(agentState.leadProgrammerMessages[agentState.leadProgrammerMessages.length - 1].content).split("\n");
    
        for (let command of editCommands) {
            const parts = command.split(' ');
            const action = parts.shift(); // Remove and return the action
            if (action === "replace" || action === "insert") {
                const lineStart = parseInt(parts.shift() || "-1");
                if(lineStart === -1) {
                    throw new Error("Invalid line start");
                }
                if (action === "replace") {
                    const lineEnd = parseInt(parts.shift() || "-1");
                    if(lineEnd === -1) {
                        throw new Error("Invalid line end");
                    }
                    const filePath = parts.shift() || "";
                    if (filePath === "") {
                        throw new Error("Invalid file path");
                    }
                    const code = parts.join(' '); // Join the remaining parts for the code
                    await replaceInFile(filePath, lineStart, lineEnd, code);
                    this.updateRelevantFilesOnReplace(agentState, filePath, lineStart, lineEnd, code);
                } else if (action === "insert") {
                    const filePath = parts.shift() || "";
                    if (filePath === "") {
                        throw new Error("Invalid file path");
                    }
                    const code = parts.join(' '); // Join the remaining parts for the code
                    await insertInFile(filePath, lineStart, code);
                    this.updateRelevantFilesOnInsert(agentState, filePath, lineStart, code);
                }
            }
        }
        agentState.messages.push(agentState.leadProgrammerMessages[agentState.leadProgrammerMessages.length - 1])
        console.log(agentState.messages[agentState.messages.length - 1].content)
        return agentState;
    }
    async generateSummonCommandForFeatureImplementation(agentState: AgentState) : Promise<AgentState> {
        const prompt = ChatPromptTemplate.fromMessages([
            ["system", leadProgrammerSystemPromptTemplate],
            ["user", generateSummonCommandForFeatureImplementation]
        ])
        agentState.messages.push(new HumanMessage(generateSummonCommandForFeatureImplementation));
        const chain = prompt.pipe(model);
        if(agentState.relevantFiles["fileNameGoesHere"]) {
            agentState.leadProgrammerMessages.push(await chain.invoke({
                requirementsDocument: agentState.requirementsDocument,
                userRequest: agentState.userMessages[agentState.userMessages.length - 1].content,
                currentFeature: agentState.currentFeature,
                fileTree: getFileTree(),
                relevantFiles: "You need to query for relevant files first."
            }));
        } else {
            agentState.leadProgrammerMessages.push(await chain.invoke({
                requirementsDocument: agentState.requirementsDocument,
                userRequest: agentState.userMessages[agentState.userMessages.length - 1].content,
                currentFeature: agentState.currentFeature,
                fileTree: getFileTree(),
                relevantFiles: "\n\n" + JSON.stringify(agentState.relevantFiles) + "\n\n"
            }));
        }
        agentState.messages.push(agentState.leadProgrammerMessages[agentState.leadProgrammerMessages.length - 1])
        console.log(agentState.messages[agentState.messages.length - 1].content)
        return agentState;
    }
    async generateJobActionDecision(agentState: AgentState): Promise<AgentState> {
        const prompt = ChatPromptTemplate.fromMessages([
            ["system", leadProgrammerSystemPromptTemplate],
            ["user", generateJobActionDecision]
        ])
        agentState.messages.push(new HumanMessage(generateJobActionDecision));
        const chain = prompt.pipe(model);
        agentState.leadProgrammerMessages.push(await chain.invoke({
            requirementsDocument: agentState.requirementsDocument,
            userRequest: agentState.userMessages[agentState.userMessages.length - 1].content,
            currentFeature: agentState.currentFeature,
            fileTree: getFileTree(),
            relevantFiles: "\n\n" + JSON.stringify(agentState.relevantFiles) + "\n\n"
        }));
        agentState.messages.push(agentState.leadProgrammerMessages[agentState.leadProgrammerMessages.length - 1])
        console.log(agentState.messages[agentState.messages.length - 1].content)
        return agentState;
    }
}

export { LeadProgrammer }