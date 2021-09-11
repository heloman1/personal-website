import { Injectable } from '@nestjs/common';
import fs from 'fs';
type FolderName = string;
type GameName = string;

@Injectable()
export class ConfigService {
  constructor() {
    console.log(`__dirname is here: ${__dirname}`);

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
    } = JSON.parse(fs.readFileSync(__dirname).toString());

    if (!data.sshHost) throw 'sshHost missing';
    this.sshHost = data.sshHost;

    if (!data.googleCredentials) throw 'googleCredentials missing';
    this.googleCredLoc = data.googleCredentials;

    if (!data.gameNamesToFolders) throw 'gameNamesToFolders missing';
    const gameNamesToFolders = data.gameNamesToFolders;

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
      if (reverse[v] !== undefined) throw `${v} is not unique`;
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

  readonly sshHost: string;
  readonly googleCredLoc: string;

  getFolderOf(gameName: string) {
    return this.gameToFolders[gameName];
  }
  getGameOf(folderName: string) {
    return this.foldersToGame[folderName];
  }
}
