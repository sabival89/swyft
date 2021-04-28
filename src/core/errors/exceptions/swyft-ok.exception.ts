import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Http OK Response
 */
export class Swyft_OKException extends HttpException {
  /**
   * Swyft Http OK Response Exception
   * @param message
   */
  constructor(message: string) {
    super(
      {
        status: HttpStatus.OK,
        message: message,
      },
      HttpStatus.OK
    );
  }
}
