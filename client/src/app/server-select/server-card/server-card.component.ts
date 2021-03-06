import { HttpClient } from '@angular/common/http';
import { Output, EventEmitter, Component, Input, OnInit } from '@angular/core';
import { ServerDataValue } from '../server-select.component';

@Component({
    selector: 'app-server-card',
    templateUrl: './server-card.component.html',
    styleUrls: ['./server-card.component.scss'],
})
export class ServerCardComponent implements OnInit {
    @Output() buttonPressed = new EventEmitter<{
        game: string;
        server: string;
    }>();
    @Input() game = 'unset';
    @Input() server = 'unset';
    @Input() data: ServerDataValue = {
        is_online: false,
        queryDone: false,
    };

    constructor(private http: HttpClient) {}

    ngOnInit(): void {}

    toggleButton() {}
    submit() {
        this.buttonPressed.emit({ game: this.game, server: this.server });
        //this.data.queryDone = false;
    }
}
