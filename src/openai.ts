import {
    ChatCompletionRequestMessage,
    Configuration,
    CreateChatCompletionRequest,
    OpenAIApi,
} from "openai";

class ChatCompletion {
    openai: OpenAIApi;
    defaultTemperature: number;
    defaultModel: string;
    constructor(apiKey: string) {
        const config = new Configuration({
            apiKey: apiKey,
        });

        this.openai = new OpenAIApi(config);
        this.defaultTemperature = 0.5;
        this.defaultModel = "gpt-3.5-turbo";
    }

    async getCompletion(
        prompt: ChatCompletionRequestMessage[],
        options: CreateChatCompletionRequest = {
            model: this.defaultModel,
            messages: prompt,
            temperature: this.defaultTemperature,
        }
    ) {
        try {
            const response = await this.openai.createChatCompletion({
                ...options,
                model: this.defaultModel,
                messages: prompt,
                temperature: this.defaultTemperature,
            });

            return response.data.choices[0].message;
        } catch {
            throw new Error("Error while getting completion from OpenAI API.");
        }
    }
}

export default ChatCompletion;
