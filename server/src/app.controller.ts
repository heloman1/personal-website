import { Controller, Get, Post, Query } from '@nestjs/common';
import { GameCommandService } from './game-query/game-command.service';
import { GameDataService } from './game-query/game-data.service';
import { OutgoingServerStatuses } from './types';

@Controller('backend')
export class AppController {
  constructor(
    private readonly queryService: GameDataService,
    private readonly commandService: GameCommandService,
  ) {}

  @Get('servers-status')
  serversStatus(): Promise<OutgoingServerStatuses> {
    return this.queryService.getServersStatus();
  }

  @Post('server-command')
  serverCommand(
    @Query('game') gameName: string,
    @Query('server') serverName: string,
    @Query('command') command: string,
  ): any {
    this.commandService.command(gameName, serverName, command);
  }
}
