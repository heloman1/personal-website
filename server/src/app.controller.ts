import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { GameCommandService } from './game-query/game-command.service';
import { GameDataService } from './game-query/game-data.service';
import { OutgoingServerStatuses } from './types';
import { AuthGuard } from './auth/auth.guard';

@Controller('backend')
@UseGuards(AuthGuard)
export class AppController {
  constructor(
    private readonly query: GameDataService,
    private readonly commmand: GameCommandService,
  ) {}

  @Get('servers-status')
  async serversStatus(): Promise<OutgoingServerStatuses> {
    return this.query.getServersStatus();
  }

  @Post('server-command')
  serverCommand(
    @Query('game') gameName: string,
    @Query('server') serverName: string,
    @Query('command') command: string,
  ): any {
    this.commmand.command(gameName, serverName, command);
  }
}
