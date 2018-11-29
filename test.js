"use strict";

const assert = require("assert");
const cluster = require("cluster");

if (cluster.isMaster) {
    describe("Cluster Events", () => {
        let hasErr = false,
            worker1,
            worker2;

        after(() => {
            setTimeout(() => process.exit(+hasErr), 100);
        });

        it("should fork 2 workers and make handshake as expected", function (done) {
            // this.timeout(5000);
            worker1 = cluster.fork();
            worker2 = cluster.fork();
            let count = 0,
                online = 0,
                logs = [];

            cluster.on("online", () => {
                online++;

                if (online === 2) {
                    // set a timer to ensure that all channel peers are online
                    setTimeout(() => {
                        worker1.send("");
                    }, 500);
                }
            }).on("message", (worker, msg) => {
                count++;
                logs.push(msg);

                if (count === 2) {
                    try {
                        assert.deepStrictEqual(logs, ["hello world", "hello world"]);
                        done();
                    } catch (err) {
                        done(err);
                    }
                }
            });
        });

        it("should emit the event with data as expected", (done) => {
            let count = 0,
                logs = [];

            cluster.removeAllListeners("message");
            cluster.on("message", (worker, msg) => {
                count++;
                logs.push(msg);

                if (count === 2) {
                    try {
                        assert.deepStrictEqual(logs, [["hello world"], ["hello world"]]);
                        done();
                    } catch (err) {
                        done(err);
                    }
                }
            });

            worker1.send(["hello world"]);
        });
    });
} else {
    const { EventEmitter } = require(".");
    var emitter = new EventEmitter("test");

    emitter.on("handshake", () => {
        process.send("hello world");
    }).on("transfer", msg => {
        process.send(msg);
    });

    process.on("message", (msg) => {
        if (!msg) {
            emitter.emit("handshake");
        } else {
            emitter.emit("transfer", msg);
        }
    });
}