/////////////////////////////////////////////////////////////////////
// Use this class to insert into middlewares into the pipeline
// 
/////////////////////////////////////////////////////////////////////
// Author : Nicolas Chourot
// Lionel-Groulx College
/////////////////////////////////////////////////////////////////////

import CachedRequestsManager from './CachedRequestsManager.js';

export default class MiddlewaresPipeline {
    constructor() {
        this.middlewares = [];
    }

    add(middleware) {
        this.middlewares.push(middleware);
    }

    async handleHttpRequest(HttpContext) {
        for (let middleware of this.middlewares) {
            if (await middleware(HttpContext)) {
                return true;
            }
        }
        return false;
    }
}

const middlewaresPipeline = new MiddlewaresPipeline();

middlewaresPipeline.add(async (HttpContext) => {
    return CachedRequestsManager.get(HttpContext);
});

export { middlewaresPipeline };
