    import { Type } from 'class-transformer';
    import { ValidateNested, IsArray } from 'class-validator';
    import { SendEmailDto } from './send-email.dto';

    export class SendBulkDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SendEmailDto)
    emails: SendEmailDto[];
    }
