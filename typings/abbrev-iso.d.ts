// Type declarations for the vendored abbrevIso library, see src/lib/abbrev-iso/.
declare module "*/AbbrevIso.js" {
  export class AbbrevIso {
    constructor(ltwa: string | string[], shortWords: string | string[]);
    /** Number of LTWA patterns loaded. */
    readonly size: number;
    /** Compute the ISO 4 abbreviation of a publication title. */
    makeAbbreviation(value: string, languages?: string[]): string;
    /** All LTWA patterns potentially matching the given title. */
    getMatchingPatterns(value: string, languages?: string[]): any[];
  }
}
