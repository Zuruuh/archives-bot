import { Client, Message, PermissionString } from 'discord.js';
import { ICommand } from '../types';

export abstract class $Command implements ICommand {
  public abstract readonly aliases: string[];
  public abstract readonly permissions: PermissionString[];

  // eslint-disable-next-line
  // @ts-ignore
  // TODO: Add typeorm entity manager to constructor
  constructor(private readonly client: Client) {}

  public abstract run<T extends any[]>(
    message: Message,
    args: T
  ): Promise<void>;
}
