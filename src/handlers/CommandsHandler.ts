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
  ): Promise<CommandValidatorResponse> {
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
  ): Promise<boolean> {
    // TODO: Roles/User related validations (e.g: Is Bot, has (?not) role, etc..)
    if (!message.member || message.author.bot) return false;

    const permissionsValidation = await CommandHandler.isAuthorized(
      message.member,
      callback.permissions
    );

    if (!permissionsValidation.state) {
      message.reply({ embeds: [permissionsValidation.embed] });

      return false;
    }

    // TODO: parse arguments
    const args = message.content.split(' ').slice(1);
    await callback.run<typeof args>(message, args);

    return true;
  }

  private static async isAuthorized(
    author: GuildMember,
    authorizations: PermissionString[]
  ): Promise<AuthorizationValidatorResponse> {
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
        embed,
      };
    }

    return { state: true };
  }
}

type CommandValidatorResponse =
  | { state: false }
  | { state: true; command: ICommand };

type AuthorizationValidatorResponse =
  | { state: true }
  | { state: false; embed: MessageEmbed };
