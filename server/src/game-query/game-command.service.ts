import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { GameDataService } from 'src/game-query/game-data.service';
import { JsonConfigService } from 'src/json-config/json-config.service';
import { GameQueryService } from './game-query.service';

@Injectable()
/**
 * Handles Command Sending
 */
export class GameCommandService {
  constructor(
    private readonly config: JsonConfigService,
    private readonly gameData: GameDataService,
    private readonly query: GameQueryService,
  ) {}

  async command(gameName: string, serverName: string, command: string) {
    {
      // 503 : Busy/Server Unavailable
      // 500 : Server Error
      // 400 : Bad Argument
      // 200 : Success

      const folderName: string | undefined = this.config.getFolderOf(gameName);
      if (folderName && serverName && command) {
        const query = {
          game: folderName,
          server: serverName as string,
          command: command as string,
        };
        if (this.query.isQueryingOrCommanding) {
          throw new HttpException('Busy', HttpStatus.SERVICE_UNAVAILABLE);
        } else {
          this.query.isQueryingOrCommanding = true;
          try {
            let is_online: boolean;
            switch (command) {
              case 'stop':
                console.log(
                  `Command: Running ${command} for game "${gameName}", server ${serverName}`,
                );
                await this.query.sendServerCommand(query);
                is_online = false;
                break;
              case 'start':
              case 'restart':
                console.log(
                  `Command: Running ${command} for game "${gameName}", server ${serverName}`,
                );
                await this.query.sendServerCommand(query);
                is_online = true;
                break;
              default:
                this.query.isQueryingOrCommanding = false;
                throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
            }
            const temp = this.gameData.data.getValue();
            temp[gameName][serverName].is_online = is_online;
            this.gameData.data.next(temp);
            return;
          } catch (err) {
            console.log(err);
            throw new HttpException(err, 500);
          } finally {
            this.query.isQueryingOrCommanding = false;
          }
        }
      } else {
        throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
      }
    }
  }
}
