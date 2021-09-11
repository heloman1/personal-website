import { Injectable } from '@nestjs/common';
import fs from 'fs';
type FolderName = string;
type GameName = string;

@Injectable()
export class ConfigService {
  constructor() {
    // TODO: I don't currently check for uniqueness in the values
    console.log(`__dirname is here: ${__dirname}`);

    const data: {
      [gameName: string]: FolderName;
    } = JSON.parse(fs.readFileSync(__dirname).toString());
    if (typeof data !== 'object' || Array.isArray(data)) {
      throw 'Expected an object ({}) in config file';
    }
    for (const v of Object.values(data)) {
      if (typeof v !== 'string') {
        throw `${v} is not a string`;
      }
    }
    this.gameToFolders = data;
    const reverse = {};

    for (const entry of Object.entries(data)) {
      reverse[entry[1]] = entry[0];
    }
    this.foldersToGame = reverse;

    throw 'Implement sshHost';
    throw 'Implement Google Default Credentials';
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

  private _sshHost: string;
  get sshHost() {
    return this._sshHost;
  }

  getFolderOf(gameName: string) {
    return this.gameToFolders[gameName];
  }
  getGameOf(folderName: string) {
    return this.foldersToGame[folderName];
  }
}
