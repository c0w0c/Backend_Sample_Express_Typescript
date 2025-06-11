import { WebSocketServer } from 'ws';
import { v4 as uuidV4 } from 'uuid';
export var EWebSocketCloseReason;
(function (EWebSocketCloseReason) {
    EWebSocketCloseReason["C4000"] = "The product has not been authorized.";
    EWebSocketCloseReason["C4001"] = "Authentication error.";
})(EWebSocketCloseReason || (EWebSocketCloseReason = {}));
class WebSocketLibrary {
    server = undefined;
    webSocketCloseReason;
    constructor() {
        this.webSocketCloseReason = Object.entries(EWebSocketCloseReason);
    }
    findCloseReasonNumber(closeReason) {
        let closeReasonNumber = 4000;
        this.webSocketCloseReason.forEach((element) => {
            if (element.length === 2) {
                const key = element[0];
                const value = element[1];
                if (value === closeReason) {
                    closeReasonNumber = Number(key.replace('C', ''));
                }
            }
        });
        return closeReasonNumber;
    }
    init(server) {
        if (this.server === undefined) {
            this.server = new WebSocketServer({ server });
        }
    }
    initConnectInfo(webSocket, request) {
        if (this.server) {
            webSocket.uuid = uuidV4();
            webSocket.id = NaN;
            webSocket.account = '';
            webSocket.name = '';
            webSocket.role = '';
            webSocket.realIp = request.headers['x-real-ip'] ? request.headers['x-real-ip'] : '::1';
        }
    }
    sendToAllClient(messageObject = {}) {
        if (this.server) {
            const message = JSON.stringify(messageObject);
            this.server.clients.forEach(async (webSocket) => {
                webSocket.send(message);
            });
        }
    }
    sendToClientByIds(messageObject = {}, idArray = []) {
        if (this.server) {
            const message = JSON.stringify(messageObject);
            this.server.clients.forEach(async (webSocket) => {
                if (idArray.includes(webSocket.id)) {
                    webSocket.send(message);
                }
            });
        }
    }
    sendToClientByRoles(messageObject = {}, roleArray = []) {
        if (this.server) {
            const message = JSON.stringify(messageObject);
            this.server.clients.forEach(async (webSocket) => {
                if (roleArray.includes(webSocket.role)) {
                    webSocket.send(message);
                }
            });
        }
    }
    sendToClientByAccounts(messageObject = {}, accountArray = []) {
        if (this.server) {
            const message = JSON.stringify(messageObject);
            this.server.clients.forEach(async (webSocket) => {
                if (accountArray.includes(webSocket.account)) {
                    webSocket.send(message);
                }
            });
        }
    }
    sendToClientByUuids(messageObject = {}, uuidArray = []) {
        if (this.server) {
            const message = JSON.stringify(messageObject);
            this.server.clients.forEach(async (webSocket) => {
                if (uuidArray.includes(webSocket.uuid)) {
                    webSocket.send(message);
                }
            });
        }
    }
    closeClientByAccounts(accountArray = [], reason = EWebSocketCloseReason.C4000) {
        if (this.server) {
            this.server.clients.forEach(async (webSocket) => {
                if (accountArray.includes(webSocket.account)) {
                    webSocket.close(this.findCloseReasonNumber(reason), reason);
                    webSocket.terminate();
                }
            });
        }
    }
    closeClientByIds(idArray = [], reason = EWebSocketCloseReason.C4000) {
        if (this.server) {
            this.server.clients.forEach(async (webSocket) => {
                if (idArray.includes(webSocket.id)) {
                    webSocket.close(this.findCloseReasonNumber(reason), reason);
                    webSocket.terminate();
                }
            });
        }
    }
}
const webSocket = new WebSocketLibrary();
export default webSocket;
