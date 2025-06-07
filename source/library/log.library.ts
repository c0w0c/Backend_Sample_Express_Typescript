import { basename } from 'path';
import util from 'util';
import debug from 'debug';

/** 設定表示式對應方法 */
debug.formatters.j = (objectLog: object) => util.inspect(objectLog, false, null, true);
debug.formatters.d = (numberLog: number) => util.inspect(numberLog, false, null, true);
debug.formatters.b = (booleanLog: boolean) => util.inspect(booleanLog, false, null, true);
debug.formatters.n = (nullLog: null) => util.inspect(nullLog, false, null, true);
debug.formatters.u = (undefinedLog: undefined) => util.inspect(undefinedLog, false, null, true);

/** 通用正則式 */
const regExp: RegExp = /:(\d+):(\d+)\)/;

/** 日誌項目型別 */
type LogItem = string | number | boolean | null | undefined | object;

/** 格式表示字串組成 */
const formatComposition = (...items: LogItem[]): string => {
    let newFormatString: string = '';

    items.forEach((item: LogItem) => {
        if (typeof item === 'object') {
            newFormatString += '%j ';
        } else if (typeof item === 'number') {
            newFormatString += '%d ';
        } else if (typeof item === 'boolean') {
            newFormatString += '%b ';
        } else if (typeof item === 'undefined') {
            newFormatString += '%u ';
        } else if (item === null) {
            newFormatString += '%n ';
        } else {
            newFormatString += '%s ';
        }
    });

    return newFormatString;
};

/** 資訊日誌 */
const logInfo = (...items: LogItem[]): void => {
    const infoFlag: Error = new Error();
    const infoFileName: string = typeof infoFlag.stack === 'string' ? basename(infoFlag.stack.split('\n')[2].replace(regExp, '').replace(/\?/, '')) : 'undefined';
    const log = debug(`info:${infoFileName} -`);
    log.log = console.log.bind(console);
    log(formatComposition(...items), ...items);
};

/** 錯誤日誌 */
const logError = (...items: LogItem[]): void => {
    const errorFlag: Error = new Error();
    const errorFileName: string = typeof errorFlag.stack === 'string' ? basename(errorFlag.stack.split('\n')[2].replace(regExp, '').replace(/\?/, '')) : 'undefined';
    const error = debug(`error:${errorFileName} -`);
    error(formatComposition(...items), ...items);
};

export default logInfo;
export { logInfo, logError };
