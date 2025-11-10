import { PartialType } from '@nestjs/mapped-types';
import { CreateRespondenDto } from './create-responden.dto';

export class UpdateRespondenDto extends PartialType(CreateRespondenDto) {}
