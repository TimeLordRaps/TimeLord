import { BaseChatModel } from "@langchain/core/language_models/chat_models";

class Agent {
    name: string;
    prompt: string;
    model: BaseChatModel;

    constructor(name: string, prompt: string, model: BaseChatModel) {
        this.name = name;
        this.prompt = prompt;
        this.model = model;
    }
}

export { Agent };