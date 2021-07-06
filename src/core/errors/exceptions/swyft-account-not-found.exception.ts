import { NotFoundException } from '@nestjs/common';

export class Swyft_AccountNotFound extends NotFoundException {
  /**
   * Swyft Throw NotFoundException if a given account ID does not exist
   * @param message The error message
   */
  constructor(message?: string) {
    super(
      `${
        message !== undefined && message.length ? message + ' a' : 'A'
      }ccount does not exist`
    );
  }
}
