import { Client, Message } from "discord.js";
import { createTweetPromptObj, tweets_id } from "./constants";
import {
    filterReaction,
    isThisRole,
    isTweetValid,
    sendMsgInChannel,
} from "./helpers";
import ChatCompletion from "./openai";
import TwitterHandler from "./twitterAuth";

const cronTweetHandler = async (
    tweetHook: string,
    openai: ChatCompletion,
    discord: Client,
    twitter: TwitterHandler
) => {
    const tweetText =
        (await openai.getCompletion(createTweetPromptObj(tweetHook), false)) ||
        "";
    const tweetMsg = await sendMsgInChannel(tweetText, tweets_id, discord);

    if (!isTweetValid(tweetText)) {
        tweetMsg?.edit("Tweet is not valid ❌. Regenerating New Tweet...");
        cronTweetHandler(tweetHook, openai, discord, twitter);
    }

    tweetMsg?.react("✅");
    tweetMsg?.react("🔁");
    tweetMsg?.react("❌");

    const collector = tweetMsg?.createReactionCollector({
        filter: filterReaction,
    });

    collector?.on("collect", (reaction) => {
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
                    twitter.postTweet(tweetText as string);
                    reaction.message.reply("Tweet Published ✅");
                    break;
                case "🔁":
                    cronTweetHandler(tweetHook, openai, discord, twitter);
                    break;
                case "❌":
                    reaction.message.reply("Tweet Discarded ❌");
                    break;
            }
        }
    });
};

export { cronTweetHandler };
