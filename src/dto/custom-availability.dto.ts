import { IsString, IsOptional, IsDate } from 'class-validator';

export class CreateCustomAvailabilityDto {
  @IsString()
  date: string; // Format: YYYY-MM-DD

  @IsString()
  @IsOptional()
  startTime?: string; // Format: HH:mm, optional if unavailable

  @IsString()
  @IsOptional()
  endTime?: string; // Format: HH:mm, optional if unavailable

  @IsOptional()
  slotDurationMinutes?: number;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class UpdateCustomAvailabilityDto {
  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsOptional()
  slotDurationMinutes?: number;

  @IsString()
  @IsOptional()
  reason?: string;
}
