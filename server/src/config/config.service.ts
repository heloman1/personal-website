import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
type FolderName = string;
type GameName = string;

@Injectable()
export class ConfigService {
  constructor() {
    // {
    //   "sshHost": "username@example",
    //   "googleCredentials": "config/creds/firebase.json",
    //   "gameNamesToFolders": {
    //     "Example": "example123"
    //   }
    // }
    const data: {
      sshHost?: string;
      googleCredentials?: string;
      gameNamesToFolders?: {
        [gameName: string]: FolderName;
      };
      emails?: string[];
    } = JSON.parse(
      readFileSync(
        join(__dirname, '../..', 'config', 'config.json'),
      ).toString(),
    );

    if (!data.sshHost) throw 'sshHost missing';
    this.sshHost = data.sshHost;

    if (!data.googleCredentials) throw 'googleCredentials missing';
    this.googleCredLoc = data.googleCredentials;

    if (!data.gameNamesToFolders) throw 'gameNamesToFolders missing';
    const gameNamesToFolders = data.gameNamesToFolders;

    if (!data.emails) throw 'emails missing';
    this.emails = {};
    for (const email of data.emails) {
      this.emails[email] = true;
    }

    if (
      typeof gameNamesToFolders !== 'object' ||
      Array.isArray(gameNamesToFolders)
    ) {
      throw 'gameGamesToFolders should be an object';
    }

    // Check if all values are strings
    for (const v of Object.values(gameNamesToFolders)) {
      if (typeof v !== 'string') {
        throw `${v} is not a string`;
      }
    }

    this.gameToFolders = data.gameNamesToFolders;

    const reverse = {};
    for (const [k, v] of Object.entries(gameNamesToFolders)) {
      if (reverse[v] !== undefined)
        throw `All values must be unique, ${v} is not`;
      reverse[v] = k;
    }
    this.foldersToGame = reverse;
  }
  private foldersToGame: {
    [gameName: FolderName]: GameName;
  };
  private gameToFolders: {
    [gameName: GameName]: FolderName;
  };

  get gameList() {
    return Object.keys(this.gameToFolders);
  }

  get folderList() {
    return Object.keys(this.foldersToGame);
  }

  public readonly emails: { [email: string]: any };
  public readonly sshHost: string;
  public readonly googleCredLoc: string;

  getFolderOf(gameName: string) {
    return this.gameToFolders[gameName];
  }
  getGameOf(folderName: string) {
    return this.foldersToGame[folderName];
  }
}
