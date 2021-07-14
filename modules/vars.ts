import { Command } from "./types";

export const commandCooldownDuration = 3 * 1000;
export const currencyCooldownDuration = 3 * 60 * 1000;

export const defaultValue = {
	currency: 0,
	value: 100,
}

export class Commands {
	static list: Command[] = [];

	static modules: any = {
		Waifus: [],
		Economy: [],
		Misc: [],
	}

	static init(commands: Command[]): void {
		Commands.list = commands;

		for (const command of commands) {
			if (command.module == "Admin") continue;
			Commands.modules[command.module as keyof typeof Commands.modules].push(command);
		}
	}
};

export const colors = {
	default: 0xc1a078,
	red: 0xe06666,
	yellow: 0xffd966,
	green: 0x93c47d,
	c4B: 0x55acee,
	c4R: 0xdd2e44,
	tttR: 0xdd2e44,
	tttG: 0x77b255
}

export const gifts = {
	"Potato": { "cost": 4, "emoji": ":potato:" },
	"Lollipop": { "cost": 16, "emoji": ":lollipop:" },
	"Beer": { "cost": 32, "emoji": ":beer:" },
	"Cocktail": { "cost": 50, "emoji": ":cocktail:" },
	"Hamburger": { "cost": 100, "emoji": ":hamburger:" },
	"Pizza": { "cost": 100, "emoji": ":pizza:" },
	"Rose": { "cost": 150, "emoji": ":rose:" },
	"Cherry Blossom": { "cost": 200, "emoji": ":cherry_blossom:" },
	"Sushi": { "cost": 200, "emoji": ":sushi:" },
	"Love Letter": { "cost": 500, "emoji": ":love_letter:" },
	"Dog": { "cost": 800, "emoji": ":dog:" },
	"Cat": { "cost": 800, "emoji": ":cat:" },
	"Ring": { "cost": 1000, "emoji": ":ring:" },
	"Iphone": { "cost": 1000, "emoji": ":iphone:" },
	"Computer": { "cost": 3000, "emoji": ":computer:" },
	"Unicorn": { "cost": 5000, "emoji": ":unicorn:" },
	"Yacht": { "cost": 10000, "emoji": ":cruise_ship:" },
	"Helicopter": { "cost": 35000, "emoji": ":helicopter:" },
	"Airplane": { "cost": 50000, "emoji": ":airplane:" },
	"Villa": { "cost": 100000, "emoji": ":house_with_garden:" },
	"Rocket": { "cost": 500000, "emoji": ":rocket:" },
	"Island": { "cost": 1000000, "emoji": ":island:" },
	"Space Station": { "cost": 5000000, "emoji": ":satellite_orbital:" },
	"Planet": { "cost": 10000000, "emoji": ":ringed_planet:" },
}