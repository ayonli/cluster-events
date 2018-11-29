# Cluster Events

**Node's event emitter for cluster workers.**

Unlike traditional NodeJS EventEmitter, this module broadcasts the event to 
all worker processes forked by **cluster** or **child_process** (When forking 
via *child_process*, you must provide the same entry path for all the workers).

*This module doesn't rely on cluster and the master process, so it's perfect*
*using it while your program runs under PM2 supervision.*

## When will you need to broadcast an event?

Check this example, with traditional EventEmitter, when open the URL in a 
browser, you will only get data updated in one process, and the other three will
still holds the old data.

```javascript
import { EventEmitter } from "events";
import * as cluster from "cluster";
import * as os from "os";
import * as express from "express";

if (cluster.isMaster) {
    for (let i=0; i < os.cpus().length; i++) {
        cluster.fork();
    }
} else {
    var data = { counter: 0 };
    var emitter = new EventEmitter();
    var app = express();

    emitter.on("updateCounter", () => {
        data.counter++;
    });

    express.get("/update-counter", (req, res) => {
        // Only one process will emit this event and increase the counter.
        emitter.emit("updateCounter");
        res.send("OK");
    }).get("/get-counter", (req, res) => {
        // If there are 4 CPU cores, you have 3/4 of chance to get `0` and only
        // 1/4 of chance to get 1.
        res.send(data.counter);
    });

    express.listen(80);
}
```

Now let's use *cluster-events* to do the same job and compare.

```javascript
import { EventEmitter } from "cluster-events";
import * as cluster from "cluster";
import * as os from "os";
import * as express from "express";

if (cluster.isMaster) {
    for (let i=0; i < os.cpus().length; i++) {
        cluster.fork();
    }
} else {
    var data = { counter: 0 };
    var emitter = new EventEmitter("my-emitter"); // provide an unique ID
    var app = express();

    emitter.on("updateCounter", () => {
        data.counter++;
    });

    express.get("/update-counter", (req, res) => {
        // All processes will emit this event and increase the counter.
        emitter.emit("updateCounter");
        res.send("OK");
    }).get("/get-counter", (req, res) => {
        // No matter how many CPU cores are there, you will only get `1`.
        res.send(data.counter);
    });

    express.listen(80);
}
```

The only difference of usage is that EventEmitter of *cluster-events* requires 
an unique ID to identify the instance among all potential instances, and all 
other details are just the same, however your event will be emitted to all the 
listeners in all worker processes.

## Limits

Although this module allows you broadcasting the event, however, because the 
limitation of IPC communication, when you emit an event with some data, you can 
only pass the data that can be serialized via `JSON.stringify()`, any other 
types of data will be lost while transmission (Also, event names only 
accept strings with this module).

So it's your decision to use this module or the traditional NodeJS EventEmitter,
based on your needs.