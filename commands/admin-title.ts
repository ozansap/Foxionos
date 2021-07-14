import { UserHandler } from "../modules/db";
import { embed, findUserID } from "../modules/utils";
import { Command } from "../modules/types";
import { GuildMember, Message, Snowflake } from "discord.js";

async function execute(message: Message, args: string[], prefix: string) {
	if (!message.guild) return;
	
	const targetUserID: Snowflake | null = findUserID(args[0] ?? "", true);
	
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
	const title = args.slice(1).join(" ");

	if (!title) {
		targetHandler
			.title_unset()
			.update();

		message.channel.send({
			embeds: [embed({
				success: `Title taken from **${targetMember.displayName}**`
			})]
		});
	} else {
		targetHandler
			.title_set(title)
			.update();

		message.channel.send({
			embeds: [embed({
				success: `Title given to **${targetMember.displayName}**`
			})]
		});
	}
}

module.exports = {
	name: "admin-title",
	aliases: ["a-title"],
	usage: "[@user or id] [title (optional)]",
	description: "Set a user's title",
	module: "Admin",
	access: 2,
	premium: false,
	guildOnly: true,
	execute
} as Command;