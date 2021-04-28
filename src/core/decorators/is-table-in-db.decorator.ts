import { BadRequestException } from '@nestjs/common';
import { Repository } from 'src/repositories/repository';

const isTableInDB = (table: string) => (
  target: unknown,
  propertyKey: string,
  descriptor: PropertyDescriptor
) => {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args) {
    if (Repository.isTableInDB(table) === false)
      return new BadRequestException('The table does not exist');
    else return originalMethod.apply(this, args);
  };

  return descriptor;
};

export default isTableInDB;
