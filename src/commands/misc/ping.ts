import { Message, PermissionString } from 'discord.js';
import { $Command } from '../$Command';

export default class extends $Command {
  public readonly aliases: string[] = ['ping'];
  public readonly permissions: PermissionString[] = [
    // 'MANAGE_CHANNELS',
    // 'MANAGE_MESSAGES',
  ];

  public async run<T extends any[]>(message: Message, args: T): Promise<void> {
    await message.reply('Pong!');
    console.log(args);

    return;
  }
}
