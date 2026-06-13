import {
  Controller,
  Get,
  Req,
  UseGuards,
  Param,
  Query,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { SlotGenerationService } from '../services';
import { parse, isBefore, isAfter } from 'date-fns';

@Controller('patient')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientController {
  constructor(private slotGenerationService: SlotGenerationService) {}

  @Get('profile')
  @Roles('PATIENT')
  getProfile(@Req() req: any) {
    return {
      message: 'Patient profile access granted',
      user: req.user,
    };
  }

  /**
   * Get available slots for a doctor on a specific date
   * Query params: date (YYYY-MM-DD format)
   */
  @Get('doctor/:doctorId/slots')
  @Roles('PATIENT')
  async getAvailableSlots(
    @Param('doctorId') doctorId: string,
    @Query('date') dateString: string,
  ) {
    // Validate date query parameter
    if (!dateString) {
      throw new BadRequestException('Date parameter is required (format: YYYY-MM-DD)');
    }

    // Parse and validate date
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }

    const date = parse(dateString, 'yyyy-MM-dd', new Date());
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date');
    }

    // Check if date is in the past
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (isBefore(date, now)) {
      throw new BadRequestException('Cannot fetch slots for past dates');
    }

    // Check if doctor has any availability
    const hasAvailability = await this.slotGenerationService.doctorHasAvailability(doctorId);
    if (!hasAvailability) {
      return {
        message: 'No availability found for this doctor',
        data: [],
      };
    }

    // Get available slots
    const slots = await this.slotGenerationService.getAvailableSlotsForDate(doctorId, date);

    return {
      message: 'Available slots retrieved successfully',
      data: slots.map(slot => ({
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: slot.status,
      })),
      count: slots.length,
    };
  }

  /**
   * Get available slots for a doctor within a date range
   * Query params: startDate (YYYY-MM-DD), endDate (YYYY-MM-DD)
   */
  @Get('doctor/:doctorId/slots/range')
  @Roles('PATIENT')
  async getAvailableSlotsRange(
    @Param('doctorId') doctorId: string,
    @Query('startDate') startDateString: string,
    @Query('endDate') endDateString: string,
  ) {
    // Validate date parameters
    if (!startDateString || !endDateString) {
      throw new BadRequestException('startDate and endDate parameters are required (format: YYYY-MM-DD)');
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDateString) || !dateRegex.test(endDateString)) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }

    const startDate = parse(startDateString, 'yyyy-MM-dd', new Date());
    const endDate = parse(endDateString, 'yyyy-MM-dd', new Date());

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date');
    }

    // Check if dates are in the past
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (isBefore(startDate, now)) {
      throw new BadRequestException('Cannot fetch slots for past dates');
    }

    if (isAfter(startDate, endDate)) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Check if doctor has any availability
    const hasAvailability = await this.slotGenerationService.doctorHasAvailability(doctorId);
    if (!hasAvailability) {
      return {
        message: 'No availability found for this doctor',
        data: [],
      };
    }

    // Get available slots
    const slots = await this.slotGenerationService.getAvailableSlotsForDateRange(
      doctorId,
      startDate,
      endDate,
    );

    return {
      message: 'Available slots retrieved successfully',
      data: slots.map(slot => ({
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: slot.status,
      })),
      count: slots.length,
    };
  }
}
