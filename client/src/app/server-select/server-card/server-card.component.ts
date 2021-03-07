import { Output, EventEmitter, Component, Input } from '@angular/core';
import { QueryParams, ServerDataValue } from '../server-select.component';

@Component({
    selector: 'app-server-card',
    templateUrl: './server-card.component.html',
    styleUrls: ['./server-card.component.scss'],
})
export class ServerCardComponent {
    @Output() buttonPressed = new EventEmitter<QueryParams>();
    @Input() game = 'unset';
    @Input() server = 'unset';
    @Input() data: ServerDataValue = {
        is_online: false,
        port: -1,
        queryDone: false,
    };

    constructor() {}

    submit() {
        this.buttonPressed.emit({
            game: this.game,
            server: this.server,
            command: this.data.is_online ? 'stop' : 'start',
        });
        //this.data.queryDone = false;
    }
}
