import {
    Events,
    Message,
    Client,
    TextChannel,
    GatewayIntentBits,
    MessageReaction,
    User,
} from "discord.js";
import dotenv from "dotenv";
import { test_id } from "./constants";
import { isAdmin } from "./helpers";
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
const filter = (reaction: MessageReaction, user: User) => {
    if (reaction.emoji.name === null) {
        return false;
    }

    return ["✅", "🔁", "❌"].includes(reaction.emoji.name);
};

const onReady = () => {
    (client.channels.cache.get(test_id) as TextChannel)?.send("Hello, world!");
    console.log("Connected");

    if (client.user) {
        console.log(`Logged in as ${client.user.tag}.`);
    }
};

const reactToTweet = async (msg: Message, reiter: boolean = false) => {
    const reply = await msg.reply("Pong!");

    const collector = reply.createReactionCollector({
        filter,
    });

    reply.react("✅");
    reply.react("🔁");
    reply.react("❌");

    collector.on("collect", (r) => {
        console.log(`Collected ${r.emoji.name}`);

        if (isAdmin(r.message as Message, r.users.cache.last()?.id as string)) {
            collector.stop();
            switch (r.emoji.name) {
                case "✅":
                    // TODO: Publish to twitter
                    r.message.channel.send("Tweet Published ✅");
                    break;
                case "🔁":
                    // TODO: Requery the tweet from chatGPT
                    reactToTweet(reply, true);
                    break;
                case "❌":
                    //TODO: Do not publish to twitter
                    r.message.channel.send("Tweet Discarded ❌");
                    break;
            }
        }
    });
};

// what do when we get a message
const onMessage = (message: Message) => {
    console.log(`Received message: ${message.content}`);
    if (message.author.bot) {
        // TODO: Respond acc.
        return;
    }

    if (message.content.toLowerCase() === "ping") {
        reactToTweet(message);
    }
};

client.on(Events.ClientReady, onReady);
client.on(Events.MessageCreate, onMessage);

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
