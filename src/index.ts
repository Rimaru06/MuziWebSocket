import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';
import axios from 'axios';

const server = http.createServer((req, res) => {
    console.log(new Date() + ' Received request for ' + req.url);
    res.end();
});

const wss = new WebSocketServer({ server });

interface Message {
    type: string;
    room?: string;
    userId?: string;
    url? : string;
    streamId? : string;
    [key: string]: any;
}

const otherServerBaseUrl = 'http://localhost:3000/api';

wss.on('connection', (ws: WebSocket) => {
    ws.on("error", console.error);

    ws.on("message", async (message: string) => {
        console.log("Received: " + message);
        const msg: Message = JSON.parse(message);

        try {
            switch (msg.type) {
                case "CreateRoom":
                    if (msg.room) {
                      const response =   await axios.post(`${otherServerBaseUrl}/sockets/create-room`, { room: msg.room  , userId: msg.userId });
                        console.log(`Room ${msg.room} created`);
                        ws.send(JSON.stringify(response.data));
                    }
                    break;
                case "JoinRoom":
                    if (msg.room) {
                       const response =  await axios.post(`${otherServerBaseUrl}/sockets/join-room`, { roomId: msg.room , userId: msg.userId });
                        console.log(`Joined room ${msg.room}`);
                        ws.send(JSON.stringify(response.data))
                    }
                    break;
                case "LeaveRoom":
                    if (msg.room) {
                       const response =  await axios.post(`${otherServerBaseUrl}/sockets/leave-room`, { roomId: msg.room, userId: msg.userId });
                        console.log(`Left room ${msg.room}`);
                        ws.send(JSON.stringify(response.data));
                    }
                    break;``
                case "addStream" :
                    if(msg.room) {
                        const stream = await axios.post(`${otherServerBaseUrl}/streams`, {
                            creatorId: msg.userId,
                            url: msg.url,
                            spaceId: msg.room
                          });
                        ws.send(JSON.stringify(stream.data));
                    }
                    break;
                case "getStreams" :
                    if(msg.room) {
                        const streams = await axios.get(`${otherServerBaseUrl}/streams/?spaceId=${msg.room}`);
                        ws.send(JSON.stringify(streams.data));
                    }
                    break;
                case "removeStream" :
                    if(msg.room) {
                        const stream = await axios.delete(`${otherServerBaseUrl}/streams/?streamId=${msg.streamId}`);
                        ws.send(JSON.stringify(stream.data));
                    }
                    break;
                default:
                    console.log("Unknown message type"); 
            }
        } catch (error: any) {
            console.error(`Error handling ${msg.type}:`, error);
            ws.send(JSON.stringify({ error: error.message }));
        }
    });

    ws.on("close", () => {
        console.log("Connection closed");
    });
});

server.listen(8080, () => {
    console.log('Listening on http://localhost:8080');
});