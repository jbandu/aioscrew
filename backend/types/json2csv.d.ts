/**
 * Type declarations for json2csv package
 * Since @types/json2csv doesn't exist for v6.0.0-alpha.2
 */

declare module 'json2csv' {
  export interface ParserOptions {
    fields?: string[];
    [key: string]: any;
  }

  export class Parser {
    constructor(options?: ParserOptions);
    parse(data: any[]): string;
  }
}
