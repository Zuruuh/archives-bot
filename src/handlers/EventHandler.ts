import { Client } from 'discord.js';
import { resolve } from 'path';
import { RecursiveFs } from '../helpers/RecursiveFs';
import { DiscordEventRecord } from '../types';
import { IHandler } from './Handlers';

export class EventHandler implements IHandler {
  constructor(private readonly client: Client) {}

  private static readonly EVENTS_DIR = 'events';
  private static readonly BASE_DIR = resolve(__dirname, '..', this.EVENTS_DIR);
  private events: DiscordEventRecord = {};

  public async setup() {
    this.events = await RecursiveFs.readdir(EventHandler.BASE_DIR);

    await this.registerEventsCallback();
  }

  private async registerEventsCallback(): Promise<void> {
    for (const eventName in this.events) {
      const callback = async (...args: any) =>
        await this.events[eventName](...args);

      this.client.on(
        eventName
          .split('/')
          .map((val: string, index: number) =>
            index === 0 ? val : val.charAt(0).toUpperCase() + val.substring(1)
          )
          .join(''),
        callback
      );
    }
  }
}
