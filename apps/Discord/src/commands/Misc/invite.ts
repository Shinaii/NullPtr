import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { PermissionsBitField, EmbedBuilder } from 'discord.js';
import { EmbedUtils } from '../../lib/utils/embedUtils.ts';

@ApplyOptions<Command.Options>({
	name: 'invite',
	description: 'Get the bot\'s invite link'
})
export class InviteCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const permissions = new PermissionsBitField([
			PermissionsBitField.Flags.CreateInstantInvite,
			PermissionsBitField.Flags.AddReactions,
			PermissionsBitField.Flags.ViewChannel,
			PermissionsBitField.Flags.SendMessages,
			PermissionsBitField.Flags.ManageMessages,
			PermissionsBitField.Flags.EmbedLinks,
			PermissionsBitField.Flags.AttachFiles,
			PermissionsBitField.Flags.ReadMessageHistory,
			PermissionsBitField.Flags.UseApplicationCommands,
		]);
		const inviteLink = `https://discord.com/oauth2/authorize?client_id=${interaction.client.user?.id}&permissions=${permissions.bitfield}&scope=bot%20applications.commands`;

		const embed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle('Invite Link')
			.setDescription(`Invite me to your server using [this link](${inviteLink}).`)
			.setTimestamp();
		EmbedUtils.setFooter(embed, interaction);

		return interaction.reply({ embeds: [embed], flags: 'Ephemeral' });
	}
}