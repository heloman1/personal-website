import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { GameDataService } from './game-query/game-data.service';
import { GameCommandService } from './game-query/game-command.service';
import { GameQueryService } from './game-query/game-query.service';
import { ConfigService } from './config/config.service';
import { AuthService } from './auth/auth.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    GameQueryService,
    GameDataService,
    ConfigService,
    GameCommandService,
    AuthService,
  ],
})
export class AppModule {}
