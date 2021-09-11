import {
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { GameCommandService } from './game-query/game-command.service';
import { GameDataService } from './game-query/game-data.service';
import { OutgoingServerStatuses } from './types';
import admin from 'firebase-admin';
@Controller('backend')
export class AppController {
  constructor(
    private readonly queryService: GameDataService,
    private readonly commandService: GameCommandService,
    private readonly authService: AuthService,
  ) {}

  @Get('servers-status')
  async serversStatus(
    @Headers('Authorization') authHeader: string,
  ): Promise<OutgoingServerStatuses> {
    let decodedToken: admin.auth.DecodedIdToken;
    try {
      decodedToken = await this.authService.decodeAuthHeader(authHeader);
    } catch (err) {
      console.error('Error in servers-status');
      throw err;
    }

    // Check if the email is authorized, then return data
    if (decodedToken.email == 'tobeimplemented' && false) {
      return this.queryService.getServersStatus();
    } else {
      throw new HttpException(
        'This email is not authorized',
        HttpStatus.UNAUTHORIZED,
      );
    }
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
