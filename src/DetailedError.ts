export class DetailedError extends Error {
  detailedMessage: string

  constructor(message: string, detailedMessage: string) {
    super(message);
    this.detailedMessage = detailedMessage;
  }
}