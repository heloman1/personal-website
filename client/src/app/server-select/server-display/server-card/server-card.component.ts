import { Output, EventEmitter, Component, Input } from '@angular/core';
import { QueryParams } from '../../types';
import { CardData } from '../../types';
@Component({
    selector: 'app-server-card',
    templateUrl: './server-card.component.html',
    styleUrls: ['./server-card.component.scss'],
})
export class ServerCardComponent {
    @Output() buttonPressed = new EventEmitter<QueryParams>();
    @Input() game = 'unset';
    @Input() data: CardData = {
        name: 'unset',
        is_online: false,
        port: -1,
        canToggle: false,
    };
    @Input() disable = true;

    submit() {
        this.buttonPressed.emit({
            game: this.game,
            server: this.data.name,
            command: this.data.is_online ? 'stop' : 'start',
        });
    }
}
