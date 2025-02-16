import { Logger } from '@nestjs/common';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(EventsGateway.name);
    private readonly connectedClients = new Map<string, string>();

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
        const userId = this.connectedClients.get(client.id);
        if (userId) {
            this.connectedClients.delete(client.id);
        }
    }

    @SubscribeMessage('register')
    handleRegister(client: Socket, userId: string) {
        this.connectedClients.set(client.id, userId);
        client.join(userId);
        this.logger.log(`User ${userId} registered to socket ${client.id}`);
    }
}