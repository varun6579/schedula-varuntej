import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorAvailability, CustomAvailability } from '../entities';
import { CreateDoctorAvailabilityDto, UpdateDoctorAvailabilityDto, CreateCustomAvailabilityDto } from '../dto';
import { parse } from 'date-fns';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(DoctorAvailability)
    private doctorAvailabilityRepository: Repository<DoctorAvailability>,
    @InjectRepository(CustomAvailability)
    private customAvailabilityRepository: Repository<CustomAvailability>,
  ) {}

  /**
   * Create recurring availability for a doctor
   */
  async createDoctorAvailability(
    doctorId: string,
    dto: CreateDoctorAvailabilityDto,
  ): Promise<DoctorAvailability> {
    this.validateTimeFormat(dto.startTime);
    this.validateTimeFormat(dto.endTime);

    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    if (dto.slotDurationMinutes <= 0) {
      throw new BadRequestException('Slot duration must be greater than 0');
    }

    const availability = this.doctorAvailabilityRepository.create({
      doctorId,
      dayOfWeek: dto.dayOfWeek.toUpperCase(),
      startTime: this.normalizeTimeFormat(dto.startTime),
      endTime: this.normalizeTimeFormat(dto.endTime),
      slotDurationMinutes: dto.slotDurationMinutes || 30,
      isActive: dto.isActive !== false,
    });

    return this.doctorAvailabilityRepository.save(availability);
  }

  /**
   * Update recurring availability
   */
  async updateDoctorAvailability(
    availabilityId: string,
    doctorId: string,
    dto: UpdateDoctorAvailabilityDto,
  ): Promise<DoctorAvailability> {
    const availability = await this.doctorAvailabilityRepository.findOne({
      where: { id: availabilityId, doctorId },
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    if (dto.startTime) {
      this.validateTimeFormat(dto.startTime);
      availability.startTime = this.normalizeTimeFormat(dto.startTime);
    }

    if (dto.endTime) {
      this.validateTimeFormat(dto.endTime);
      availability.endTime = this.normalizeTimeFormat(dto.endTime);
    }

    if (availability.startTime && availability.endTime && availability.startTime >= availability.endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    if (dto.slotDurationMinutes !== undefined) {
      if (dto.slotDurationMinutes <= 0) {
        throw new BadRequestException('Slot duration must be greater than 0');
      }
      availability.slotDurationMinutes = dto.slotDurationMinutes;
    }

    if (dto.dayOfWeek) {
      availability.dayOfWeek = dto.dayOfWeek.toUpperCase();
    }

    if (dto.isActive !== undefined) {
      availability.isActive = dto.isActive;
    }

    return this.doctorAvailabilityRepository.save(availability);
  }

  /**
   * Delete recurring availability
   */
  async deleteDoctorAvailability(availabilityId: string, doctorId: string): Promise<void> {
    const availability = await this.doctorAvailabilityRepository.findOne({
      where: { id: availabilityId, doctorId },
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    await this.doctorAvailabilityRepository.remove(availability);
  }

  /**
   * Get all recurring availabilities for a doctor
   */
  async getDoctorAvailabilities(doctorId: string): Promise<DoctorAvailability[]> {
    return this.doctorAvailabilityRepository.find({
      where: { doctorId, isActive: true },
      order: { dayOfWeek: 'ASC' },
    });
  }

  /**
   * Create custom availability for a specific date
   */
  async createCustomAvailability(
    doctorId: string,
    dto: CreateCustomAvailabilityDto,
  ): Promise<CustomAvailability> {
    const date = this.parseDate(dto.date);

    // Validate time format if provided
    if (dto.startTime) {
      this.validateTimeFormat(dto.startTime);
    }
    if (dto.endTime) {
      this.validateTimeFormat(dto.endTime);
    }

    if (dto.startTime && dto.endTime && dto.startTime >= dto.endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    const customAvailability = this.customAvailabilityRepository.create({
      doctorId,
      date,
      startTime: dto.startTime ? this.normalizeTimeFormat(dto.startTime) : null,
      endTime: dto.endTime ? this.normalizeTimeFormat(dto.endTime) : null,
      slotDurationMinutes: dto.slotDurationMinutes || null,
      reason: dto.reason || null,
    });

    return this.customAvailabilityRepository.save(customAvailability);
  }

  /**
   * Get custom availabilities for a doctor
   */
  async getCustomAvailabilities(doctorId: string, fromDate?: Date): Promise<CustomAvailability[]> {
    const query = this.customAvailabilityRepository.createQueryBuilder('ca')
      .where('ca.doctorId = :doctorId', { doctorId });

    if (fromDate) {
      query.andWhere('ca.date >= :fromDate', { fromDate });
    }

    return query.orderBy('ca.date', 'ASC').getMany();
  }

  /**
   * Delete custom availability
   */
  async deleteCustomAvailability(customAvailabilityId: string, doctorId: string): Promise<void> {
    const customAvailability = await this.customAvailabilityRepository.findOne({
      where: { id: customAvailabilityId, doctorId },
    });

    if (!customAvailability) {
      throw new NotFoundException('Custom availability not found');
    }

    await this.customAvailabilityRepository.remove(customAvailability);
  }

  /**
   * Validate time format (HH:mm or HH:mm:ss)
   */
  private validateTimeFormat(time: string): void {
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    if (!timeRegex.test(time)) {
      throw new BadRequestException('Invalid time format. Use HH:mm or HH:mm:ss');
    }
  }

  /**
   * Normalize time format to HH:mm:ss
   */
  private normalizeTimeFormat(time: string): string {
    const parts = time.split(':');
    if (parts.length === 2) {
      return `${parts[0]}:${parts[1]}:00`;
    }
    return time;
  }

  /**
   * Parse date string (YYYY-MM-DD)
   */
  private parseDate(dateString: string): Date {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }

    const date = parse(dateString, 'yyyy-MM-dd', new Date());
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date');
    }

    return date;
  }
}
