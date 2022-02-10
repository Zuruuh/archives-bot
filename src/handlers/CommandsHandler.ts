import {
  Client,
  GuildMember,
  Message,
  MessageEmbed,
  PermissionString,
} from 'discord.js';
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

  public static async isCommand(
    message: Message
  ): Promise<CommandValidation<true, ICommand>> {
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

    return { state: true, data: command };
  }

  public static async commandCallback(
    callback: ICommand,
    message: Message
  ): Promise<void> {
    if (
      !CommandHandler.authorizationCallback(message, callback.permissions) ||
      !CommandHandler.canToRunCommandCallback(message)
    )
      return;

    // TODO: parse arguments
    const args = message.content.split(' ').slice(1);
    await callback.run<typeof args>(message, args);

    return;
  }

  private static async canToRunCommandCallback(
    message: Message
  ): Promise<boolean> {
    const allowed = await CommandHandler.canRunCommand(message.member);
    if (!allowed.state && allowed.data) {
      await message.reply({ embeds: [allowed.data] });
    }

    return allowed.state;
  }

  private static async canRunCommand(
    author: GuildMember | null
  ): Promise<CommandValidation<false, MessageEmbed | null>> {
    // TODO: Roles/User related validations (e.g: Is Bot, has (?not) role, etc..)

    return { state: !!author && !author.user.bot, data: null };
  }

  private static async authorizationCallback(
    message: Message,
    permissions: PermissionString[]
  ): Promise<boolean> {
    const permissionsValidation = await CommandHandler.isAuthorized(
      message.member!, // eslint-disable-line
      permissions
    );

    if (!permissionsValidation.state) {
      message.reply({ embeds: [permissionsValidation.data] });

      return false;
    }

    return true;
  }

  private static async isAuthorized(
    author: GuildMember,
    authorizations: PermissionString[]
  ): Promise<CommandValidation<false, MessageEmbed>> {
    const missing: string[] = [];

    authorizations.forEach((auth: PermissionString) => {
      if (!author.permissions.has(auth)) {
        // TODO: Setup i18next constants
        missing.push(auth);
      }
    });

    if (missing.length > 0) {
      const embed = new MessageEmbed()
        .setTitle('Permissions manquantes !')
        .setDescription("Vous n'êtes pas autorisé à effectuer cette action.")
        .setAuthor({
          name: 'Archives Bot',
          iconURL: 'https://bit.ly/3oDWGgd',
          url: 'https://discord.gg/GyJDjkeUwJ',
        })
        .addFields([
          {
            name: 'Permission(s) manquante(s)',
            value:
              '- ' +
              missing.reduce((acc: string, current: string) =>
                acc ? (acc += `\n- ${current}`) : '- ' + acc
              ),
          },
        ]);
      return {
        state: false,
        data: embed,
      };
    }

    return { state: true };
  }
}

type CommandValidation<T extends boolean, K> =
  | { state: T extends true ? false : true }
  | { state: T; data: K };
