import { Message } from 'discord.js';
import { CommandHandler } from '../../handlers/CommandsHandler';

export default async (message: Message) => {
  const isCommand = await CommandHandler.isCommand(message);
  if (isCommand.state) {
    await CommandHandler.commandCallback(isCommand.data, message);
  }
};
