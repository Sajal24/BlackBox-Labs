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
        return;
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

// const subReddits = [
//     "r/programmerreactions",
//     "r/ProgrammerHumor",
//     "r/programme_irl",
//     "r/badUIbattles",
//     "r/codingmemes",
//     "r/programminghorror",
//     "r/ProgrammerDadJokes",
//     "r/programminghumor",
// ];

// const randomInt = (min: number, max: number) => {
//     return Math.floor(Math.random() * (max - min)) + min;
// };

// const getRandomPost = (posts: Array<any>) => {
//     const randomIndex = randomInt(0, posts.length);
//     return posts[randomIndex].data;
// };

// const getRandomMeme = async () => {
//     const randomIndex = randomInt(0, subReddits.length);
//     const resp = await (
//         await fetch(`https://reddit.com/${subReddits[randomIndex]}/.json`)
//     ).json();

//     if (randomIndex === 6) {
//         const { title, selftext } = getRandomPost(resp.data.children);
//         return { title: title, selftext: selftext };
//     } else {
//         const { title, url } = getRandomPost(resp.data.children);
//         return { title: title, url: url };
//     }
// };

// const cronTweetMemeHandler = async (
//     discord: Client,
//     twitter: TwitterHandler
// ) => {
//     const tweetObj = await getRandomMeme();
//     let tweetText = "";
//     if (tweetObj.url) {
//         tweetText = `${tweetObj.title}\n${tweetObj.url}`;
//     } else {
//         tweetText = `${tweetObj.title}\n${tweetObj.selftext}`;
//     }
//     const tweetMsg = await sendMsgInChannel(tweetText, tweets_id, discord);

//     tweetMsg?.react("✅");
//     tweetMsg?.react("🔁");
//     tweetMsg?.react("❌");

//     const collector = tweetMsg?.createReactionCollector({
//         filter: filterReaction,
//     });

//     collector?.on("collect", (reaction) => {
//         console.log(`Collected ${reaction.emoji.name}`);

//         if (
//             isThisRole(
//                 reaction.message as Message,
//                 reaction.users.cache.last()?.id as string,
//                 "human"
//             )
//         ) {
//             collector.stop();
//             switch (reaction.emoji.name) {
//                 case "✅":
//                     if (tweetObj.url) {
//                         twitter.postTweetWithMedia(
//                             tweetObj.title,
//                             tweetObj.url
//                         );
//                     } else {
//                         twitter.postTweet(
//                             `${tweetObj.title}\n\n${tweetObj.selftext}`
//                         );
//                     }
//                     reaction.message.reply("Tweet Published ✅");

//                     break;
//                 case "🔁":
//                     cronTweetMemeHandler(discord, twitter);
//                     break;
//                 case "❌":
//                     reaction.message.reply("Tweet Discarded ❌");
//                     break;
//             }
//         }
//     });
// };

// export { cronTweetHandler, cronTweetMemeHandler };
export { cronTweetHandler };
