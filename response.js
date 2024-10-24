import { log } from "./log.js";
import CachedRequestsManager from './CachedRequestsManager.js';

export default class Response {
    constructor(HttpContext) {
        this.HttpContext = HttpContext;
        this.res = HttpContext.res;
        this.errorContent = "";
    }

    status(number, errorMessage = '') {
        if (errorMessage) {
            this.res.writeHead(number, { 'content-type': 'application/json' });
            this.errorContent = { "error_description": errorMessage };
            return this.end(JSON.stringify(this.errorContent));
        } else {
            this.res.writeHead(number, { 'content-type': 'text/plain' });
            return this.end();
        }
    }

    end(content = null) {
        if (content) {
            this.res.end(content);
        } else {
            this.res.end();
            console.log(FgCyan + Bright, "Response status:", this.res.statusCode, this.errorContent);
        }
        return true;
    }

    /////////////////////////////////////////////// 200 ///////////////////////////////////////////////////////

    ok() { return this.status(200); }

    ETag(ETag) {
        console.log(FgCyan + Bright, "Response header ETag key:", ETag);
        this.res.writeHead(204, { 'ETag': ETag });
        this.end();
    }

    JSON(obj, ETag = "", fromCache = false) {
        if (ETag != "")
            this.res.writeHead(200, { 'content-type': 'application/json', 'ETag': ETag });
        else
            this.res.writeHead(200, { 'content-type': 'application/json' });
    
        if (obj != null) {
            let content = JSON.stringify(obj);
            console.log("Response payload -->", content.toString().substring(0, 75) + "...");
    
            if (!fromCache && this.HttpContext.req.method === 'GET' && !this.HttpContext.path.id) {
                CachedRequestsManager.add(this.HttpContext.req.url, obj, ETag);
            }
    
            return this.end(content);
        } else
            return this.end();
    }    
    
    HTML(content) {
        this.res.writeHead(200, { 'content-type': 'text/html' });
        return this.end(content);
    }

    accepted() { return this.status(202); } // accepted status
    deleted() { return this.status(202); }  // accepted status
    created(jsonObj) {
        this.res.writeHead(201, { 'content-type': 'application/json' });
        return this.end(JSON.stringify(jsonObj));
    }

    content(contentType, content) {
        this.res.writeHead(200, { 'content-type': contentType, "Cache-Control": "public, max-age=31536000" });
        return this.end(content);
    }

    noContent() { return this.status(204); }
    updated() { return this.status(204); }

    /////////////////////////////////////////////// 400 ///////////////////////////////////////////////////////

    badRequest(errormessage = '') { return this.status(400, errormessage); }
    unAuthorized(errormessage = '') { return this.status(401, errormessage); }
    forbidden(errormessage = '') { return this.status(403, errormessage); }
    notFound(errormessage = '') { return this.status(404, errormessage); }
    notAloud(errormessage = '') { return this.status(405, errormessage); }
    conflict(errormessage = '') { return this.status(409, errormessage); }
    unsupported(errormessage = '') { return this.status(415, errormessage); }
    unprocessable(errormessage = '') { return this.status(422, errormessage); }

    /////////////////////////////////////////////// 500 ///////////////////////////////////////////////////////

    internalError(errormessage = '') { return this.status(500, errormessage); }
    notImplemented(errormessage = '') { return this.status(501, errormessage); }
}
