import { Injectable } from '@nestjs/common';
import { OutgoingServerStatuses, ExpectedJSONData } from 'src/types';
import child_process from 'child_process';
import { promisify } from 'util';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { JsonConfigService } from 'src/json-config/json-config.service';

const FIVE_MIN = 5 * 60 * 1000;
let lastCheck = new Date(0).getTime();
let currentlyQuerying = false;

@Injectable()
export class GameQueryService {
  private sshHost: string;
  constructor(config: JsonConfigService) {
    if (!config.sshHost) {
      throw 'Please specify sshHost in the config file';
    }
    this.query = new Query(config);
  }
  private get isDataFresh() {
    // If its been 5 minutes, the data is no longer fresh
    // (the exact time is arbtrary)
    return new Date().getTime() - lastCheck <= FIVE_MIN;
  }
  private data = new BehaviorSubject<OutgoingServerStatuses>({});
  private query: Query;
  async getServersStatus(): Promise<OutgoingServerStatuses> {
    if (this.isDataFresh) {
      return this.data.getValue();
    } else if (currentlyQuerying) {
      // Wait for the querier to emit new data
      return await firstValueFrom(this.data);
    } else {
      currentlyQuerying = true;
      // Grab the data, emit the data, mark the data as freshs
      const out = await this.query.fetchData(['yup']);
      this.data.next(out);
      lastCheck = Date.now();
      currentlyQuerying = false;
      return out;
    }
  }
}

class Query {
  private static shell = promisify(child_process.exec);
  private config: JsonConfigService;
  private get sshHost() {
    return this.config.sshHost;
  }

  constructor(config: JsonConfigService) {
    this.config = config;
  }
  // The actual query
  private async queryData(gameList: string[]): Promise<ExpectedJSONData[]> {
    let serverData: ExpectedJSONData[];
    let shell_output: string;
    try {
      shell_output = (
        await Query.shell(
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
