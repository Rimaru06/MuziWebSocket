"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const http_1 = __importDefault(require("http"));
const axios_1 = __importDefault(require("axios"));
const server = http_1.default.createServer((req, res) => {
    console.log(new Date() + ' Received request for ' + req.url);
    res.end();
});
const wss = new ws_1.WebSocketServer({ server });
const otherServerBaseUrl = 'http://localhost:3000/api';
wss.on('connection', (ws) => {
    ws.on("error", console.error);
    ws.on("message", (message) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Received: " + message);
        const msg = JSON.parse(message);
        try {
            switch (msg.type) {
                case "CreateRoom":
                    if (msg.room) {
                        const response = yield axios_1.default.post(`${otherServerBaseUrl}/sockets/create-room`, { room: msg.room, userId: msg.userId });
                        console.log(`Room ${msg.room} created`);
                        ws.send(JSON.stringify(response.data));
                    }
                    break;
                case "JoinRoom":
                    if (msg.room) {
                        const response = yield axios_1.default.post(`${otherServerBaseUrl}/sockets/join-room`, { roomId: msg.room, userId: msg.userId });
                        console.log(`Joined room ${msg.room}`);
                        ws.send(JSON.stringify(response.data));
                    }
                    break;
                case "LeaveRoom":
                    if (msg.room) {
                        const response = yield axios_1.default.post(`${otherServerBaseUrl}/sockets/leave-room`, { roomId: msg.room, userId: msg.userId });
                        console.log(`Left room ${msg.room}`);
                        ws.send(JSON.stringify(response.data));
                    }
                    break;
                case "addStream":
                    if (msg.room) {
                        const stream = yield axios_1.default.post(`http://localhost:3000/api/streams`, {
                            creatorId: msg.userId,
                            url: msg.url,
                            spaceId: msg.room
                        });
                        ws.send(JSON.stringify(stream.data));
                    }
                default:
                    console.log("Unknown message type");
            }
        }
        catch (error) {
            console.error(`Error handling ${msg.type}:`, error);
            ws.send(JSON.stringify({ error: error.message }));
        }
    }));
    ws.on("close", () => {
        console.log("Connection closed");
    });
});
server.listen(8080, () => {
    console.log('Listening on http://localhost:8080');
});
