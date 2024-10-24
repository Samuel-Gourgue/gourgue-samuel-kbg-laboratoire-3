import * as utilities from "./utilities.js";
import * as serverVariables from "./serverVariables.js";

let requestsCachesExpirationTime = serverVariables.get("main.request.CacheExpirationTime");

global.requestsCaches = [];
global.cachedRequestsCleanerStarted = false;

export default class CachedRequestsManager {
    static add(url, content, ETag = "") {
        if (!cachedRequestsCleanerStarted) {
            cachedRequestsCleanerStarted = true;
            CachedRequestsManager.startCachedRequestsCleaner();
        }
        if (url !== "") {
            CachedRequestsManager.clear(url);
            requestsCaches.push({
                url,
                content,
                ETag,
                Expire_Time: utilities.nowInSeconds() + requestsCachesExpirationTime
            });
            console.log(BgWhite + FgBlue, `[Request to ${url} has been cached with ETag: ${ETag}]`);
        }
    }

    static startCachedRequestsCleaner() {
        setInterval(CachedRequestsManager.flushExpired, requestsCachesExpirationTime * 1000);
        console.log(BgWhite + FgBlue, "[Periodic requests caches cleaning process started...]");
    }

    static find(url) {
        try {
            if (url !== "") {
                for (let cache of requestsCaches) {
                    if (cache.Expire_Time <= utilities.nowInSeconds()) {
                        CachedRequestsManager.clear(url);
                        return null;
                    }
                    if (cache.url === url) {
                        cache.Expire_Time = utilities.nowInSeconds() + requestsCachesExpirationTime;
                        console.log(BgWhite + FgBlue, `[${url} data retrieved from cache]`);
                        return cache;
                    }
                }
            }
        } catch (error) {
            console.log(BgWhite + FgRed, "[requests cache error!]", error);
        }
        return null;
    }

    static clear(url) {
        if (url !== "") {
            let indexToDelete = [];
            let index = 0;
            for (let cache of requestsCaches) {
                if (cache.url === url) indexToDelete.push(index);
                index++;
            }
            utilities.deleteByIndex(requestsCaches, indexToDelete);
            console.log(BgWhite + FgBlue, `[Cache cleared for ${url}]`);
        }
    }

    static flushExpired() {
        let now = utilities.nowInSeconds();
        for (let cache of requestsCaches) {
            if (cache.Expire_Time <= now) {
                console.log(BgWhite + FgBlue, `[Cache for ${cache.url} has expired]`);
            }
        }
        requestsCaches = requestsCaches.filter(cache => cache.Expire_Time > now);
    }

    static get(HttpContext) {
        const { url } = HttpContext.request;
        const cache = CachedRequestsManager.find(url);
        if (cache) {
            console.log(BgWhite + FgBlue, `[Serving ${url} from cache]`);
            HttpContext.response.JSON(cache.content, cache.ETag, true);
            return true;
        }
        return false;
    }
}
