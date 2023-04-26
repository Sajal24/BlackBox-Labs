import { Client, Message } from "discord.js";

const sendMsgInChannel = (msg: string, channelId: string, client: Client) => {
    const channel = client.channels.cache.get(channelId);

    if (channel?.isTextBased()) {
        channel.send(msg);
        return true;
    } else {
        return false;
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

    return [text, link];
};

const parseTweetId = (url: string) => {
    const tweetId = url.slice(url.lastIndexOf("/") + 1);
    return tweetId;
};

export {
    sendMsgInChannel,
    isThisRole,
    isTweetShift,
    parseTweetShiftMessage,
    parseTweetId,
};
