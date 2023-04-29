import { Client, Message, MessageReaction, User } from "discord.js";
import { parseTweet } from "twitter-text";

const sendMsgInChannel = (msg: string, channelId: string, client: Client) => {
    const channel = client.channels.cache.get(channelId);

    if (channel?.isTextBased()) {
        return channel.send(msg);
    } else {
        return null;
    }
};

const isThisRole = (message: Message, userId: string, refRole: string) => {
    const guildMember = message.guild?.members.cache.get(userId);
    const role = message.guild?.roles.cache.find(
        (role) => role.name === refRole
    );

    if (guildMember?.roles.cache.has(role?.id as string)) {
        return true;
    } else {
        return false;
    }
};

const isTweetShift = (message: Message) => {
    return message.author.username.endsWith("TweetShift");
};

const parseTweetShiftMessage = (msg: string) => {
    const text = msg.slice(0, msg.lastIndexOf("\n")).trim();

    let link = msg.slice(msg.lastIndexOf("\n")).trim();
    link = link.slice(10, link.length - 1);

    const tweetId = link.slice(link.lastIndexOf("/") + 1);

    return [text, link, tweetId];
};

const parseTweetId = (url: string) => {
    const tweetId = url.slice(url.lastIndexOf("/") + 1);
    return tweetId;
};

const filterReaction = (reaction: MessageReaction, user: User) => {
    if (reaction.emoji.name === null) {
        return false;
    }

    return ["✅", "🔁", "❌"].includes(reaction.emoji.name);
};

const isTweetValid = (tweetText: string) => {
    return parseTweet(tweetText).valid;
};

const trimString = (str: string, char: string) => {
    const regex = new RegExp(`^[${char}]+|[${char}]+$`, "g");
    return str.replace(regex, "");
};

const removeHashtag = (str: string) => {
    return str.replace(/#\w+\s?/g, "");
};

export {
    sendMsgInChannel,
    isThisRole,
    isTweetShift,
    parseTweetShiftMessage,
    parseTweetId,
    filterReaction,
    trimString,
    removeHashtag,
    isTweetValid,
};
