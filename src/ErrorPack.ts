import { DetailedError } from "src/DetailedError";

export class ErrorPack extends Error {
  errors: DetailedError[];

  constructor(message: string, errors: DetailedError[]) {
    super(message);
    this.errors = errors;
  }
}