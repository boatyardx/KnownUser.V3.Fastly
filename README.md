# Queue-it connector for Fastly integration

This connector is a package that can be added in the Fastly platform in order to integrate Queue-it into Fastly.

You can add this package by navigating to Fastly > Compute resources > Service Configuration > Package


> *Note* The scope of this custom built connector is to add new features to it. In this case is the retrieval of the client IP.


## How to use this connector

### **Dictionary retrieved secrets**

This package retrieves automatically the secrets stored in the Fastly dictionary.

1. Make sure that the integrationDetails const is set to null and requested from Fastly.

[index.ts](assembly/index.ts) should look like this

```ts
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
```
2. Navigate to the [fastly.toml](fastly.toml) file and add in the Service ID and update the name for easier tracking. eg.
```ts
name = "connector-service-uat"
service_id = "vm123456789001"
```
3. Run `fastly compute build`

    A new directory has appeared, called pkg.

4. Import the newly generated package into Fastly (Fastly > Compute resource > Service Configuration > Package)

> *Note:* Once you’ve activated the new service version, fastly applies the new connector in 2-3 mins (the switch will be done in background, no down-time)

----
### **Hardcoded secrets**

In case you want to hardcode the secrets into the package.

1. Go to [assembly/index.ts](assembly/index.ts) and add in the secrets

The index.ts should look something like this

```ts
import {Fastly} from "@fastly/as-compute";
import {onQueueITRequest, IntegrationDetails, onQueueITResponse} from "@queue-it/fastly";

const req = Fastly.getClientRequest();
req.headers.set("x-true-client-ip", Fastly.getClientIpAddressString());

// This is optional and can be null if it's specified in your Dictionary
const integrationDetails = new IntegrationDetails(
        "queue-it_origin_name",
        "customer_ID",
        "Secret_Key",
        "API_key",
        "workerHost" //the worker host is actually the fastly domain of your compute resource.
);
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
```
> *Note:* These secrets should be all stored in the fastly dictionary on each compute resource.
In case they are not there, they can be retrieved from queue-it platform.

2. Go to the [fastly.toml](fastly.toml) file and add in the Service ID and update the name for easier tracking

```ts
name = "connector-service-uat"
service_id = "vm123456789001"
```

3. Now you just need to run `fastly compute build`

    A new directory has appeared, called pkg.

4. Upload the file named connector-service-uat.tar.gz into Fastly (Fastly > Compute resource > Service Configuration > Package)

>*Note:* Once you’ve activated the new service version, fastly applies the new connector in 2-3 mins (the switch will be done in background, no down-time)

----

## Dependencies

You need to have *npm* and *fastly* installed in order to go through these steps.

You can install those on MacOS by running these commands

```
brew install node
brew install fastly/tap/fastly
```
----

## How to update this package or create a new connector from scratch

In order to create a new connector from scratch you can use this commands

```
mkdir new && cd new
fastly compute init
npm install @queue-it/fastly
```

Navigate to assembly/index.ts and replace the content entirely with

```ts
import {Fastly, Headers, Request} from "@fastly/as-compute";
import {onQueueITRequest, IntegrationDetails, onQueueITResponse} from "@queue-it/fastly";

const req = Fastly.getClientRequest();
req.headers.set("x-true-client-ip", Fastly.getClientIpAddressString());

// This is set to null to retrieve the secrets from the Fastly dictionary
// If you want to hardcode the secrets just add them here (see readme Hardcoded secrets section)
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
```

> *Note:* Here the x-true-client-ip can be replaced with any naming you desire. Recommended to be different from the API call "ClientIpAddress"

Afterwards you just need to add in the secrets via a method of your choice.