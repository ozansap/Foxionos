import { Commands, gifts } from "../modules/vars";
import { embed, displayNumber, commandHelp } from "../modules/utils";
import { Command } from "../modules/types";
import { Message} from "discord.js";

async function execute(message: Message, args: string[], prefix: string): Promise<any> {
	if (args[0] === undefined) {
		let description =
			`Contact **Swagnemite#9374** if you're having problems\n` + 
			`Commands are seperated into modules\n` +
			`Type \`${prefix}help [module]\` to see the commands in that module\n` +
			`Type \`${prefix}help [command]\` to see more information about that command\n\n`;

		for (const module in Commands.modules) {
			description += `**${module}:**\n`;
			
			for (const command of Commands.modules[module]) {
				description += `\`${command.name}\`, `;
			}

			description = description.slice(0, -2) + "\n\n";
		}

		return message.channel.send({
			embeds: [embed({
				title: "Modules",
				description
			})]
		});
	} else {
		if (args[0].toLowerCase() == "admin") {
			return message.channel.send({
				embeds: [embed({ error: "I couldn't find a module or a command with that name" })]
			});
		}

		const moduleIndex = Object.keys(Commands.modules).map(x => x.toLowerCase()).indexOf(args[0].toLowerCase());
		const moduleName = Object.keys(Commands.modules)[moduleIndex];

		if (moduleIndex !== -1) {
			let description = `Type \`${prefix}help [command]\` to see more information about that command\n\n`;

			for (const command of Commands.modules[moduleName]) {
				description += `${prefix}**${command.name}** • ${command.description.split("\n")[0]}\n`;
			}
			
			return message.channel.send({
				embeds: [embed({
					title: `Module • ${moduleName}`,
					description
				})]
			});
		}

		const command =
			Commands.list.find(cmd => cmd.name == args[0].toLowerCase()) ||
			Commands.list.find(cmd => cmd.aliases.includes(args[0].toLowerCase()));
		
		if (command) {
			if (command.module == "Admin") {
				return message.channel.send({
					embeds: [embed({ error: "I couldn't find a module or a command with that name" })]
				});
			}

			return message.channel.send({
				embeds: [commandHelp(command, prefix)]
			});
		}

		return message.channel.send({
			embeds: [embed({ error: "I couldn't find a module or a command with that name" })]
		});
	}
}

module.exports = {
	name: "help",
	aliases: ["h"],
	usage: "[module or command (optional)]",
	description: "See a list of all commands or learn more about a command",
	module: "Misc",
	access: 0,
	premium: false,
	guildOnly: false,
	execute
} as Command;