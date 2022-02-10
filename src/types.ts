import { Message } from 'discord.js';

export type DiscordEventRecord = Record<
  string,
  (...args: any) => Promise<void>
>;

export interface ICommand {
  run: (message: Message, ...args: string[]) => Promise<void>;
  aliases: string[];
}
