import { ApplyOptions } from '@sapphire/decorators';
import { isMessageInstance } from '@sapphire/discord.js-utilities';
import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import {EmbedUtils} from "../../utils/embedUtils.ts";

@ApplyOptions<Command.Options>({
    name: 'ping',
    description: 'Ping bot to see if it is alive'
})
export class PingCommand extends Command {
    public constructor(context: Command.LoaderContext, options: Command.Options) {
        super(context, { ...options });
    }

    public override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder.setName(this.name).setDescription(this.description)
        );
    }

    public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        await interaction.reply({ content: `Ping?`, flags: 'Ephemeral' });

        const msg = await interaction.fetchReply();

        if (isMessageInstance(msg)) {
            const diff = msg.createdTimestamp - interaction.createdTimestamp;
            const ping = Math.round(this.container.client.ws.ping);

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('Pong 🏓!')
                .setDescription(`Round trip took: ${diff}ms. Heartbeat: ${ping}ms.`);
            EmbedUtils.setFooter(embed, interaction);

            return interaction.editReply({ embeds: [embed] });
        }

        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('Error')
            .setDescription('Failed to retrieve ping :(');
        EmbedUtils.setFooter(embed, interaction);

        return interaction.editReply({ embeds: [embed] });
    }
}