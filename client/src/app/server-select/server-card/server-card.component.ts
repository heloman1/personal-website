import { HttpClient } from '@angular/common/http';
import { Output, EventEmitter, Component, Input, OnInit } from '@angular/core';
import { ServerData } from '../server-select.component';

@Component({
  selector: 'app-server-card',
  templateUrl: './server-card.component.html',
  styleUrls: ['./server-card.component.scss'],
})
export class ServerCardComponent implements OnInit {
  @Output() buttonPressed = new EventEmitter<number>();
  @Input() id = -1;
  @Input() data: ServerData = {
    server: 'unset',
    game: 'unset',
    is_online: false,
    queryDone: false,
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {}

  toggleButton() {}
  submit() {
    this.buttonPressed.emit(this.id);
    //this.data.queryDone = false;
  }
}
