import { ChatCompletionRequestMessage } from "openai";

const test_id = "1096031365260132382";
const tweets_id = "1095433175938895953";
/*
v1 
Context: The following tweet is a tweet from a person on twitter in the Tech Space. Generate a genuine, constructive, helpful, appreciating, value-adding reply to this tweet. The reply should be short and crisp. The reply can also include questions, appreciating message, doubt or general message. Assume, that the tweet is written by a person well versed with the field in question.
Tweet: `Frontend is harder than backend???`
Note: The reply should be human like, with random errors in writing, use of appropriate emojis. Consider the format of content, replies on twitter as they are short and crisp.
Warning: Never mention yourself as an AI Language Model, write the response considering yourself a human.
*/

/*
Your task is to provide a reply to the tech twitter tweets that should be meaningful, appreciating and concise. Your main motive is to add value to the tweet.

Do NOT use mainstream examples like Grammarly, Figma, Hugging Face, ChatGPT, OpenAI, Notion and Google. Try and provide one example adding to the tweet.
Never criticize or put in argumentative statements.

Use at most 150 characters.
Sound like a human, with a friendly tone.

The tweet will be provided delimited with three backticks.

<tweet>:
```
The future is faster than you think.

ChatGPT & AutoGPT are just a small part of this future.

Here're 10 AI tools that will save you hours of work (instant bookmark):
```
*/
const reply_prompt = {
    systemPrompt: {
        role: "system",
        content: `Your task is to provide a reply to the tech twitter tweets that should be meaningful, appreciating and concise. Your main motive is to add value to the tweet.

            Do NOT use mainstream examples like Grammarly, Canva, Figma, Hugging Face, ChatGPT, OpenAI, Notion and Google. Try and provide one example adding to the tweet.
            Never criticize or put in argumentative statements.
            
            Use at most 150 characters.
            Sound like a human, with a friendly tone.
            
            The tweet will be provided delimited with three backticks.`,
    },
    userPrompt: {
        role: "user",
        content: "<tweet>:",
    },
};

const createReplyPromptObj = (tweet: string) => {
    return [
        reply_prompt.systemPrompt,
        {
            role: reply_prompt.userPrompt.role,
            content: `${reply_prompt.userPrompt.content}\n\`\`\`\n${tweet}\n\`\`\`\n`,
        },
    ] as ChatCompletionRequestMessage[];
};

/*
Your task is to help a tech Twitter account create a tweet for its tech Twitter audience.
Provide the answer in a consistent style like the example delimited by double backticks.

<tweet>:
``
Hook: ChatGPT is Incredible.
But don't skip these AI tools.

⚡ AI image generator
http://imgcreator.ai

⚡ AI Resume builder
http://kickresume.com

⚡ AI meeting summarizer
http://tldv.io

⚡ AI website builder
http://10web.io
``

<tweet>:
``
Hook: Save hours of your time with these AI tools: 🚀

⚡ Writing
http://copy.ai

⚡ Image:
http://stockimg.ai

⚡ Marketing
http://frase.io

⚡ Recording
http://otter.ai

⚡ Twitter
http://tweethunter.io

⚡ Presentation
http://beautiful.ai
``

Write the tweet based on the hook provided in the hook delimited by triple backticks.

ADD the hook at the start of generating the list. Improvise it a little.

Use at most 260 characters.
Do not use hashtags.

Hook: ```5 AI Tools that you cannot miss!```
*/

const tweet_prompt = {
    systemPrompt: {
        role: "system",
        content: `Your task is to help a tech Twitter account create a tweet for its tech Twitter audience.
        Provide the answer in a consistent style like the example delimited by double backticks.
        
        Use at most 230 characters.
        Do not use hashtags.
        `,
    },
    userPrompt: {
        role: "user",
        content: `<tweet>:
        \`\`
        Hook: ChatGPT is Incredible.
        But don't skip these AI tools.
        
        ⚡ AI image generator
        http://imgcreator.ai
        
        ⚡ AI Resume builder
        http://kickresume.com
        
        ⚡ AI meeting summarizer
        http://tldv.io
        
        ⚡ AI website builder
        http://10web.io
        \`\`
        
        <tweet>:
        \`\`
        Hook: Save hours of your time with these AI tools: 🚀
        
        ⚡ Writing
        http://copy.ai
        
        ⚡ Image:
        http://stockimg.ai
        
        ⚡ Marketing
        http://frase.io
        
        ⚡ Recording
        http://otter.ai
        
        ⚡ Twitter
        http://tweethunter.io
        
        ⚡ Presentation
        http://beautiful.ai
        \`\`
        
        Write the tweet based on the hook provided in the hook delimited by triple backticks.
        
        ADD the hook at the start of generating the list. Improvise it a little.
        
        Hook:`,
    },
};

const createTweetPromptObj = (hook: string) => {
    return [
        tweet_prompt.systemPrompt,
        {
            role: tweet_prompt.userPrompt.role,
            content: `${tweet_prompt.userPrompt.content} \`\`\`${hook}\`\`\``,
        },
    ] as ChatCompletionRequestMessage[];
};

export { test_id, tweets_id, createReplyPromptObj, createTweetPromptObj };
