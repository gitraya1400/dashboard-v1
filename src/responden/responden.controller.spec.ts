import { Test, TestingModule } from '@nestjs/testing';
import { RespondenController } from './responden.controller';
import { RespondenService } from './responden.service';

describe('RespondenController', () => {
  let controller: RespondenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RespondenController],
      providers: [RespondenService],
    }).compile();

    controller = module.get<RespondenController>(RespondenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
