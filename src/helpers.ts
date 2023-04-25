import { Message } from "discord.js";

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

export { isThisRole,isTweetShift, parseTweetShiftMessage };
