import { Injectable } from '@nestjs/common';
import { OutgoingServerStatuses } from 'src/types';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { GameQueryService } from './game-query.service';
import { ConfigService } from 'src/config/config.service';

const FIVE_MIN = 5 * 60 * 1000;
let lastCheck = new Date(0).getTime();

@Injectable()
/**
 * Handles the Server Data
 */
export class GameDataService {
  constructor(
    private readonly query: GameQueryService,
    private readonly config: ConfigService,
  ) {}
  private get isDataFresh() {
    // If its been 5 minutes, the data is no longer fresh
    // (the exact time is arbtrary)
    return new Date().getTime() - lastCheck <= FIVE_MIN;
  }
  data = new BehaviorSubject<OutgoingServerStatuses>({});

  async getServersStatus(): Promise<OutgoingServerStatuses> {
    if (this.isDataFresh) {
      return this.data.getValue();
    } else if (this.query.isQueryingOrCommanding) {
      // Wait for the querier to emit new data
      return await firstValueFrom(this.data);
    } else {
      this.query.isQueryingOrCommanding = true;
      // Grab the data, emit the data, mark the data as fresh
      const out = await this.query.fetchData(this.config.folderList);
      this.data.next(out);
      lastCheck = Date.now();
      this.query.isQueryingOrCommanding = false;
      return out;
    }
  }
}
