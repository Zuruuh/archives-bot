import { Client, Intents } from 'discord.js';
import { config as configDotenv } from 'dotenv-flow';
import { Handlers } from './handlers/Handlers';
import { resolve } from 'path';

async function main(): Promise<void> {
  configDotenv({ path: resolve(__dirname, '..', 'config', 'envs') });

  const client = new Client({ intents: Object.values(Intents.FLAGS) });

  await Handlers.setup(client);

  client.login(process.env.BOT_TOKEN);
}

main().catch((e: Error) => console.error(e));
