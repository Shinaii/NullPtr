// utils/embedUtils.ts
import { EmbedBuilder } from 'discord.js';
import { Command } from '@sapphire/framework';

export class EmbedUtils {
    public static setFooter(embed: EmbedBuilder, interaction: Command.ChatInputCommandInteraction): EmbedBuilder {
        return embed.setFooter({ text: 'NullPtr by Shinaii', iconURL: interaction.client.user.avatarURL() ?? '' });
    }
}