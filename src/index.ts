import { Client } from 'discord.js';
import { config as configDotenv } from 'dotenv-flow';
import { Handlers } from './handlers/Handlers';
import { resolve } from 'path';

async function main(): Promise<void> {
  configDotenv({ path: resolve(__dirname, '..', 'config', 'envs') });

  const client = new Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] });

  await Handlers.setup(client);

  client.login(process.env.BOT_TOKEN);
}

main().catch((e: Error) => console.error(e));
