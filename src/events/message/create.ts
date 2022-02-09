import { Message } from 'discord.js';

export default async ({ content }: Message) => {
  console.log('Message envoyé! ', content);
};
