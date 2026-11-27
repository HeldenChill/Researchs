export interface ServerArgs {
  port: number;
  host: string;
  open: boolean;
  noStatic: boolean;
  has(flag: string): boolean;
  get(name: string): string | undefined;
}

export function parseArgs(
  argv: string[] = process.argv.slice(2),
  env: NodeJS.ProcessEnv = process.env,
): ServerArgs {
  const get = (name: string) => {
    const i = argv.indexOf(name);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const has = (flag: string) => argv.includes(flag);

  const port = Number(get('--port') ?? env.PORT ?? 5174);
  const host = has('--local') ? '127.0.0.1' : env.HOST ?? '0.0.0.0';
  const open = has('--open');
  const noStatic = has('--no-static');

  return { port, host, open, noStatic, has, get };
}
