import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { removeHashtag, trimString } from "./helpers";

class ChatCompletion {
    openai: OpenAIApi;
    defaultTemperature: number;
    defaultModel: string;
    defaultReplyMaxTokens: number;
    defaultMaxTokens: number;
    constructor(apiKey: string) {
        const config = new Configuration({
            apiKey: apiKey,
        });

        this.openai = new OpenAIApi(config);
        this.defaultTemperature = 0.7;
        this.defaultModel = "gpt-3.5-turbo";
        this.defaultReplyMaxTokens = 100;
        this.defaultMaxTokens = 512;
    }

    async getCompletion(
        prompt: ChatCompletionRequestMessage[],
        isReply: boolean
    ) {
        const opts = {
            model: this.defaultModel,
            messages: prompt,
            temperature: this.defaultTemperature,
            max_tokens: isReply
                ? this.defaultReplyMaxTokens
                : this.defaultMaxTokens,
        };
        try {
            console.log("Sending completion request to OpenAI API: ", opts);
            let resp = (
                await this.openai.createChatCompletion(opts)
            ).data.choices[0].message?.content.trim();

            if (isReply) {
                if (resp?.startsWith('"')) {
                    resp = resp.slice(1).trim();
                }
                if (resp?.endsWith('"')) {
                    resp = resp.slice(0, -1).trim();
                }
                if (resp?.startsWith("Reply:")) {
                    resp = resp.slice(6).trim();
                }
                if (resp?.startsWith('"')) {
                    resp = resp.slice(1).trim();
                }
                if (resp?.endsWith('"')) {
                    resp = resp.slice(0, -1).trim();
                }
            } else {
                if (resp?.startsWith("<tweet>:")) {
                    resp = resp.slice(8).trim();
                }
                resp = trimString(resp || "", "`").trim();
                if (resp.startsWith("Hook:")) {
                    resp = resp.slice(5).trim();
                }
                resp = resp
                    .split("\n")
                    .map((line) => trimString(line, " "))
                    .join("\n");

                resp = resp.replace("```", "");
                resp = removeHashtag(resp);
            }

            return resp?.trim();
        } catch (err) {
            throw new Error(
                `Unable to get completion from OpenAI API.\n${err}`
            );
        }
    }
}

export default ChatCompletion;
