import { Subcommand } from "@sapphire/plugin-subcommands";
import { Command } from '@sapphire/framework';
import { prisma } from "@repo/db";

export class AdminCommand extends Subcommand {
    constructor(context: Command.LoaderContext , options: Subcommand.Options) {
        super(context, {
            ...options,
            name: 'admin',
            subcommands: [
                { name: 'list',  chatInputRun: 'AdminList' },
                { name: 'add', chatInputRun: 'AdminAdd' },
                { name: 'remove', chatInputRun: 'AdminRemove' },
                { name: 'update', chatInputRun: 'AdminUpdate' }
            ]
        });
    }

    registerApplicationCommands(registry: Subcommand.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName('admin')
                .setDescription('admin command')
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
                        .setDescription('Update an Admins Telegram ID')
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
        await interaction.deferReply({  flags: "Ephemeral" });

        this.container.logger.info(`AdminList command executed by ${interaction.user.username} (${interaction.user.id})`);

        const user = interaction.user;
        const admin = await prisma.admin.findFirst({
            where: {
                discordId: user.id
            }
        });
        if (!admin) {
            return interaction.editReply('You are not authorized to list admins.');
        }

        const admins = await prisma.admin.findMany({
            select: {
                id: true,
                discordId: true,
                telegramId: true,
            }
        });

        if (admins.length === 0) {
            return interaction.editReply('No admins found.');
        }

        const adminList = admins.map((admin) => `#${admin.id} | Discord: ${admin.discordId} | Telegram: (${admin.telegramId})`).join('\n');
        return interaction.editReply(`Admins:\n${adminList}`);
    }

    public async AdminAdd(interaction: Subcommand.ChatInputCommandInteraction) {
        await interaction.deferReply({ flags: "Ephemeral" });

        this.container.logger.info(`AdminAdd command executed by ${interaction.user.username} (${interaction.user.id})`);

        const user = interaction.user;
        const admin = await prisma.admin.findFirst({
            where: {
                discordId: user.id
            }
        });

        const admins = await prisma.admin.findMany({
            select: {
                id: true,
            }
        });

        if (!admin && admins.length > 0) {
            return interaction.editReply('You are not authorized to add admins.');
        }

        const discordId = interaction.options.getUser('discordid')?.id;
        const telegramId = interaction.options.getString('telegramid') ?? '';

        if (!discordId) {
            return interaction.editReply('Discord ID is required.');
        }

        const existingAdminDc = await prisma.admin.findFirst({
            where: {
                discordId: discordId
            }
        });

        if (existingAdminDc) {
            return interaction.editReply(`User with Discord ID ${discordId} is already an admin.`);
        }

        const existingAdminTg = await prisma.admin.findFirst({
            where: {
                telegramId: telegramId
            }
        });

        if (existingAdminTg) {
            return interaction.editReply(`User with Telegram ID ${telegramId} is already an admin.`);
        }

        await prisma.admin.create({
            data: {
                discordId: discordId,
                telegramId: telegramId
            }
        });

        this.container.logger.warn(`AdminAdd command by ${interaction.user.username} (${interaction.user.id}) went through.`);

        return interaction.editReply(`User with Discord ID ${discordId} has been added as an admin.`);
    }

    public async AdminRemove(interaction: Subcommand.ChatInputCommandInteraction) {
        await interaction.deferReply({  flags: "Ephemeral" });

        this.container.logger.info(`AdminRemove command executed by ${interaction.user.username} (${interaction.user.id})`);

        const user = interaction.user;
        const admin = await prisma.admin.findFirst({
            where: {
                discordId: user.id
            }
        });
        if (!admin) {
            return interaction.editReply('You are not authorized to remove admins.');
        }

        const uniqueId = interaction.options.getInteger('uniqueid');

        if (!uniqueId) {
            return interaction.editReply('Unique ID is required.');
        }

        const existingAdmin = await prisma.admin.findFirst({
            where: {
                id: uniqueId
            }
        });

        if (!existingAdmin) {
            return interaction.editReply(`User with Unique ID ${uniqueId} is not an admin.`);
        }

        await prisma.admin.delete({
            where: {
                id: uniqueId
            }
        });

        this.container.logger.warn(`AdminRemove command by ${interaction.user.username} (${interaction.user.id}) went through.`);

        return interaction.editReply(`User with Unique ID ${uniqueId} has been removed as an admin.`);
    }

    public async AdminUpdate(interaction: Subcommand.ChatInputCommandInteraction) {
        await interaction.deferReply({  flags: "Ephemeral" });

        this.container.logger.info(`AdminUpdate command executed by ${interaction.user.username} (${interaction.user.id})`);

        const user = interaction.user;
        const admin = await prisma.admin.findFirst({
            where: {
                discordId: user.id
            }
        });
        if (!admin) {
            return interaction.editReply('You are not authorized to remove admins.');
        }

        const uniqueId = interaction.options.getInteger('uniqueid');
        const telegramId = interaction.options.getString('telegramid');

        if (!uniqueId || !telegramId) {
            return interaction.editReply('Unique ID and Telegram ID are required.');
        }

        const existingAdmin = await prisma.admin.findFirst({
            where: {
                id: uniqueId
            }
        });

        if (!existingAdmin) {
            return interaction.editReply(`User with Unique ID ${uniqueId} is not an admin.`);
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

        return interaction.editReply(`User with Unique ID ${uniqueId} has been updated with Telegram ID ${telegramId}.`);
    }
}