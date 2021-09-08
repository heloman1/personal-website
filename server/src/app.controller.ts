import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { GameQueryService } from './game-query/game-query.service';
import { OutgoingServerStatuses } from './types';

@Controller('backend')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly queryService: GameQueryService,
  ) {}

  @Get('servers-status')
  serversStatus(): Promise<OutgoingServerStatuses> {
    return this.queryService.getServersStatus();
  }
}
