# Queue-it connector for Fastly integration

This connector is a package that can be added in the Fastly platform in order to integrate Queue-it into Fastly.

You can add this package by navigating to Fastly > Compute resources > Service Configuration > Package

The official repo has a released package that uses env vars for the secrets (adding the secrets into fastly dictionary is enough).
But this one has the secrets hardcoded and they need to be added in before building the package.

Otherwise the Queue-it integration will be broken.

> *Note* The scope of this custom built connector is to add in new features to it. In this case is the retrieval of the client IP.


## How to use this connector

Go to [assembly/index.ts](assembly/index.ts) and update the secrets
They should look something like this

```ts
const integrationDetails = new IntegrationDetails(
        "queue-it_origin_name",
        "customer_ID",
        "Secret_Key",
        "API_key",
        "workerHost" //the worker host is actually the fastly domain of your compute resource.
);
```
These secrets should be all stored in the fastly dictionary on each compute resource.
In case they are not there, they can be retrieved from queue-it platform.

Just make sure the workerhost matches your fastly compute resource domain.

Afterwards you need to go to the [fastly.toml](fastly.toml) file and add in the Service ID and update the name for easier tracking

```ts
name = "connector-service-uat"
service_id = "vm123456789001"
```

Now you just need to run
```
fastly compute build
```

A new directory has appeared, called pkg.

Upload the file named connector-service-uat.tar.gz into Fastly (Fastly > Compute resource > Service Configuration > Package)

Once you’ve activated the new service version, fastly applies the new connector in 2-3 mins (the switch will be done in background, no down-time)


## Dependencies

You need to have *npm* and *fastly* installed in order to go through these steps.

You can install those on MacOS by running these commands

```
brew install node
brew install fastly/tap/fastly
```

## Update this package or create a new connector from scratch

In order to create a new connector from scratch you can use this commands

```
mkdir new && cd new
fastly compute init
npm install @queue-it/fastly
```

Navigate to assembly/index.ts and replace the content entirely with

```ts
import {Fastly} from "@fastly/as-compute";
import {onQueueITRequest, IntegrationDetails, onQueueITResponse} from "@queue-it/fastly";

const req = Fastly.getClientRequest();
req.headers.set("x-true-client-ip", Fastly.getClientIpAddressString());

// This is optional and can be null if it's specified in your Dictionary
const integrationDetails = new IntegrationDetails(
        "QueueItOriginName",
        "CustomerId",
        "SecretKey",
        "ApiKey",
        "workerHost");
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

> *Note:* Here the x-true-client-ip can be replaced with any naming you desire. Recommended to be different from the API call "ClientIpAddress"

Afterwards you just need to add in the secrets as mentioned in the first steps.