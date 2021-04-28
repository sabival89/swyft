import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToClass(metatype, value);
    const errors = await validate(object);

    /**
     * @TODO Write a recursion function to check and return errors for child properties
     */
    if (errors.length > 0) {
      // console.log(errors[0].children);
      const [validationError] = errors;

      if (validationError.children.length) {
        // Do Recurse
        console.log('Do recurse');
        console.log(validationError.children);

        throw new BadRequestException('Validation Error');
      } else {
        console.log(validationError);
        console.log(validationError.constraints);
        throw new BadRequestException(
          Object.values(validationError.constraints)
        );
      }

      //   throw new BadRequestException('Validation failed');
    }
    return value;
  }

  private toValidate(metatype: any): boolean {
    const types: any[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
