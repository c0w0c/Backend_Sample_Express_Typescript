import express, { json, urlencoded } from 'express';
class HttpLibrary {
    server;
    constructor() {
        this.server = express();
        this.server.use(json());
        this.server.use(urlencoded({ extended: false }));
    }
}
const httpLibrary = new HttpLibrary();
export default httpLibrary;
