import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/firebase.service';

export interface ServerData {
  game: string;
  server: string;
  is_online: boolean;
  queryDone: boolean;
}

@Component({
  selector: 'app-server-select',
  templateUrl: './server-select.component.html',
  styleUrls: ['./server-select.component.scss'],
})
export class ServerSelectComponent implements OnInit {
  constructor(
    private firebase_service: LoginService,
    private http: HttpClient
  ) {}
  serverData: ServerData[] = [];

  async toggleServer(server_index: number) {
    //this.serverData[server_index].queryDone = false;
    //this.serverData[server_index].queryDone = true;
    this.serverData[server_index].queryDone = false;

    //pretend to do things
    setTimeout(() => {
      this.serverData[server_index].queryDone = true;
      this.serverData[server_index].is_online = !this.serverData[server_index]
        .is_online;
    }, 1000);
  }

  ngOnInit(): void {
    this.firebase_service.tryCompleteSignIn().then(async () => {
      let test = await this.firebase_service.firebase_auth.currentUser?.getIdToken();
    });
    this.http.get('/backend/servers-status').subscribe({
      next: (data) => {
        for (let d of data as any[]) {
          d.queryDone = true;
        }

        this.serverData = data as ServerData[];
        this.serverData.sort((a, b) => {
          const c1 = a.game.localeCompare(b.game);
          if (c1 == 0) {
            return a.server.localeCompare(b.server);
          }
          return c1;
        });
        console.log(this.serverData);
      },
    });
  }
}
// ./mcserver details | sed 's/\x1b\[[0-9;]*m//g'
// /Server name.*\n\n/gms
