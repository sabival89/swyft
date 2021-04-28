import { BadRequestException } from '@nestjs/common';
import { Repository } from 'src/repositories/repository';

/**
 * Check if a given table exists in the database
 * @param table
 * @returns
 */
const isTableInDB = (table: any) => (
  target: unknown,
  propertyKey: string,
  descriptor: PropertyDescriptor
) => {
  const mainMethod = descriptor.value;

  descriptor.value = function (...args) {
    if (!Repository.isTableInDB(table))
      return new BadRequestException('The table does not exist');
    else return mainMethod.apply(this, args);
  };

  return descriptor;
};

export default isTableInDB;
