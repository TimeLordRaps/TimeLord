import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";

import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { metadata } from "../../components/layout";

interface Directory {
    path: string;
    files: string[];
    folders: Directory[];
}

export interface SearchResult {
    path: string;
    content: string;
    lineStart: number;
    lineEnd: number;
}

async function getDirectoryListing(): Promise<Directory> {  
    const data = await getFileTree();
    const lsLines = data.split('\n');
  
    const workspaceDirectory: Directory = {
        path: "/",
        files: [],
        folders: [],
    };
  
    function processDirectory(lines: string[], startIndex: number, currentDirectory: Directory): number {
        let i = startIndex;
        while (i < lines.length) {
            const line = lines[i];
    
            if (line.endsWith(":")) {
            const newDirectory: Directory = {
                path: line.slice(0, line.length - 1),
                files: [],
                folders: [],
            };
            currentDirectory.folders.push(newDirectory);
            i = processDirectory(lines, i + 1, newDirectory);
            } else if (line === "") {
            return i + 1;
            } else if (typeof line === "string") {
            currentDirectory.files.push(line);
            i++;
            } else {
            i++;
            }
        }
        return i;
    }
  
    processDirectory(lsLines, 0, workspaceDirectory);
  
    return workspaceDirectory;
}

async function fetchFileContent(path: string): Promise<string> {
    const catResponse = await fetch('/api/terminal', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: "cat " + path,
    });
    if (!catResponse.ok) throw new Error('Failed to get file content');
    return await catResponse.text();
}

async function consolidateResults(results: SearchResult[]): Promise<SearchResult[]> {
    // Consolidate overlapping results for the same path
    if (results.length === 0) {
      return [];
    }
  
    const resultMap = new Map<string, SearchResult[]>();
  
    // Group the results by path
    for (const result of results) {
        if (!resultMap.has(result.path)) {
            resultMap.set(result.path, []);
        }
        resultMap.get(result.path)!.push(result);
    }
  
    const consolidatedResults: SearchResult[] = [];
  
    // Consolidate the results for each path
    for (const [path, pathResults] of resultMap) {
        // Sort the results for the current path by lineStart
        pathResults.sort((a, b) => a.lineStart - b.lineStart);
    
        const stack: SearchResult[] = [];
    
        for (const result of pathResults) {
            if (stack.length === 0) {
            stack.push(result);
            } else {
            const top = stack[stack.length - 1];
            if (top.lineEnd < result.lineStart) {
                stack.push(result);
            } else {
                const topLines = top.content.split('\n');
                const resultLines = result.content.split('\n');
    
                if (top.lineStart <= result.lineStart && top.lineEnd >= result.lineEnd) {
                // Case 1: result is completely nested within top
                // Do nothing, as the top already covers the result
                } else if (result.lineStart <= top.lineStart && result.lineEnd >= top.lineEnd) {
                // Case 2: top is completely nested within result
                stack.pop();
                stack.push(result);
                } else if (top.lineStart < result.lineStart && top.lineEnd >= result.lineStart && top.lineEnd <= result.lineEnd) {
                // Case 3: top overlaps with the start of result
                top.content = topLines.join('\n') + '\n' + resultLines.slice(top.lineEnd - result.lineStart).join('\n');
                top.lineEnd = result.lineEnd;
                } else if (result.lineStart < top.lineStart && result.lineEnd >= top.lineStart && result.lineEnd <= top.lineEnd) {
                // Case 4: result overlaps with the start of top
                top.content = resultLines.join('\n') + '\n' + topLines.slice(result.lineEnd - top.lineStart).join('\n');
                top.lineStart = result.lineStart;
                }
            }
            }
        }
  
        consolidatedResults.push(...stack);
    }
  
    return consolidatedResults;
}

async function getContext(path: string, content:string, line: number, contextWidth: number): Promise<SearchResult> {
    // get the context of the line in the file
    const lines = content.split('\n');
    let start = Math.max(0, line - contextWidth);
    let end = Math.min(lines.length, line + contextWidth + 1);
    if (start === 0) {
        end = Math.min(lines.length, start + 2 * contextWidth + 1);
    } else if (end === lines.length) {
        start = Math.max(0, end - 2 * contextWidth - 1);
    } else if (start === 0 && end === lines.length) {
        start = 0;
        end = lines.length;
    }
    return { path: path, content: lines.slice(start, end).join('\n'), lineStart: start + 1, lineEnd: end } as SearchResult;

}

//findInFiles
async function getLines(path: string, content: string, query: string): Promise<SearchResult[]> {
    // get the lines where the query is found in the file
    const lines = content.split('\n');
    const results = [];
    for (let j = 0; j < lines.length; j++) {
        if (lines[j].includes(query)) {
            results.push(await getContext(path, content, j, 4));
        }
    }
    return consolidateResults(results);
    
}

async function recursiveSearch(directory: Directory, query: string): Promise<SearchResult[]> {
    // search for the query in each file in the directory and its subdirectories
    let results = [] as SearchResult[];
    for (let i = 0; i < directory.files.length; i++) {
        const file = directory.files[i];
        const content = await fetchFileContent(directory.path + "/" + file);
        if (content.includes(query)) {
            results.concat(await getLines(directory.path + "/" + file, content, query));
        }
    }
    for (let i = 0; i < directory.folders.length; i++) {
        results = results.concat(await recursiveSearch(directory.folders[i], query));
    }
    return results;
}

async function findInFiles(query: string): Promise<SearchResult[]> {
    // returns 4 lines before and 4 lines after where the query is found in each file consolidated for overlapping results
    // get all the files in the workspace by calling the terminal api
    // search for the query in each file
    // return the results
    const directory = await getDirectoryListing();
    return await recursiveSearch(directory, query);
}


//goToLine
async function goToLine(path: string, line: number): Promise<SearchResult> {
    // return 8 lines before and 8 lines after the line number in the file
    const content = await fetchFileContent(path);
    return await getContext(path, content, line, 8);
}


//querySemantic
async function generateChunks(content: string, chunkSizes: number[]): Promise<SearchResult[]> {
    const chunks: SearchResult[] = [];

    for (const chunkSize of chunkSizes) {
        for (let i = 0; i < chunkSize; i += chunkSize / 4) {
            const start = Math.floor(i);
            const end = Math.min(start + chunkSize, content.split('\n').length);
            const chunkContent = content.split('\n').slice(start, end).join('\n');
            chunks.push({
                path: '',
                content: chunkContent,
                lineStart: start + 1,
                lineEnd: end,
            });
        }
    }

    return chunks;
}

async function generateVectorDatabase(directory: Directory): Promise<FaissStore> {
    const model = new HuggingFaceTransformersEmbeddings({
        model: "snowflake/snowflake-arctic-embed-l"
    });
    const chunks: SearchResult[] = [];

    async function processDirectory(dir: Directory) {
        for (const file of dir.files) {
            const content = await fetchFileContent(dir.path + "/" + file);
            const fileChunks = await generateChunks(content, [8, 16, 24, 32]);
            for (const chunk of fileChunks) {
                chunk.path = dir.path + "/" + file;
                chunks.push(chunk);
            }
        }

        for (const subdir of dir.folders) {
            await processDirectory(subdir);
        }
    }

    await processDirectory(directory);
    const store = await FaissStore.fromTexts(chunks.map(chunk => chunk.content), chunks.map(chunk => ({ path: chunk.path, lineStart: chunk.lineStart, lineEnd: chunk.lineEnd })), model);

    return store;
}

async function querySemantic(query: string): Promise<SearchResult[]> {
    // This function creates a vector database of the files in the workspace
    // It then queries the database with the query and returns the results
    const directory = await getDirectoryListing();
    let results = [] as SearchResult[];
    const vectorDatabase = await generateVectorDatabase(directory);
    const similarChunks = await vectorDatabase.similaritySearch(query, 5);
    // sort the similarity scores and return the top 5 then consolidate the results
    for (const chunk of similarChunks) {
        results.push({
            path: chunk.metadata.path,
            content: chunk.pageContent,
            lineStart: chunk.metadata.lineStart,
            lineEnd: chunk.metadata.lineEnd,
        } as SearchResult);
    }
    return consolidateResults(results);
}

//replaceInFile
async function replaceInFile(path: string, lineStart: number, lineEnd: number, replacement: string): Promise<void> {
    // check files existence if it doesnt exist create it
    const lsResponse = await fetch('/api/terminal', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: `ls ${path}`,
    });

    // replace the lines from lineStart to lineEnd with the replacement text
    const escapedReplacement = replacement.replace(/\\/g, '\\\\')
    const command = `sed -i '${lineStart},${lineEnd}c\\\\${escapedReplacement}' ${path}`
    const escapedCommand = command.replace(/'/g, "'\\''");
    const catResponse = await fetch('/api/terminal', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: escapedCommand,
    });
    if (!catResponse.ok) throw new Error('Failed to replace in file');
}

//insertInFile
async function insertInFile(path: string, line: number, insertion: string): Promise<void> {
    // check files existence if it doesnt exist create it
    const lsResponse = await fetch('/api/terminal', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: `ls ${path}`,
    });
    if (!lsResponse.ok) throw new Error('Failed to check file existence');
    const lsData = await lsResponse.text();
    if (!lsData.includes(path)) {
        const touchResponse = await fetch('/api/terminal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: `touch ${path}`,
        });
        if (!touchResponse.ok) throw new Error('Failed to create file');
    }

    // insert the insertion text after the line number in the file
    const escapedReplacement = insertion.replace(/\\/g, '\\\\')
    const command = `sed -i '${line}a\\\\${escapedReplacement}' ${path}`
    const escapedCommand = command.replace(/'/g, "'\\''");
    const catResponse = await fetch('/api/terminal', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: escapedCommand,
    });
    if (!catResponse.ok) throw new Error('Failed to insert in file');
}

async function getFileTree(): Promise<String> {
    const lsResponse = await fetch('/api/terminal', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: "ls -R",
    });
  
    if (!lsResponse.ok) throw new Error('Failed to get directory listing');
  
    const data = await lsResponse.text();
    return data;
}

export { consolidateResults, findInFiles, goToLine, querySemantic, replaceInFile, insertInFile, getFileTree }