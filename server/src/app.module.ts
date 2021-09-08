import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameQueryService } from './game-query/game-query.service';
import { JsonConfigService } from './json-config/json-config.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, GameQueryService, JsonConfigService],
})
export class AppModule {}
