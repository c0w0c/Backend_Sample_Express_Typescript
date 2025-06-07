import { basename } from 'path';
import util from 'util';
import debug from 'debug';
debug.formatters.j = (objectLog) => util.inspect(objectLog, false, null, true);
debug.formatters.d = (numberLog) => util.inspect(numberLog, false, null, true);
debug.formatters.b = (booleanLog) => util.inspect(booleanLog, false, null, true);
debug.formatters.n = (nullLog) => util.inspect(nullLog, false, null, true);
debug.formatters.u = (undefinedLog) => util.inspect(undefinedLog, false, null, true);
const regExp = /:(\d+):(\d+)\)/;
const formatComposition = (...items) => {
    let newFormatString = '';
    items.forEach((item) => {
        if (typeof item === 'object') {
            newFormatString += '%j ';
        }
        else if (typeof item === 'number') {
            newFormatString += '%d ';
        }
        else if (typeof item === 'boolean') {
            newFormatString += '%b ';
        }
        else if (typeof item === 'undefined') {
            newFormatString += '%u ';
        }
        else if (item === null) {
            newFormatString += '%n ';
        }
        else {
            newFormatString += '%s ';
        }
    });
    return newFormatString;
};
const logInfo = (...items) => {
    const infoFlag = new Error();
    const infoFileName = typeof infoFlag.stack === 'string' ? basename(infoFlag.stack.split('\n')[2].replace(regExp, '').replace(/\?/, '')) : 'undefined';
    const log = debug(`info:${infoFileName} -`);
    log.log = console.log.bind(console);
    log(formatComposition(...items), ...items);
};
const logError = (...items) => {
    const errorFlag = new Error();
    const errorFileName = typeof errorFlag.stack === 'string' ? basename(errorFlag.stack.split('\n')[2].replace(regExp, '').replace(/\?/, '')) : 'undefined';
    const error = debug(`error:${errorFileName} -`);
    error(formatComposition(...items), ...items);
};
export default logInfo;
export { logInfo, logError };
