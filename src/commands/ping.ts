import { Message } from 'discord.js';
import { $Command } from './$Command';

export default class extends $Command {
  public aliases: string[] = ['ping'];
  public async run(message: Message, ...args: string[]): Promise<void> {
    await message.reply('Pong!');
    console.log(args);

    return;
  }
}
