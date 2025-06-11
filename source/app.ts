import { AddressInfo } from 'node:net';
import { createServer, Server as HttpServer, IncomingMessage } from 'node:http'
import { RawData } from 'ws';
import { logInfo, logError } from './library/log.library.js';
import httpLibrary from './library/http.library.js';
import webSocketLibrary, { IWebSocketConnect } from './library/websocket.library.js';
import { SERVER_PORT, PROJECT_NAME } from './constants.js';

const server: HttpServer = createServer(httpLibrary.server);

/** 啟動伺服器 */
const startHttpAndWebsocketServer = (): Promise<string> => new Promise((resolve, reject) => {
    let isHttpCreateSuccess: boolean = false;
    let isWspCreateSuccess: boolean = false;
    let startStatusCheckCount: number = 0;

    server.listen(SERVER_PORT);

    server.on('error', (error: Error) => {
        logError('http 服務啟動失敗');
        return reject(error);
    });

    server.on('listening', () => {
        logInfo('http 服務啟動成功');
        isHttpCreateSuccess = true;
    });

    webSocketLibrary.init(server);

    if (webSocketLibrary.server) {
        webSocketLibrary.server.on('error', (error: Error) => {
            logError('websocket 服務啟動失敗');
            return reject(error);
        });

        webSocketLibrary.server.on('listening', () => {
            isWspCreateSuccess = true;
            logInfo('websocket 服務啟動成功');
        });

        webSocketLibrary.server.on('connection', (webSocket: IWebSocketConnect, request: IncomingMessage): void => {
            webSocketLibrary.initConnectInfo(webSocket, request);

            webSocket.send('歡迎連線');

            webSocket.on('message', (message: RawData): void => {
                logInfo('uuid:', webSocket.uuid, '收到訊息:', message.toString());
            });

            webSocket.on('close', (): void => {
                logInfo('uuid:', webSocket.uuid, '斷開 webSocket 連線');
                webSocket.terminate();
            });
        });
    }

    // NOTE: 五百毫秒檢查一次伺服器啟動狀態
    const checkInterval = setInterval(() => {
        if (startStatusCheckCount === 6) {
            // NOTE: 第六次檢查後，還是沒啟動好，返回伺服器啟動逾時
            reject(Error('伺服器啟動逾時'));
            logInfo('isHttpCreateSuccess:', isHttpCreateSuccess, 'isWspCreateSuccess:', isWspCreateSuccess);
            clearInterval(checkInterval);
            return;
        }

        if (isHttpCreateSuccess && isWspCreateSuccess) {
            resolve('done');
            clearInterval(checkInterval);
            return;
        }

        startStatusCheckCount += 1;
    }, 500);
});

/** 主要啟動流程 */
const main = async (): Promise<void> => {
    try {
        await startHttpAndWebsocketServer();
    } catch (error) {
        logError('服務啟動失敗, error:', error as Error);
        process.exit(0);
    }

    const usePort = server.address() as AddressInfo ? (server.address() as AddressInfo).port : NaN;
    logInfo(PROJECT_NAME, '服務啟動成功, port:', usePort, ', 環境:', process.env.NODE_ENV);
};

main();

export default httpLibrary.server;
