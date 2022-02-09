import { Client } from 'discord.js';
import { config as configDotenv } from 'dotenv-flow';
import { join, resolve } from 'path';

async function main(): Promise<void> {
  configDotenv({ path: resolve(join(__dirname, '..', 'config', 'envs')) });

  const client = new Client({ intents: 'GUILDS' });

  client.once('ready', () => console.log('Bot ready !'));

  client.login(process.env.BOT_TOKEN);
}

main();
