"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const events = require("events");
const { channel } = require("ipchannel");
const Emitters = {};

channel.on("cluster-events", (sender, id, ...args) => {
    events.EventEmitter.prototype.emit.apply(Emitters[id], args);
});

class EventEmitter extends events.EventEmitter {
    constructor(id) {
        super();
        this.id = id;
        Emitters[id] = this;
    }

    emit(event, ...args) {
        return channel.to("all").emit("cluster-events", this.id, event, ...args);
    }
}

exports.default = exports.EventEmitter = EventEmitter;