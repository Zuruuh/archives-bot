declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'dev' | 'prod';
      BOT_TOKEN: string;
    }
  }
}

export {};
