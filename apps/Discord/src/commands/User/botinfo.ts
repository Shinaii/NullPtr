import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import {EmbedUtils} from "../../lib/utils/embedUtils.ts";
import * as pidusage from 'pidusage';

@ApplyOptions<Command.Options>({
	name: 'botinfo',
	description: 'Display Information about the Bot'
})
export class BotinfoCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const membercount = interaction.client.guilds.cache.reduce((acc, guild) => acc
			+ guild.memberCount, 0);

		// Uptime calculation
		const uptime = process.uptime();
		const timeUnits = [
			{ label: 'd', value: Math.floor(uptime / 86400) },
			{ label: 'h', value: Math.floor((uptime % 86400) / 3600) },
			{ label: 'm', value: Math.floor((uptime % 3600) / 60) },
			{ label: 's', value: Math.floor(uptime % 60) }
		];

		// Filter out zero values and format the string
		const uptimeString = timeUnits
			.filter(unit => unit.value > 0)
			.map(unit => `${unit.value}${unit.label}`)
			.join(' ');


		async function getBotInfoCPUUsage(): Promise<string> {
			const { cpu } = await pidusage(process.pid);
			return `${cpu.toFixed(2)}%`;
		}

		const embed = new EmbedBuilder()
			.setColor(0xA020F0)
			.setTitle('Botinfo')
			.setThumbnail(interaction.client.user.avatarURL())
			.setDescription(`NullPtr is a cross-platform tool for downloading and managing files from 
							anonymous sources. It is designed to be fast, efficient, and easy to use.`)
			.setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.avatarURL() ?? undefined})
			.setURL('https://github.com/Shinaii/NullPtr')
			.setFields(
				{ name: 'RAM Usage', value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true },
				{ name: 'CPU Usage', value: await getBotInfoCPUUsage(), inline: true },
				{
					name: 'Uptime',
					value: uptimeString || 'N/A', // Display 'N/A' if uptime is 0
					inline: true
				},
				{ name: 'Users', value: `${membercount}`, inline: true },
				{ name: 'Servers', value: `${interaction.client.guilds.cache.size}`, inline: true },
				{ name: 'Contributing', value: '[GitHub](https://github.com/Shinaii/NullPtr)', inline: true },
				{ name: 'Ping', value: `${Math.round(interaction.client.ws.ping)}ms`, inline: true },
				{ name: 'Special Thanks', value: 'None', inline: true }
			)

			.setTimestamp();
		EmbedUtils.setFooter(embed, interaction);

		return interaction.reply({ embeds: [embed], flags: 'Ephemeral' });
	}
}