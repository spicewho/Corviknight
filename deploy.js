const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

require('dotenv').config();
const token = `${process.env.DISCORD_TOKEN}`;
const clientId = "1492680584198099094";

const commands = [
    new SlashCommandBuilder()
        .setName("collection")
        .setDescription("Manage your Pokémon collection")
        .addSubcommand(sub =>
        sub.setName("add")
            .setDescription("Add Pokémon to your collection")
            .addStringOption(opt =>
                opt.setName("pokemon")
                .setDescription("Separate Pokémon names with a comma")
                .setRequired(true)
            )
        )
        .addSubcommand(sub =>
            sub.setName("remove")
            .setDescription("Remove Pokémon from your collection")
            .addStringOption(opt =>
                opt.setName("pokemon")
                .setDescription("Separate Pokémon names with a comma")
                .setRequired(true)
            )
        )
        .addSubcommand(sub =>
            sub.setName("list")
            .setDescription("View your collection")
        )
        .addSubcommand(sub =>
            sub.setName("clear")
            .setDescription("Clear your collection")
        )
        .toJSON(),
        

        
    new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Server configuration")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(sub =>
            sub
            .setName("rarity")
            .setDescription("Set rarity ping roles")
            .addStringOption(opt =>
                opt
                .setName("type")
                .setDescription("Pokemon rarity type for the bot to track")
                .setRequired(true)
                .addChoices(
                    { name: "Rare", value: "rare" },
                    { name: "Ultra Beast", value: "ub" },
                    { name: "Regional", value: "regional" },
                    { name: "Paradox", value: "paradox" },
                    { name: "Alpha", value: "Alpha" },
                    { name: "Event", value: "event" }
                )
            )
            .addRoleOption(opt =>
                opt
                .setName("role")
                .setDescription("Role that will be pinged")
                .setRequired(true)
            )
        )
        .addSubcommand(sub =>
            sub
            .setName("starboard")
            .setDescription("Setup starboard system")
            .addStringOption(opt =>
                opt
                .setName("type")
                .setRequired(true)
                .setDescription("Pokemon rarity type for the bot to track")
                .addChoices(
                    { name: "Rare", value: "rare" },
                    { name: "Ultra Beast", value: "ub" },
                    { name: "Regional", value: "regional" },
                    { name: "Paradox", value: "paradox" },
                    { name: "Event", value: "event" },
                    { name: "Alpha", value: "alpha" },
                    { name: "All", value: "all" }
                )
            )
            .addChannelOption(opt =>
                opt
                .setName("channel")
                .setDescription("Starboard channel")
                .setRequired(true)
            )
        )
        .addSubcommandGroup(group =>
            group
            .setName('collection')
            .setDescription('Configure user settings')
            .addSubcommand(sub =>
                sub
                .setName("ping")
                .setDescription("Enable/disable collection pings")
                .addStringOption(opt =>
                    opt
                    .setName("value")
                    .setDescription("Disable or enable rarity type pings (Legendary, Regional)")
                    .setRequired(true)
                    .addChoices(
                        { name: "Enable", value: "enable" },
                        { name: "Disable", value: "disable" }
                    )
                )
            )
            .addSubcommand(sub =>
                sub
                .setName("limit")
                .setDescription("Set your server's collection limit")
                .addIntegerOption(opt =>
                    opt
                    .setName("amount")
                    .setDescription("1-25")
                    .setRequired(true)
                )
            )
        )
        .addSubcommand(sub =>
            sub
                .setName("wtp")
                .setDescription("WTP Settings")
                .addStringOption(opt =>
                    opt
                    .setName("state")
                    .setDescription("Enable or disable WTP timers")
                    .setRequired(true)
                    .addChoices(
                        { name: "Enable", value: "enable" },
                        { name: "Disable", value: "disable" }
                    )
                )
                .addIntegerOption(opt =>
                    opt
                    .setName("daily_limit")
                    .setDescription("Set a per-user daily limit, default: max (8)")
                    .setMinValue(1)
                    .setMaxValue(8)
                    .setRequired(false)
                )
            ),
            
    new SlashCommandBuilder()
        .setName("wtp")
        .setDescription("Whos that Pokemon settings")
        .addSubcommand(sub =>
        sub.setName("timer")
            .setDescription("Turn off or on wtp cooldown tracking.")
            .addStringOption(opt =>
                opt
                .setName("state")
                .setDescription("Enable/Disable")
                .setRequired(true)

                .addChoices(
                { name: "Enable", value: "enable" },
                { name: "Disable", value: "disable" }
                )
            )
        ),
    new SlashCommandBuilder()
        .setName("invite")
        .setDescription("Help me fight Tinkaton..."),

    new SlashCommandBuilder()
        .setName("help")
        .setDescription("Help window? Help window!!!"),

    new SlashCommandBuilder()
        .setName("shards")
        .setDescription("View shard status")
        .setDefaultMemberPermissions(0)
        .toJSON(),

    new SlashCommandBuilder()
        .setName("config")
        .setDescription("View server configuration")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .toJSON(),
];

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log("Deploying slash commands...");

    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );

    console.log("Slash commands deployed.");
  } catch (err) {
    console.error(err);
  }
})();