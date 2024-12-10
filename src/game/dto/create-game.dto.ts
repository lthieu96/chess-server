import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateGameDto {
  @ApiProperty({
    description: 'Time control in seconds (default: 600 - 10 minutes)',
    minimum: 60,
    maximum: 7200,
    default: 600,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(60) // Minimum 1 minute
  @Max(7200) // Maximum 2 hours
  timeControl?: number;

  @ApiProperty({
    description: 'Time increment in seconds per move (default: 5)',
    minimum: 0,
    maximum: 60,
    default: 5,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0) // No increment is allowed
  @Max(60) // Maximum 1 minute increment
  increment?: number;
}
