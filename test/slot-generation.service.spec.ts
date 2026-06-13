import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SlotGenerationService } from '../src/services/slot-generation.service';
import { AvailabilityService } from '../src/services/availability.service';
import { DoctorAvailability, CustomAvailability, Slot, Appointment } from '../src/entities';
import { addDays, format } from 'date-fns';

describe('SlotGenerationService', () => {
  let service: SlotGenerationService;
  let availabilityService: AvailabilityService;
  let doctorAvailabilityRepo: Repository<DoctorAvailability>;
  let customAvailabilityRepo: Repository<CustomAvailability>;
  let slotRepo: Repository<Slot>;
  let appointmentRepo: Repository<Appointment>;

  const doctorId = 'test-doctor-id';
  const mockDate = new Date('2026-06-20'); // Saturday

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlotGenerationService,
        AvailabilityService,
        {
          provide: getRepositoryToken(DoctorAvailability),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(CustomAvailability),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Slot),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Appointment),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<SlotGenerationService>(SlotGenerationService);
    availabilityService = module.get<AvailabilityService>(AvailabilityService);
    doctorAvailabilityRepo = module.get<Repository<DoctorAvailability>>(
      getRepositoryToken(DoctorAvailability),
    );
    customAvailabilityRepo = module.get<Repository<CustomAvailability>>(
      getRepositoryToken(CustomAvailability),
    );
    slotRepo = module.get<Repository<Slot>>(getRepositoryToken(Slot));
    appointmentRepo = module.get<Repository<Appointment>>(getRepositoryToken(Appointment));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Slot Generation from Recurring Availability', () => {
    it('should generate slots from recurring availability', async () => {
      const availability = {
        id: '1',
        doctorId,
        dayOfWeek: 'SATURDAY',
        startTime: '10:00:00',
        endTime: '11:00:00',
        slotDurationMinutes: 15,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(doctorAvailabilityRepo, 'findOne').mockResolvedValue(availability);
      jest.spyOn(customAvailabilityRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(slotRepo, 'create').mockImplementation((dto) => ({
        ...dto,
        id: 'slot-id',
        patientId: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const slots = await service.generateSlotsForDate(doctorId, mockDate);

      expect(slots).toHaveLength(4); // 4 slots of 15 min each
      expect(slots[0].startTime.getHours()).toBe(10);
      expect(slots[0].startTime.getMinutes()).toBe(0);
    });

    it('should generate 30-minute slots by default', async () => {
      const availability = {
        id: '1',
        doctorId,
        dayOfWeek: 'SATURDAY',
        startTime: '10:00:00',
        endTime: '11:00:00',
        slotDurationMinutes: 30,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(doctorAvailabilityRepo, 'findOne').mockResolvedValue(availability);
      jest.spyOn(customAvailabilityRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(slotRepo, 'create').mockImplementation((dto) => ({
        ...dto,
        id: 'slot-id',
        patientId: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const slots = await service.generateSlotsForDate(doctorId, mockDate);

      expect(slots).toHaveLength(2); // 2 slots of 30 min each
    });

    it('should not create slots that extend beyond availability', async () => {
      const availability = {
        id: '1',
        doctorId,
        dayOfWeek: 'SATURDAY',
        startTime: '10:00:00',
        endTime: '10:45:00',
        slotDurationMinutes: 30,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(doctorAvailabilityRepo, 'findOne').mockResolvedValue(availability);
      jest.spyOn(customAvailabilityRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(slotRepo, 'create').mockImplementation((dto) => ({
        ...dto,
        id: 'slot-id',
        patientId: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const slots = await service.generateSlotsForDate(doctorId, mockDate);

      expect(slots).toHaveLength(1); // Only 1 slot fits
    });
  });

  describe('Custom Availability Override', () => {
    it('should use custom availability when it exists', async () => {
      const customAvailability = {
        id: '1',
        doctorId,
        date: mockDate,
        startTime: '09:00:00',
        endTime: '10:00:00',
        slotDurationMinutes: 20,
        reason: 'Special availability',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(customAvailabilityRepo, 'findOne').mockResolvedValue(customAvailability);
      jest.spyOn(slotRepo, 'create').mockImplementation((dto) => ({
        ...dto,
        id: 'slot-id',
        patientId: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const slots = await service.generateSlotsForDate(doctorId, mockDate);

      expect(slots).toHaveLength(3); // 3 slots of 20 min each
      expect(slots[0].startTime.getHours()).toBe(9);
    });

    it('should return empty slots when custom availability is null (doctor unavailable)', async () => {
      const customAvailability = {
        id: '1',
        doctorId,
        date: mockDate,
        startTime: null,
        endTime: null,
        slotDurationMinutes: null,
        reason: 'Doctor unavailable',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(customAvailabilityRepo, 'findOne').mockResolvedValue(customAvailability);

      const slots = await service.generateSlotsForDate(doctorId, mockDate);

      expect(slots).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should throw error for past dates', async () => {
      const pastDate = addDays(new Date(), -1);

      await expect(service.generateSlotsForDate(doctorId, pastDate)).rejects.toThrow(
        'Cannot generate slots for past dates',
      );
    });

    it('should return empty array when no availability exists', async () => {
      jest.spyOn(customAvailabilityRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(doctorAvailabilityRepo, 'findOne').mockResolvedValue(null);

      const slots = await service.generateSlotsForDate(doctorId, mockDate);

      expect(slots).toHaveLength(0);
    });

    it('should throw error when start time is after end time', async () => {
      const availability = {
        id: '1',
        doctorId,
        dayOfWeek: 'SATURDAY',
        startTime: '11:00:00',
        endTime: '10:00:00',
        slotDurationMinutes: 30,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(doctorAvailabilityRepo, 'findOne').mockResolvedValue(availability);
      jest.spyOn(customAvailabilityRepo, 'findOne').mockResolvedValue(null);

      await expect(service.generateSlotsForDate(doctorId, mockDate)).rejects.toThrow(
        'Start time must be before end time',
      );
    });

    it('should not include past slots', async () => {
      const today = new Date();
      const availability = {
        id: '1',
        doctorId,
        dayOfWeek: today.getDay() === 6 ? 'SATURDAY' : 'SUNDAY',
        startTime: '08:00:00',
        endTime: '12:00:00',
        slotDurationMinutes: 60,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(doctorAvailabilityRepo, 'findOne').mockResolvedValue(availability);
      jest.spyOn(customAvailabilityRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(slotRepo, 'create').mockImplementation((dto) => ({
        ...dto,
        id: 'slot-id',
        patientId: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const slots = await service.getAvailableSlotsForDate(doctorId, today);

      // All slots should be in the future
      slots.forEach(slot => {
        expect(slot.endTime.getTime()).toBeGreaterThan(new Date().getTime());
      });
    });
  });
});
