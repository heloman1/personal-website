import { Test, TestingModule } from '@nestjs/testing';
import { GameQueryService } from './game-query.service';

describe('GameQueryService', () => {
  let service: GameQueryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameQueryService],
    }).compile();

    service = module.get<GameQueryService>(GameQueryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
