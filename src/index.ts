import {
    Events,
    Message,
    Client,
    GatewayIntentBits,
    MessageReaction,
    User,
} from "discord.js";
import dotenv from "dotenv";
import { test_id, tweets_id, createMessage } from "./constants";
import { isThisRole, isTweetShift, parseTweetShiftMessage } from "./helpers";
import ChatCompletion from "./openai";
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
const openai = new ChatCompletion(process.env.OPENAI_API_KEY as string);

const filter = (reaction: MessageReaction, user: User) => {
    if (reaction.emoji.name === null) {
        return false;
    }

    return ["✅", "🔁", "❌"].includes(reaction.emoji.name);
};

const onReady = () => {
    console.log("Connected");

    if (client.user) {
        console.log(`Logged in as ${client.user.tag}.`);
    }
};

const reactToTweet = async (
    msg: Message,
    text: string,
    link: string,
    reiter: boolean = false
) => {
    const resp = (await openai.getCompletion(createMessage(text))) || "";
    const reply = await msg.reply(resp);

    const collector = reply.createReactionCollector({
        filter,
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
                    // TODO: Publish to twitter
                    reaction.message.channel.send("Tweet Published ✅");
                    break;
                case "🔁":
                    // TODO: Requery the tweet from chatGPT
                    reactToTweet(reply, text, link, true);
                    break;
                case "❌":
                    //TODO: Do not publish to twitter
                    reaction.message.channel.send("Tweet Discarded ❌");
                    break;
            }
        }
    });
};

// what do when we get a message
const onMessage = async (message: Message) => {
    console.log(`Received message: ${message.content}`);
    console.log(isThisRole(message, message.author.id, "human"));
    console.log(isTweetShift(message));

    if (
        message.channelId === tweets_id &&
        (isThisRole(message, message.author.id, "human") ||
            isTweetShift(message))
    ) {
        const [text, link] = parseTweetShiftMessage(message.content);

        if (text && link) {
            reactToTweet(message, text, link);
        }
    }
};

client.on(Events.ClientReady, onReady);
client.on(Events.MessageCreate, onMessage);

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
// (async () => {
//     const resp = await openai.getCompletion(
//         createMessage("Frontend is harder than backend???")
//     );
//     console.log(resp);
// })();
