import { Client, Events, GatewayIntentBits, Message } from "discord.js";
import dotenv from "dotenv";
import cron from "node-cron";
import { createReplyPromptObj } from "./constants";
import { cronTweetHandler } from "./cronFuncs";
import {
    filterReaction,
    isThisRole,
    isTweetShift,
    parseTweetId,
    parseTweetShiftMessage,
} from "./helpers";
import ChatCompletion from "./openai";
import { generatePromptTech, generatePromptTools } from "./prompt";
import TwitterHandler from "./twitterAuth";
dotenv.config();

// Discord token is required.
if (!process.env.DISCORD_TOKEN) {
    throw new Error("DISCORD_TOKEN environment variable missing.");
}

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
    ],
});
const openai = new ChatCompletion(process.env.OPENAI_API_KEY as string); // openai api handler init
const twitter = new TwitterHandler(client); // twitter api handler init

// cron functions inits here
cron.schedule("0 10,17 * * *", async () => {
    await cronTweetHandler(generatePromptTech(), openai, client, twitter);
});

cron.schedule("0 14,21 * * *", () => {
    cronTweetHandler(generatePromptTools(), openai, client, twitter);
});

// what do when we login to the discord server
const onReady = () => {
    console.log("Connected");

    if (client.user) {
        console.log(`Logged in as ${client.user.tag}.`);
    }

    twitter.init();
};

// what do when we get a message from tweetshift bot
const reactToTweet = async (msg: Message, text: string, link: string) => {
    const resp =
        (await openai.getCompletion(createReplyPromptObj(text), true)) || "";
    console.log("Prompt Answer: ", resp);

    const reply = await msg.reply(resp);
    const collector = reply.createReactionCollector({
        filter: filterReaction,
    });

    reply.react("✅");
    reply.react("🔁");
    reply.react("❌");

    collector.on("collect", (reaction) => {
        console.log(`Collected ${reaction.emoji.name}`);

        if (
            isThisRole(
                reaction.message as Message,
                reaction.users.cache.last()?.id as string,
                "human"
            )
        ) {
            collector.stop();
            switch (reaction.emoji.name) {
                case "✅":
                    twitter.replyToTweet(parseTweetId(link), resp as string);
                    reaction.message.reply("Tweet Published ✅");
                    break;
                case "🔁":
                    reactToTweet(reply, text, link);
                    break;
                case "❌":
                    reaction.message.reply("Tweet Discarded ❌");
                    break;
            }
        }
    });
};

// what do when we get a message (general message handler)
const onMessage = async (message: Message) => {
    console.log(`Received message: ${message.content}`);
    console.log(isThisRole(message, message.author.id, "human"));
    console.log(isTweetShift(message));

    if (
        isThisRole(message, message.author.id, "human") ||
        isTweetShift(message)
    ) {
        const [tweetText, link] = parseTweetShiftMessage(message.content);

        // if (await twitter.isThread(tweetId as string)) {
        //     tweetText = (await twitter.fetchThread(tweetId as string)).join(
        //         "\n"
        //     );
        // } else {
        //     tweetText = await twitter.fetchTweet(tweetId as string);
        // }

        if (tweetText && link) {
            reactToTweet(message, tweetText, link);
        }
    }
};

// register event handlers
client.on(Events.ClientReady, onReady);
client.on(Events.MessageCreate, onMessage);

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);

// test fn 👇🏻
// (async () => {})();
