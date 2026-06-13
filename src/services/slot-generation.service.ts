import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorAvailability, CustomAvailability, Slot, Appointment } from '../entities';
import { addMinutes, format, parse, isAfter, isBefore, setHours, setMinutes, setSeconds } from 'date-fns';

@Injectable()
export class SlotGenerationService {
  constructor(
    @InjectRepository(DoctorAvailability)
    private doctorAvailabilityRepository: Repository<DoctorAvailability>,
    @InjectRepository(CustomAvailability)
    private customAvailabilityRepository: Repository<CustomAvailability>,
    @InjectRepository(Slot)
    private slotRepository: Repository<Slot>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  /**
   * Get availability for a specific date
   * Priority: Custom Availability > Recurring Availability
   */
  async getAvailabilityForDate(
    doctorId: string,
    date: Date,
  ): Promise<{ startTime: string; endTime: string; slotDurationMinutes: number } | null> {
    // Check if custom availability exists for this date
    const customAvailability = await this.customAvailabilityRepository.findOne({
      where: {
        doctorId,
        date,
      },
    });

    if (customAvailability) {
      // If custom availability exists but times are null, doctor is unavailable
      if (!customAvailability.startTime || !customAvailability.endTime) {
        return null;
      }

      return {
        startTime: customAvailability.startTime,
        endTime: customAvailability.endTime,
        slotDurationMinutes: customAvailability.slotDurationMinutes || 30,
      };
    }

    // Fall back to recurring availability
    const dayOfWeek = this.getDayOfWeek(date);
    const recurringAvailability = await this.doctorAvailabilityRepository.findOne({
      where: {
        doctorId,
        dayOfWeek,
        isActive: true,
      },
    });

    if (!recurringAvailability) {
      return null;
    }

    return {
      startTime: recurringAvailability.startTime,
      endTime: recurringAvailability.endTime,
      slotDurationMinutes: recurringAvailability.slotDurationMinutes,
    };
  }

  /**
   * Generate slots for a specific date
   */
  async generateSlotsForDate(
    doctorId: string,
    date: Date,
  ): Promise<Slot[]> {
    // Validate date
    if (isBefore(date, new Date())) {
      throw new BadRequestException('Cannot generate slots for past dates');
    }

    // Get availability for the date
    const availability = await this.getAvailabilityForDate(doctorId, date);
    if (!availability) {
      return [];
    }

    // Parse start and end times
    const startTime = parse(availability.startTime, 'HH:mm:ss', date);
    const endTime = parse(availability.endTime, 'HH:mm:ss', date);

    if (isAfter(startTime, endTime)) {
      throw new BadRequestException('Start time must be before end time');
    }

    // Generate slots
    const slots: Slot[] = [];
    let currentTime = startTime;

    while (isBefore(currentTime, endTime)) {
      const slotEndTime = addMinutes(currentTime, availability.slotDurationMinutes);

      // Don't create slot if it extends beyond availability
      if (isAfter(slotEndTime, endTime)) {
        break;
      }

      // Only create slot if it's in the future
      if (isAfter(slotEndTime, new Date())) {
        const slot = this.slotRepository.create({
          doctorId,
          startTime: currentTime,
          endTime: slotEndTime,
          status: 'AVAILABLE',
        });
        slots.push(slot);
      }

      currentTime = slotEndTime;
    }

    return slots;
  }

  /**
   * Get available slots for a doctor on a specific date
   * Only returns future and available slots
   */
  async getAvailableSlotsForDate(
    doctorId: string,
    date: Date,
  ): Promise<Slot[]> {
    const slots = await this.generateSlotsForDate(doctorId, date);

    // Filter for future and available slots
    const now = new Date();
    return slots.filter(slot => {
      return slot.status === 'AVAILABLE' && isAfter(slot.endTime, now);
    });
  }

  /**
   * Get available slots for a doctor within a date range
   */
  async getAvailableSlotsForDateRange(
    doctorId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Slot[]> {
    const slots: Slot[] = [];
    let currentDate = new Date(startDate);

    while (isBefore(currentDate, endDate) || currentDate.getTime() === endDate.getTime()) {
      const dailySlots = await this.getAvailableSlotsForDate(doctorId, currentDate);
      slots.push(...dailySlots);

      // Move to next day
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return slots;
  }

  /**
   * Get day of week from date
   */
  private getDayOfWeek(date: Date): string {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[date.getDay()];
  }

  /**
   * Validate if doctor exists and has availability
   */
  async doctorHasAvailability(doctorId: string): Promise<boolean> {
    const count = await this.doctorAvailabilityRepository.count({
      where: {
        doctorId,
        isActive: true,
      },
    });

    return count > 0;
  }

  /**
   * Parse time string (HH:mm) to Date with specific base date
   */
  private parseTimeString(timeString: string, baseDate: Date): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    return setSeconds(setMinutes(setHours(baseDate, hours), minutes), 0);
  }
}
