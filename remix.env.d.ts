/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node" />

declare global {
  declare module '@remix-run/node' {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Cookie {
      // eslint-disable-next-line @typescript-eslint/method-signature-style
      parse(
        cookieHeader: string | null,
        options?: CookieParseOptions,
      ): Promise<unknown>;
    }
  }
}
