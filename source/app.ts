import { AddressInfo } from 'node:net';
import { createServer, Server as HttpServer } from 'node:http';
import { logInfo, logError } from './library/log.library.js';
import httpLibrary from './library/http.library.js';
import { SERVER_PORT, PROJECT_NAME } from './constants.js';

const server: HttpServer = createServer(httpLibrary.server);

/** 啟動伺服器 */
const startHttpAndWebsocketServer = (): Promise<string> => new Promise((resolve, reject) => {
    let isHttpCreateSuccess: boolean = false;
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

    // NOTE: 五百毫秒檢查一次伺服器啟動狀態
    const checkInterval = setInterval(() => {
        if (startStatusCheckCount === 6) {
            // NOTE: 第六次檢查後，還是沒啟動好，返回伺服器啟動逾時
            reject(Error('伺服器啟動逾時'));
            logInfo('isHttpCreateSuccess:', isHttpCreateSuccess);
            clearInterval(checkInterval);
            return;
        }

        if (isHttpCreateSuccess) {
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
