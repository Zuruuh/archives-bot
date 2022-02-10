import { Client, Message } from 'discord.js';
import { resolve } from 'path';
import { RecursiveFs } from '../helpers/RecursiveFs';
import { ICommand } from '../types';
import { IHandler } from './Handlers';

export class CommandHandler implements IHandler {
  constructor(private readonly client: Client) {
    this.client;
  }

  private static readonly COMMANDS_DIR = 'commands';
  private static readonly BASE_DIR = resolve(
    __dirname,
    '..',
    this.COMMANDS_DIR
  );

  private static commands: Record<string, ICommand> = {};

  public async setup() {
    const commands = await RecursiveFs.readdir(CommandHandler.BASE_DIR);
    for (const commandName in commands) {
      // eslint-disable-next-line
      // @ts-ignore
      CommandHandler.commands[commandName] = new commands[commandName](
        this.client
      );
    }
  }

  public static async isCommand(message: Message): Promise<
    | {
        state: false;
      }
    | { state: true; command: ICommand }
  > {
    const { content } = message;
    const [userCmd] = content.split(' ');
    // TODO: Use guild prefix
    const prefix = '$';

    // Verify prefix & command/alias
    if (!content.startsWith(prefix)) return { state: false };

    const command = Object.values(CommandHandler.commands).find((cmd) =>
      cmd.aliases.some(
        (alias: string) => alias === userCmd.slice(prefix.length)
      )
    );
    if (!command) return { state: false };

    return { state: true, command };
  }

  public static async commandCallback(
    callback: ICommand,
    message: Message
  ): Promise<void> {
    // TODO: validate permissions
    // TODO: parse arguments
    await callback.run(message, ...message.content.split(' ').slice(1));
  }
}
