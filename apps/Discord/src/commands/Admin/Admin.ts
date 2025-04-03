import { ApplyOptions } from '@sapphire/decorators';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { Command } from '@sapphire/framework';
import { prisma } from '@repo/db';
import { OWNER_IDS } from '../../preconditions/OwnerOnly.ts';
import { EmbedBuilder } from 'discord.js';
import { EmbedUtils } from '../../utils/embedUtils.ts';

@ApplyOptions<Subcommand.Options>({
    name: 'admin',
    subcommands: [
        { name: 'list', chatInputRun: 'AdminList' },
        { name: 'add', chatInputRun: 'AdminAdd' },
        { name: 'remove', chatInputRun: 'AdminRemove' },
        { name: 'update', chatInputRun: 'AdminUpdate' }
    ],
    description: 'Admin command',
    preconditions: ['AdminOnly']
})
export class AdminCommand extends Subcommand {
    public constructor(context: Command.LoaderContext, options: Subcommand.Options) {
        super(context, options);
    }

    public override registerApplicationCommands(registry: Subcommand.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addSubcommand((command) =>
                    command
                        .setName('list')
                        .setDescription('List Admins')
                )
                .addSubcommand((command) =>
                    command
                        .setName('add')
                        .setDescription('Add an Admin')
                        .addUserOption((option) =>
                            option.setName('discordid').setDescription('Discord ID of the User').setRequired(true)
                        )
                        .addStringOption((option) =>
                            option.setName('telegramid').setDescription('Telegram ID of the User. (not required in Discord)').setRequired(false)
                        )
                )
                .addSubcommand((command) =>
                    command
                        .setName('remove')
                        .setDescription('Remove an Admin')
                        .addUserOption((option) =>
                            option.setName('uniqueid').setDescription('Unique ID of the User').setRequired(true)
                        )
                )
                .addSubcommand((command) =>
                    command
                        .setName('update')
                        .setDescription('Update an Admin\'s Telegram ID')
                        .addUserOption((option) =>
                            option.setName('uniqueid').setDescription('Unique ID of the User').setRequired(true)
                        )
                        .addStringOption((option) =>
                            option.setName('telegramid').setDescription('Telegram ID of the User. (not required in Discord)').setRequired(true)
                        )
                )
        );
    }

    public async AdminList(interaction: Subcommand.ChatInputCommandInteraction) {
        await interaction.deferReply({ flags: 'Ephemeral' });

        this.container.logger.info(`AdminList command executed by ${interaction.user.username} (${interaction.user.id})`);

        const admins = await prisma.admin.findMany({
            select: {
                id: true,
                discordId: true,
                telegramId: true,
            }
        });

        if (admins.length === 0) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('No Admins Found')
                .setDescription('No admins found.');
            EmbedUtils.setFooter(embed, interaction);
            return interaction.editReply({ embeds: [embed] });
        }

        const adminList = admins.map((admin) => `#${admin.id} | Discord: ${admin.discordId} | Telegram: (${admin.telegramId})`).join('\n');
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('Admins')
            .setDescription(adminList);
        EmbedUtils.setFooter(embed, interaction);
        return interaction.editReply({ embeds: [embed] });
    }

    public async AdminAdd(interaction: Subcommand.ChatInputCommandInteraction) {
        await interaction.deferReply({ flags: 'Ephemeral' });

        this.container.logger.info(`AdminAdd command executed by ${interaction.user.username} (${interaction.user.id})`);

        const user = interaction.user;
        const admins = await prisma.admin.findMany({
            select: {
                id: true,
            }
        });

        if (admins.length === 0) {
            if (!OWNER_IDS.includes(user.id)) {
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('Unauthorized')
                    .setDescription('Only the owner can add the first admin.');
                EmbedUtils.setFooter(embed, interaction);
                return interaction.editReply({ embeds: [embed] });
            }
        }

        const discordId = interaction.options.getUser('discordid')?.id;
        const telegramId = interaction.options.getString('telegramid') ?? '';

        if (!discordId) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Missing Information')
                .setDescription('Discord ID is required.');
            EmbedUtils.setFooter(embed, interaction);
            return interaction.editReply({ embeds: [embed] });
        }

        const existingAdminDc = await prisma.admin.findFirst({
            where: {
                discordId: discordId
            }
        });

        if (existingAdminDc) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Already an Admin')
                .setDescription(`User with Discord ID ${discordId} is already an admin.`);
            EmbedUtils.setFooter(embed, interaction);
            return interaction.editReply({ embeds: [embed] });
        }

        const existingAdminTg = await prisma.admin.findFirst({
            where: {
                telegramId: telegramId
            }
        });

        if (existingAdminTg) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Already an Admin')
                .setDescription(`User with Telegram ID ${telegramId} is already an admin.`);
            EmbedUtils.setFooter(embed, interaction);
            return interaction.editReply({ embeds: [embed] });
        }

        await prisma.admin.create({
            data: {
                discordId: discordId,
                telegramId: telegramId
            }
        });

        this.container.logger.warn(`AdminAdd command by ${interaction.user.username} (${interaction.user.id}) went through.`);

        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('Admin Added')
            .setDescription(`User with Discord ID ${discordId} has been added as an admin.`);
        EmbedUtils.setFooter(embed, interaction);
        return interaction.editReply({ embeds: [embed] });
    }

    public async AdminRemove(interaction: Subcommand.ChatInputCommandInteraction) {
        await interaction.deferReply({ flags: 'Ephemeral' });

        this.container.logger.info(`AdminRemove command executed by ${interaction.user.username} (${interaction.user.id})`);

        const uniqueId = interaction.options.getInteger('uniqueid');

        if (!uniqueId) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Missing Information')
                .setDescription('Unique ID is required.');
            EmbedUtils.setFooter(embed, interaction);
            return interaction.editReply({ embeds: [embed] });
        }

        const existingAdmin = await prisma.admin.findFirst({
            where: {
                id: uniqueId
            }
        });

        if (!existingAdmin) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Not an Admin')
                .setDescription(`User with Unique ID ${uniqueId} is not an admin.`);
            EmbedUtils.setFooter(embed, interaction);
            return interaction.editReply({ embeds: [embed] });
        }

        await prisma.admin.delete({
            where: {
                id: uniqueId
            }
        });

        this.container.logger.warn(`AdminRemove command by ${interaction.user.username} (${interaction.user.id}) went through.`);

        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('Admin Removed')
            .setDescription(`User with Unique ID ${uniqueId} has been removed as an admin.`);
        EmbedUtils.setFooter(embed, interaction);
        return interaction.editReply({ embeds: [embed] });
    }

    public async AdminUpdate(interaction: Subcommand.ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });

        this.container.logger.info(`AdminUpdate command executed by ${interaction.user.username} (${interaction.user.id})`);

        const uniqueId = interaction.options.getInteger('uniqueid');
        const telegramId = interaction.options.getString('telegramid');

        if (!uniqueId || !telegramId) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Missing Information')
                .setDescription('Unique ID and Telegram ID are required.');
            EmbedUtils.setFooter(embed, interaction);
            return interaction.editReply({ embeds: [embed] });
        }

        const existingAdmin = await prisma.admin.findFirst({
            where: {
                id: uniqueId
            }
        });

        if (!existingAdmin) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Not an Admin')
                .setDescription(`User with Unique ID ${uniqueId} is not an admin.`);
            EmbedUtils.setFooter(embed, interaction);
            return interaction.editReply({ embeds: [embed] });
        }

        await prisma.admin.update({
            where: {
                id: uniqueId
            },
            data: {
                telegramId: telegramId
            }
        });

        this.container.logger.warn(`AdminUpdate command by ${interaction.user.username} (${interaction.user.id}) went through.`);

        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('Admin Updated')
            .setDescription(`User with Unique ID ${uniqueId} has been updated with Telegram ID ${telegramId}.`);
        EmbedUtils.setFooter(embed, interaction);
        return interaction.editReply({ embeds: [embed] });
    }
}