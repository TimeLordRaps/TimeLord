import { ChatAnthropic } from "@langchain/anthropic";

const model = new ChatAnthropic({
    temperature: 0
});

export { model };