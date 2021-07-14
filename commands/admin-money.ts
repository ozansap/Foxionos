import { UserHandler } from "../modules/db";
import { CURRENCY } from "../config";
import { embed, displayNumber, findUserID } from "../modules/utils";
import { Command } from "../modules/types";
import { GuildMember, Message, Snowflake } from "discord.js";

async function execute(message: Message, args: string[], prefix: string) {
	if (!message.guild) return;

	const targetUserID: Snowflake | null = findUserID(args[1] ?? "", true);
	
	if (targetUserID === null) {
		return message.channel.send({
			embeds: [embed({ error: "You need to mention someone" })]
		});
	}

	const targetMember: GuildMember | undefined | void = await message.guild.members.fetch(targetUserID).catch((err) => { return });

	if (!targetMember) {
		return message.channel.send({
			embeds: [embed({ error: "You need to mention someone" })]
		});
	}

	const targetHandler = new UserHandler(targetUserID, targetMember.user);
	const amount: number = parseInt(args[2]);

	if (isNaN(amount)) {
		return message.channel.send({
			embeds: [embed({ error: "You need to enter a valid amount" })]
		});
	}

	switch (args[0]) {
		case "set":
			await targetHandler.currency_set(amount).update();
			break;
		case "add":
			await targetHandler.currency_add(amount).update();
			break;			
		case "sub":
			await targetHandler.currency_sub(amount).update();
			break;
		default:
			return message.channel.send({
				embeds: [embed({ error: "You need to enter a valid action" })]
			});
	}

	return message.channel.send({
		embeds: [embed({
			// @ts-ignore
			success: `**${targetMember.displayName}** now has **${displayNumber(targetHandler.data.currency, CURRENCY)}**`
		})]
	});
}

module.exports = {
	name: "admin-money",
	aliases: ["a-money"],
	usage: "set/add/sub [@user] [amount]",
	description: "Edit a user's currency",
	module: "Admin",
	access: 2,
	premium: false,
	guildOnly: true,
	execute
} as Command;