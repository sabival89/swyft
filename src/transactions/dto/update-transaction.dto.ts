import { PartialType } from '@nestjs/swagger';
import { CreateTransactionDto } from '../dto/create-transaction.dto';

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}
