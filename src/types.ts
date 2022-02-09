export type DiscordEventRecord = Record<
  string,
  (...args: any) => Promise<void>
>;
