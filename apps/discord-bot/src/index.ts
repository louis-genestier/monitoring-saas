import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import { DISCORD_BOT_TOKEN } from "./utils/env";
import logger from "./utils/logger";
import * as pingCommand from "./commands/utility/ping";
import * as rechercheCommand from "./commands/utility/recherche";
import * as suivreCommand from "./commands/utility/suivre";

class CustomClient extends Client {
  commands: Collection<string, any>;

  constructor(options: any) {
    super(options);
    this.commands = new Collection();
  }
}

const client = new CustomClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

client.commands = new Collection();

client.commands.set(pingCommand.data.name, pingCommand);
client.commands.set(rechercheCommand.data.name, rechercheCommand);
client.commands.set(suivreCommand.data.name, suivreCommand);

const main = async () => {
  await client.login(DISCORD_BOT_TOKEN);

  logger.info(`Bot is running as ${client.user?.tag}`);

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    }
  });
};

main();
