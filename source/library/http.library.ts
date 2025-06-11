import express, { Express, Request, json, urlencoded } from 'express';

/** express 請求物件 */
export interface IRequest extends Request {
    id?: number,
    account?: string,
    name?: string,
    role?: string,
    realIp?: string,
}

class HttpLibrary {
    /** 伺服器物件 */
    public server: Express;

    constructor() {
        this.server = express();
        this.server.use(json());
        this.server.use(urlencoded({ extended: false }));
    }
}

const httpLibrary = new HttpLibrary();

export default httpLibrary;
