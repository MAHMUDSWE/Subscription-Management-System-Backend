import { WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway()
export class EventsGateway {
    handleConnection(client: any) {
        console.log('Client connected:', client.id);
    }
}
