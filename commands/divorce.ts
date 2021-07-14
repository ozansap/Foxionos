import { UserHandler } from "../modules/db";
import { embed } from "../modules/utils";
import { Command } from "../modules/types";
import { Message, Snowflake } from "discord.js";

async function execute(message: Message, args: string[], prefix: string): Promise<any> {
	const targetTag = args[0];

	if (args[0] === undefined) {
		return message.channel.send({
			embeds: [embed({
				error:
					`You need to type your waifu's **username** or **username#tag** __as seen in your profile__\n` +
					// @ts-ignore
					`Example: \`${prefix}divorce ${message.client.user.tag}\``
			})]
		});
	}

	const userHandler = new UserHandler(message.author.id, message.author);
	const waifus = await userHandler.find_waifus();
	const filteredWaifus = waifus.filter(w => w.tag && w.tag.toLowerCase().includes(targetTag.toLowerCase()));
	
	if (filteredWaifus.length === 0) {
		return message.channel.send({
			embeds: [embed({ error: "I couldn't find a waifu with that name" })]
		});
	} else if (1 < filteredWaifus.length) {
		let errorMessage = "There are multiple waifus matching that name:\n";

		for (const waifu of filteredWaifus) {
			errorMessage += `\`${waifu.tag}\`, `;
		}

		return message.channel.send({
			embeds: [embed({ error: errorMessage.slice(0, -2) })]
		});
	}

	const waifu = filteredWaifus[0];

	const targetHandler = new UserHandler(waifu._id as Snowflake);

	targetHandler
		.owner_unset()
		.update();

	message.channel.send({
		embeds: [embed({
			success: `You divorced **${waifu.tag ?? targetTag}**\nThey'll have to sleep on the streets tonight\nYou're the worst of the worst`
		})]
	});
}

module.exports = {
	name: "divorce",
	aliases: ["youdeservebetterthanme"],
	usage: "[username#tag]",
	description: 
		"Divorce one of your waifus\n" +
		"The fact that you're even thinking about this is terrifying\n" +
		"You should be ashamed of yourself",
	module: "Waifus",
	access: 0,
	premium: false,
	guildOnly: false,
	execute
} as Command;