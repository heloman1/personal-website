import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/firebase.service';

@Component({
  selector: 'app-server-select',
  templateUrl: './server-select.component.html',
  styleUrls: ['./server-select.component.scss'],
})
export class ServerSelectComponent implements OnInit {
  constructor(private firebase_service: LoginService) {}

  ngOnInit(): void {
    this.firebase_service.tryCompleteSignIn().then(async () => {
      let test = await this.firebase_service.firebase_auth.currentUser?.getIdToken();
      
    });
  }
}
// ./mcserver details | sed 's/\x1b\[[0-9;]*m//g'
// /Server name.*\n\n/gms
