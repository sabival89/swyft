import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToClass(metatype, value);
    const errors = await validate(object);

    // Check whether errors have children
    if (errors.length > 0) {
      const [validationError] = errors;
      if (validationError.children.length) {
        throw new BadRequestException(
          this.printErrors(validationError.children)
        );
      } else {
        console.log(validationError.constraints);
        throw new BadRequestException(
          Object.values(validationError.constraints)
        );
      }
    }
    return value;
  }

  private toValidate(metatype: any): boolean {
    const types: Array<any> = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  /**
   * Get nested errors
   * @param errorObject
   * @returns
   */
  private printErrors = (
    errorObject: Array<ValidationError>
  ): string | Array<ValidationError> => {
    if (errorObject.length < 1) return errorObject;
    return errorObject
      .map((error) => Object.values(error.constraints))
      .join('; ');
  };
}
