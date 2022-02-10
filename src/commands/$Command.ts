import { Client, Message } from 'discord.js';
import { ICommand } from '../types';

export abstract class $Command implements ICommand {
  public abstract aliases: string[];

  // eslint-disable-next-line
  // @ts-ignore
  // TODO: Add typeorm entity manager to constructor
  constructor(private readonly client: Client) {}

  public abstract run(message: Message, ...args: string[]): Promise<void>;
}
