import { Server, IncomingMessage } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidV4 } from 'uuid';

/** WebSocket 連線物件 */
export interface IWebSocketConnect extends WebSocket {
    uuid: string,
    id: number,
    account: string,
    name: string,
    role: string,
    realIp: string,
}

export enum EWebSocketCloseReason {
    C4000 = 'The product has not been authorized.',
    C4001 = 'Authentication error.',
}

class WebSocketLibrary {
    /** 伺服器物件 */
    public server: WebSocketServer | undefined = undefined;

    /** 關閉原因二維陣列 */
    private readonly webSocketCloseReason: string[][];

    constructor() {
        this.webSocketCloseReason = Object.entries(EWebSocketCloseReason);
    }

    /** 找尋關閉原因代碼 */
    private findCloseReasonNumber(closeReason: EWebSocketCloseReason): number {
        let closeReasonNumber: number = 4000;

        this.webSocketCloseReason.forEach((element) => {
            if (element.length === 2) {
                const key = element[0];
                const value = element[1];

                if (value === closeReason) {
                    // NOTE: 去除首字C後轉數值
                    closeReasonNumber = Number(key.replace('C', ''));
                }
            }
        });

        return closeReasonNumber;
    }

    /** 初始化 webSocket 伺服器 */
    public init(server: Server): void {
        if (this.server === undefined) {
            this.server = new WebSocketServer({ server })
        }
    }

    /** 初始化 webSocket 自定義連線資訊 */
    public initConnectInfo(webSocket: IWebSocketConnect, request: IncomingMessage): void {
        if (this.server) {
            (webSocket as IWebSocketConnect).uuid = uuidV4();
            (webSocket as IWebSocketConnect).id = NaN;
            (webSocket as IWebSocketConnect).account = '';
            (webSocket as IWebSocketConnect).name = '';
            (webSocket as IWebSocketConnect).role = '';
            (webSocket as IWebSocketConnect).realIp = request.headers['x-real-ip'] as string ? request.headers['x-real-ip'] as string : '::1';
        }
    }

    /** 廣播訊息給全部用戶端 */
    public sendToAllClient(messageObject: object = {}) {
        if (this.server) {
            const message = JSON.stringify(messageObject);
            this.server.clients.forEach(async (webSocket: WebSocket) => {
                (webSocket as IWebSocketConnect).send(message);
            });
        }
    }

    /** 發送訊息給指定帳號編號 */
    public sendToClientByIds(messageObject: object = {}, idArray: number[] = []) {
        if (this.server) {
            const message = JSON.stringify(messageObject);
            this.server.clients.forEach(async (webSocket: WebSocket) => {
                if (idArray.includes((webSocket as IWebSocketConnect).id)) {
                    (webSocket as IWebSocketConnect).send(message);
                }
            });
        }
    }

    /** 發送訊息給指定角色權限 */
    public sendToClientByRoles(messageObject: object = {}, roleArray: string[] = []) {
        if (this.server) {
            const message = JSON.stringify(messageObject);
            this.server.clients.forEach(async (webSocket: WebSocket) => {
                if (roleArray.includes((webSocket as IWebSocketConnect).role)) {
                    (webSocket as IWebSocketConnect).send(message);
                }
            });
        }
    }

    /** 發送訊息給指定角色帳號 */
    public sendToClientByAccounts(messageObject: object = {}, accountArray: string[] = []) {
        if (this.server) {
            const message = JSON.stringify(messageObject);

            this.server.clients.forEach(async (webSocket: WebSocket) => {
                if (accountArray.includes((webSocket as IWebSocketConnect).account)) {
                    (webSocket as IWebSocketConnect).send(message);
                }
            });
        }
    }

    /** 發送訊息給指定uuid */
    public sendToClientByUuids(messageObject: object = {}, uuidArray: string[] = []) {
        if (this.server) {
            const message = JSON.stringify(messageObject);
            this.server.clients.forEach(async (webSocket: WebSocket) => {
                if (uuidArray.includes((webSocket as IWebSocketConnect).uuid)) {
                    (webSocket as IWebSocketConnect).send(message);
                }
            });
        }
    }

    /** 關閉指定帳號連線 */
    // eslint-disable-next-line max-len
    public closeClientByAccounts(accountArray: string[] = [], reason: EWebSocketCloseReason = EWebSocketCloseReason.C4000) {
        if (this.server) {
            this.server.clients.forEach(async (webSocket: WebSocket) => {
                if (accountArray.includes((webSocket as IWebSocketConnect).account)) {
                    (webSocket as IWebSocketConnect).close(this.findCloseReasonNumber(reason), reason);
                    (webSocket as IWebSocketConnect).terminate();
                }
            });
        }
    }

    /** 關閉指定帳號編號連線 */
    public closeClientByIds(idArray: number[] = [], reason: EWebSocketCloseReason = EWebSocketCloseReason.C4000) {
        if (this.server) {
            this.server.clients.forEach(async (webSocket: WebSocket) => {
                if (idArray.includes((webSocket as IWebSocketConnect).id)) {
                    (webSocket as IWebSocketConnect).close(this.findCloseReasonNumber(reason), reason);
                    (webSocket as IWebSocketConnect).terminate();
                }
            });
        }
    }
}

const webSocket = new WebSocketLibrary();

export default webSocket;
