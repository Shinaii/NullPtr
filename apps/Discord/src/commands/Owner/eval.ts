import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { codeBlock, isThenable } from '@sapphire/utilities';
import { inspect } from 'util';
import { EmbedBuilder } from 'discord.js';
import { VM } from 'vm2';

@ApplyOptions<Command.Options>({
    name: 'eval',
    description: 'Evaluate JavaScript code (Owner only)',
    preconditions: ['OwnerOnly'],
    requiredClientPermissions: ['EmbedLinks'],
    flags: ['ephemeral']
})
export class EvalCommand extends Command {
    public override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addStringOption(option =>
                    option
                        .setName('code')
                        .setDescription('The JavaScript code to evaluate')
                        .setRequired(true)
                )
                .addBooleanOption(option =>
                    option
                        .setName('async')
                        .setDescription('Whether to wrap in async function')
                        .setRequired(false)
                )
                .addIntegerOption(option =>
                    option
                        .setName('depth')
                        .setDescription('Inspection depth')
                        .setRequired(false)
                        .setMinValue(0)
                        .setMaxValue(10)
                )
                .addBooleanOption(option =>
                    option
                        .setName('hidden')
                        .setDescription('Show hidden properties')
                        .setRequired(false)
                )
                .addBooleanOption(option =>
                    option
                        .setName('silent')
                        .setDescription('Suppress output')
                        .setRequired(false)
                )
        );
    }

    public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const code = interaction.options.getString('code', true);
        const flags = {
            async: interaction.options.getBoolean('async') ?? false,
            depth: interaction.options.getInteger('depth') ?? 0,
            showHidden: interaction.options.getBoolean('hidden') ?? false,
            silent: interaction.options.getBoolean('silent') ?? false
        };

        await interaction.deferReply(flags.silent ? { flags: 'Ephemeral' } : {});

        const { result, success, time } = await this.eval(interaction, code, flags);

        const embed = new EmbedBuilder()
            .setColor(success ? 0x00ff00 : 0xff0000)
            .setTitle(success ? 'Evaluation Successful' : 'Evaluation Failed')
            .addFields(
                { name: '📥 Input', value: codeBlock('js', code.slice(0, 1000)) },
                { name: '📤 Output', value: codeBlock(success ? 'js' : 'bash', result.slice(0, 1000)) },
                { name: '⏱️ Time', value: `${time}ms`, inline: true }
            )
            .setTimestamp();

        if (result.length > 1000 || code.length > 1000) {
            embed.setDescription('Output was truncated - full results attached as file');
            return interaction.editReply({
                embeds: [embed],
                files: [{
                    attachment: Buffer.from(result),
                    name: 'output.txt'
                }]
            });
        }

        return interaction.editReply({ embeds: [embed] });
    }

    private async eval(interaction: Command.ChatInputCommandInteraction, code: string, flags: {
        async: boolean;
        depth: number;
        showHidden: boolean;
    }) {
        const start = Date.now();
        if (flags.async) code = `(async () => {\n${code}\n})();`;

        const context = {
            interaction,
            container: this.container,
            client: this.container.client
        };

        let success = true;
        let result = null;
        let time = 0;

        try {
            const vm = new VM({
                timeout: 5000,
                sandbox: context,
                eval: false,
                wasm: false
            });

            result = vm.run(code);

            if (isThenable(result)) {
                result = await result;
            }

            if (typeof result !== 'string') {
                result = inspect(result, {
                    depth: flags.depth,
                    showHidden: flags.showHidden
                });
            }
        } catch (error) {
            success = false;
            result = error instanceof Error ? error.stack || error.message : String(error);
            this.container.logger.error('Eval error:', error);
        } finally {
            time = Date.now() - start;
        }

        return { result: String(result), success, time };
    }
}