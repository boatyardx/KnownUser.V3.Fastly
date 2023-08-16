import {Fastly} from "@fastly/as-compute";
import {onQueueITRequest, IntegrationDetails, onQueueITResponse} from "@queue-it/fastly";

const req = Fastly.getClientRequest();
req.headers.set("x-true-client-ip", Fastly.getClientIpAddressString());

// This secrets need o be added in order to make the connector work
const integrationDetails = new IntegrationDetails(
        "", //queue-it origin name
        "", //customer ID
        "", //Secret Key
        "", //API key
        ""); //workerHost
let res = onQueueITRequest(req, integrationDetails);

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