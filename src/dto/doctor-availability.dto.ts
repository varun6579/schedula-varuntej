import { IsString, IsTime, IsInt, IsBoolean, IsOptional } from 'class-validator';

export class CreateDoctorAvailabilityDto {
  @IsString()
  dayOfWeek: string; // 'MONDAY', 'TUESDAY', ... 'SUNDAY'

  @IsString()
  startTime: string; // Format: HH:mm

  @IsString()
  endTime: string; // Format: HH:mm

  @IsInt()
  @IsOptional()
  slotDurationMinutes: number = 30;

  @IsBoolean()
  @IsOptional()
  isActive: boolean = true;
}

export class UpdateDoctorAvailabilityDto {
  @IsString()
  @IsOptional()
  dayOfWeek?: string;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsInt()
  @IsOptional()
  slotDurationMinutes?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
