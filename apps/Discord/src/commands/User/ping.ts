import { isMessageInstance } from '@sapphire/discord.js-utilities';
import { Command } from '@sapphire/framework';

export class PingCommand extends Command {
    public constructor(context: Command.LoaderContext, options: Command.Options) {
        super(context, { ...options });
    }

    public override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder.setName('ping').setDescription('Ping bot to see if it is alive')
        );
    }

    public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        await interaction.reply({ content: `Ping?`, flags: "Ephemeral" });

        const msg = await interaction.fetchReply();

        if (isMessageInstance(msg)) {
            const diff = msg.createdTimestamp - interaction.createdTimestamp;
            const ping = Math.round(this.container.client.ws.ping);
            return interaction.editReply(`Pong 🏓! (Round trip took: ${diff}ms. Heartbeat: ${ping}ms.)`);
        }

        return interaction.editReply('Failed to retrieve ping :(');
    }
}