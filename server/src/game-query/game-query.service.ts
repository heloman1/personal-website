import { Injectable } from '@nestjs/common';
import child_process from 'child_process';
import { JsonConfigService } from 'src/json-config/json-config.service';
import { ExpectedJSONData, OutgoingServerStatuses } from 'src/types';
import { promisify } from 'util';

@Injectable()
/**
 * Does the actual data fetching and command sending
 */
export class GameQueryService {
  private static shell = promisify(child_process.exec);

  private get sshHost() {
    return this.config.sshHost;
  }

  constructor(private readonly config: JsonConfigService) {}

  isQueryingOrCommanding = false;

  async sendServerCommand(query: {
    game: string;
    server: string;
    command: string;
  }) {
    return GameQueryService.shell(
      `ssh gameserver@edward-server ./${query.game}/${query.server}/*server ${query.command}`,
    );
  }

  // The actual query
  private async queryData(gameList: string[]): Promise<ExpectedJSONData[]> {
    let serverData: ExpectedJSONData[];
    let shell_output: string;
    try {
      shell_output = (
        await GameQueryService.shell(
          `ssh ${this.sshHost} "./check_server_statuses.zsh '${JSON.stringify(
            gameList,
          )}'"`,
        )
      ).stdout;
    } catch (err) {
      console.error('fetchData: Error when executing shell command');
      console.error(err);
      throw err;
    }

    try {
      serverData = shell_output
        .trim()
        .split('\n')
        .map((val) => JSON.parse(val));
    } catch (err) {
      console.error('fetchData: error when parsing JSON');
      console.error(err);
    }

    serverData.sort((a, b) => (a.server < b.server ? -1 : 1));
    return serverData;
  }

  // Qeury formatting
  private formatData(jsonList: ExpectedJSONData[]): OutgoingServerStatuses {
    const serverStatuses: OutgoingServerStatuses = {};

    jsonList.map((val) => {
      const expectedGameName = this.config.getGameOf(val.gameFolderName);
      const gameName =
        expectedGameName === undefined ? 'Unknown' : expectedGameName;

      const serverName = val.server === undefined ? 'Unknown' : val.server;

      const [, , ip_port_s, , status_s] = val.details_string.trim().split(' ');

      const expectedPort = Number.parseInt(ip_port_s.split(':')[1]);
      const port = !expectedPort ? -1 : expectedPort; // Check if NaN

      const is_online = status_s === 'STARTED';

      if (serverStatuses[gameName] === undefined) {
        serverStatuses[gameName] = {};
      }

      serverStatuses[gameName][serverName] = {
        is_online: is_online,
        port: port,
      };
    });

    return serverStatuses;
  }

  async fetchData(gameList: string[]) {
    return this.formatData(await this.queryData(gameList));
  }
}
