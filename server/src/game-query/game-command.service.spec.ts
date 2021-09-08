import { Test, TestingModule } from '@nestjs/testing';
import { GameCommandService } from './game-command.service';

describe('GameCommandService', () => {
  let service: GameCommandService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameCommandService],
    }).compile();

    service = module.get<GameCommandService>(GameCommandService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
