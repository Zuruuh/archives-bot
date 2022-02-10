import { readdir, stat } from 'fs/promises';
import { resolve } from 'path';

export class RecursiveFs {
  public static async readdir(
    baseDir: string,
    root = true
  ): Promise<Record<string, (...args: any) => Promise<any>>> {
    const content = (await readdir(baseDir)).filter(
      (file: string) =>
        !file.endsWith('.map') && !file.endsWith('.ts') && !file.startsWith('$')
    );
    let files: Record<string, any> = {};

    const promises = content.map(async (file: string) => {
      const filepath = resolve(baseDir, file);
      if ((await stat(filepath)).isDirectory()) {
        const subFiles = await RecursiveFs.readdir(filepath, false);
        files = { ...files, ...subFiles };
      } else {
        const fileContent: (...args: any) => Promise<void> =
          await require(filepath);

        files[filepath] = fileContent;
      }
    });
    await Promise.all(promises);

    return !root
      ? files
      : Object.keys(files)
          .map((key: string) => key.slice(baseDir.length + 1, key.length - 3))
          .reduce((a: Record<string, any>, v: string, index: number) => {
            return { ...a, [v]: Object.values(files)[index].default };
          }, {});
  }
}
