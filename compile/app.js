import { createServer } from 'node:http';
import { logInfo, logError } from './library/log.library.js';
import httpLibrary from './library/http.library.js';
import webSocketLibrary from './library/websocket.library.js';
import { SERVER_PORT, PROJECT_NAME } from './constants.js';
const server = createServer(httpLibrary.server);
const startHttpAndWebsocketServer = () => new Promise((resolve, reject) => {
    let isHttpCreateSuccess = false;
    let isWspCreateSuccess = false;
    let startStatusCheckCount = 0;
    server.listen(SERVER_PORT);
    server.on('error', (error) => {
        logError('http 服務啟動失敗');
        return reject(error);
    });
    server.on('listening', () => {
        logInfo('http 服務啟動成功');
        isHttpCreateSuccess = true;
    });
    webSocketLibrary.init(server);
    if (webSocketLibrary.server) {
        webSocketLibrary.server.on('error', (error) => {
            logError('websocket 服務啟動失敗');
            return reject(error);
        });
        webSocketLibrary.server.on('listening', () => {
            isWspCreateSuccess = true;
            logInfo('websocket 服務啟動成功');
        });
        webSocketLibrary.server.on('connection', (webSocket, request) => {
            webSocketLibrary.initConnectInfo(webSocket, request);
            webSocket.send('歡迎連線');
            webSocket.on('message', (message) => {
                logInfo('uuid:', webSocket.uuid, '收到訊息:', message.toString());
            });
            webSocket.on('close', () => {
                logInfo('uuid:', webSocket.uuid, '斷開 webSocket 連線');
                webSocket.terminate();
            });
        });
    }
    const checkInterval = setInterval(() => {
        if (startStatusCheckCount === 6) {
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
const main = async () => {
    try {
        await startHttpAndWebsocketServer();
    }
    catch (error) {
        logError('服務啟動失敗, error:', error);
        process.exit(0);
    }
    const usePort = server.address() ? server.address().port : NaN;
    logInfo(PROJECT_NAME, '服務啟動成功, port:', usePort, ', 環境:', process.env.NODE_ENV);
};
main();
export default httpLibrary.server;
