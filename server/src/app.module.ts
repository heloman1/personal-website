import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { GameDataService } from './game-query/game-data.service';
import { GameCommandService } from './game-query/game-command.service';
import { GameQueryService } from './game-query/game-query.service';
import { JsonConfigService } from './json-config/json-config.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    GameQueryService,
    GameDataService,
    JsonConfigService,
    GameCommandService,
  ],
})
export class AppModule {}
