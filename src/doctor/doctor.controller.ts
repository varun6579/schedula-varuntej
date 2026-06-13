import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Req,
  UseGuards,
  Body,
  Param,
  Query,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { AvailabilityService, SlotGenerationService } from '../services';
import {
  CreateDoctorAvailabilityDto,
  UpdateDoctorAvailabilityDto,
  CreateCustomAvailabilityDto,
} from '../dto';
import { parse } from 'date-fns';

@Controller('doctor')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DoctorController {
  constructor(
    private availabilityService: AvailabilityService,
    private slotGenerationService: SlotGenerationService,
  ) {}

  @Get('profile')
  @Roles('DOCTOR')
  getProfile(@Req() req: any) {
    return {
      message: 'Doctor profile access granted',
      user: req.user,
    };
  }

  /**
   * Create recurring availability for a doctor
   */
  @Post('availability')
  @Roles('DOCTOR')
  async createAvailability(
    @Req() req: any,
    @Body() dto: CreateDoctorAvailabilityDto,
  ) {
    const doctorId = req.user.id;
    const availability = await this.availabilityService.createDoctorAvailability(doctorId, dto);
    return {
      message: 'Availability created successfully',
      data: availability,
    };
  }

  /**
   * Get all recurring availabilities for a doctor
   */
  @Get('availabilities')
  @Roles('DOCTOR')
  async getAvailabilities(@Req() req: any) {
    const doctorId = req.user.id;
    const availabilities = await this.availabilityService.getDoctorAvailabilities(doctorId);
    return {
      message: 'Availabilities retrieved successfully',
      data: availabilities,
    };
  }

  /**
   * Update recurring availability
   */
  @Put('availability/:availabilityId')
  @Roles('DOCTOR')
  async updateAvailability(
    @Req() req: any,
    @Param('availabilityId') availabilityId: string,
    @Body() dto: UpdateDoctorAvailabilityDto,
  ) {
    const doctorId = req.user.id;
    const availability = await this.availabilityService.updateDoctorAvailability(
      availabilityId,
      doctorId,
      dto,
    );
    return {
      message: 'Availability updated successfully',
      data: availability,
    };
  }

  /**
   * Delete recurring availability
   */
  @Delete('availability/:availabilityId')
  @Roles('DOCTOR')
  async deleteAvailability(
    @Req() req: any,
    @Param('availabilityId') availabilityId: string,
  ) {
    const doctorId = req.user.id;
    await this.availabilityService.deleteDoctorAvailability(availabilityId, doctorId);
    return {
      message: 'Availability deleted successfully',
    };
  }

  /**
   * Create custom availability for a specific date
   */
  @Post('custom-availability')
  @Roles('DOCTOR')
  async createCustomAvailability(
    @Req() req: any,
    @Body() dto: CreateCustomAvailabilityDto,
  ) {
    const doctorId = req.user.id;
    const customAvailability = await this.availabilityService.createCustomAvailability(doctorId, dto);
    return {
      message: 'Custom availability created successfully',
      data: customAvailability,
    };
  }

  /**
   * Get custom availabilities
   */
  @Get('custom-availabilities')
  @Roles('DOCTOR')
  async getCustomAvailabilities(@Req() req: any) {
    const doctorId = req.user.id;
    const customAvailabilities = await this.availabilityService.getCustomAvailabilities(doctorId);
    return {
      message: 'Custom availabilities retrieved successfully',
      data: customAvailabilities,
    };
  }

  /**
   * Delete custom availability
   */
  @Delete('custom-availability/:customAvailabilityId')
  @Roles('DOCTOR')
  async deleteCustomAvailability(
    @Req() req: any,
    @Param('customAvailabilityId') customAvailabilityId: string,
  ) {
    const doctorId = req.user.id;
    await this.availabilityService.deleteCustomAvailability(customAvailabilityId, doctorId);
    return {
      message: 'Custom availability deleted successfully',
    };
  }
}
