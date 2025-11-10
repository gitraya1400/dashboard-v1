import { Test, TestingModule } from '@nestjs/testing';
import { RespondenService } from './responden.service';

describe('RespondenService', () => {
  let service: RespondenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RespondenService],
    }).compile();

    service = module.get<RespondenService>(RespondenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
