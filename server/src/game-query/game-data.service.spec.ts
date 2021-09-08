import { Test, TestingModule } from '@nestjs/testing';
import { GameDataService } from './game-data.service';

describe('GameQueryService', () => {
  let service: GameDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameDataService],
    }).compile();

    service = module.get<GameDataService>(GameDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
