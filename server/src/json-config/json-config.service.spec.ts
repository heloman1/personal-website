import { Test, TestingModule } from '@nestjs/testing';
import { JsonConfigService } from './json-config.service';

describe('JsonConfigService', () => {
  let service: JsonConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JsonConfigService],
    }).compile();

    service = module.get<JsonConfigService>(JsonConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
