import { Client } from 'discord.js';
import { readdir } from 'fs/promises';
import { resolve } from 'path';
import { DiscordEventRecord } from '../types';
import { IHandler } from './Handlers';

export class EventHandler implements IHandler {
  constructor(private readonly client: Client) {}

  private readonly EVENTS_DIR = 'events';
  private readonly BASE_DIR = resolve(__dirname, '..', this.EVENTS_DIR);
  private events: DiscordEventRecord = {};

  public async setup() {
    this.events = await this.readEvents(this.BASE_DIR, true);

    await this.registerEventsCallback();
  }

  private async readEvents(
    baseDir: string,
    root = false
  ): Promise<DiscordEventRecord> {
    const content = (await readdir(baseDir)).filter(
      (file: string) => !file.endsWith('.map') && !file.endsWith('.ts')
    );

    let events: DiscordEventRecord = {};

    const promises = content.map(async (file: string) => {
      if (!file.endsWith('.js')) {
        const subEvents = await this.readEvents(resolve(baseDir, file));
        events = { ...events, ...subEvents };
      } else {
        let eventName = file.substring(0, file.length - 3);

        if (!root) {
          const eventPrefix = [
            ...baseDir
              .slice(this.BASE_DIR.length + 1, baseDir.length)
              .split('/')
              .map((value: string, index: number) =>
                index === 0
                  ? value
                  : value.charAt(0).toUpperCase() + value.slice(1)
              ),
            eventName.charAt(0).toUpperCase() + eventName.slice(1),
          ].join('');

          eventName = eventPrefix;
        }

        const eventCallback: (...args: any) => Promise<void> = (
          await require(resolve(baseDir, file))
        ).default;

        events[eventName] = eventCallback;
      }
    });
    await Promise.all(promises);

    return events;
  }

  private async registerEventsCallback(): Promise<void> {
    for (const eventName in this.events) {
      const callback = async (...args: any) =>
        await this.events[eventName](...args);
      this.client.on(eventName, callback);
    }
  }
}
