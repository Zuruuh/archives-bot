import { Client } from 'discord.js';
import { EventHandler } from './EventHandler';

export class Handlers {
  public static async setup(client: Client) {
    const handlers = [EventHandler];

    handlers.forEach(async (handler) => await new handler(client).setup());
  }
}

export interface IHandler {
  setup: () => void;
}
