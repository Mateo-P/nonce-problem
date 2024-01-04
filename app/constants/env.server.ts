import { z } from 'zod';

const environmentSchema = z.object({
  ALLOWED_ORIGINS: z.string().trim(),
  PUBLIC_MUI_DATA_GRID_LICENSE: z.string().trim().min(1),
});

export type GlobalEnvironment = z.infer<typeof environmentSchema>;

type GetBrowserEnvironment<Environment extends GlobalEnvironment> = Pick<
  Environment,
  {
    [Key in keyof Environment]: Key extends `PUBLIC_${string}` ? Key : never;
  }[keyof Environment]
>;

export type BrowserEnvironment = GetBrowserEnvironment<GlobalEnvironment>;

export const GLOBAL_ENVIRONMENT = environmentSchema.parse(process.env);

declare global {
  /* eslint-disable-next-line @typescript-eslint/no-namespace --
   * This is a global namespace
   */
  namespace NodeJS {
    /* eslint-disable-next-line @typescript-eslint/consistent-type-definitions --
     * Interface merging requires to use an interface
     */
    interface ProcessEnv extends Partial<GlobalEnvironment> {}
  }

  /* eslint-disable-next-line @typescript-eslint/consistent-type-definitions --
   * Interface merging requires to use an interface
   */
  interface Window {
    ENV?: BrowserEnvironment & {
      PUBLIC_DATE: string;
    };
  }
}
