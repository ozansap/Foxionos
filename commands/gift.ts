import { UserHandler } from "../modules/db";
import { gifts } from "../modules/vars";
import { CURRENCY } from "../config";
import { embed, displayNumber, findUserID } from "../modules/utils";
import { Command } from "../modules/types";
import { GuildMember, Message, Snowflake, User } from "discord.js";

async function execute(message: Message, args: string[], prefix: string): Promise<any> {
	if (!message.guild) return;

	const targetUserID: Snowflake | null = findUserID(args[0] ?? "");
	
	if (targetUserID === null) {
		return message.channel.send({
			embeds: [embed({ error: "You need to mention someone" })]
		});
	}

	if (targetUserID === message.author.id) {
		return message.channel.send({
			embeds: [embed({ error: "You can't be *that* narcissistic..." })]
		});
	}

	const targetUser: User | undefined = message.client.users.cache.get(targetUserID);

	if (targetUser === undefined) {
		return message.channel.send({
			embeds: [embed({ error: "You need to mention someone" })]
		});
	}

	const targetMember: GuildMember | null = message.guild.members.resolve(targetUser);

	if (targetMember === null) {
		return message.channel.send({
			embeds: [embed({ error: "You need to mention someone from this server" })]
		});
	}

	const inputName = args.slice(1).join(" ");
	const giftIndex = Object.keys(gifts).map(x => x.toLowerCase()).indexOf(inputName.toLowerCase());
	const giftName = Object.keys(gifts)[giftIndex];

	if (giftIndex == -1) {
		return message.channel.send({
			embeds: [embed({ error: "I couldn't find that gift" })]
		});
	}

	const cost = gifts[giftName as keyof typeof gifts].cost;

	const userHandler = new UserHandler(message.author.id, message.author);
	const userData = await userHandler.fetch();

	if (!userData.currency || userData.currency < cost) {
		return message.channel.send({
			embeds: [embed({ error: "You are too poor to buy that gift" })]
		});
	}

	const targetHandler = new UserHandler(targetUserID, targetUser);
	const targetData = await targetHandler.fetch();

	const value = (targetData.affection && targetData.affection.id == message.author.id) ? cost : Math.floor(cost / 2);

	userHandler
		.currency_sub(cost)
		.update()
	
	targetHandler
		.value_add(value)
		.gifts_add(giftName)
		.update()

	// @ts-ignore
	if (targetUserID === message.client.user.id) {
		return message.channel.send({
			embeds: [embed({ success: "Thank you for that gift!" })]
		});
	} else {
		return message.channel.send({
			embeds: [embed({
				success: `**${targetMember.displayName}** received **${giftName}** from you\n• Their value increased by **${displayNumber(value)}**`
			})]
		});
	}
}

module.exports = {
	name: "gift",
	aliases: [],
	usage: "[@user] [gift]",
	description: 
		"Gift another user something, increasing their value.\n" +
		"Gifts worth more when gifted to someone affectionate towards you",
	module: "Waifus",
	access: 0,
	premium: false,
	guildOnly: true,
	execute
} as Command;