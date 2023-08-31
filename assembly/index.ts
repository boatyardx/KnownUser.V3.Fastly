import {Fastly, Headers, Request} from "@fastly/as-compute";
import {onQueueITRequest, IntegrationDetails, onQueueITResponse} from "@queue-it/fastly";

const req = Fastly.getClientRequest();
req.headers.set("x-true-client-ip", Fastly.getClientIpAddressString());

// This is set to null to retrieve the secrets from the Fastly dictionary
// If you want to hardcode the secrets just add them here (see readme)
let res = onQueueITRequest(req, null);

if (res != null) {
    Fastly.respondWith(res!);
} else {
    const myOrigin = 'origin';
    const cacheOverride = new Fastly.CacheOverride();
    const res = Fastly.fetch(req, {
        backend: myOrigin,
        cacheOverride,
    }).wait();
    onQueueITResponse(res);
    Fastly.respondWith(res);
} 