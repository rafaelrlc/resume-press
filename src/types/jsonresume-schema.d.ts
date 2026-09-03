declare module "@jsonresume/schema" {
  export interface ValidationError {
    stack: string;
    property: string;
    message: string;
  }

  /** The published JSON Resume schema, as JSON Schema draft-07. */
  export const schema: Record<string, unknown>;
  export const jobSchema: Record<string, unknown>;

  /** Synchronous despite the callback shape — the package never actually defers. */
  export function validate(
    resumeJson: unknown,
    callback: (errors: ValidationError[] | null, valid: boolean) => void,
  ): void;
}
