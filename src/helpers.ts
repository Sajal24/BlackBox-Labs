import { Message } from "discord.js";

const isAdmin = (message: Message, userId: string) => {
    const guildMember = message.guild?.members.cache.get(userId);
    const role = message.guild?.roles.cache.find(
        (role) => role.name === "admin"
    );

    if (guildMember?.roles.cache.has(role?.id as string)) {
        return true;
    } else {
        return false;
    }
};

export { isAdmin };
