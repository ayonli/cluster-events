import * as events from "events";

export declare class EventEmitter extends events.EventEmitter {
    readonly id: string;
    constructor(id: string);

    on(event: string, listener: (...args) => void): this;
    once(event: string, listener: (...args) => void): this;
    emit(event: string, ...args): boolean;
}

export default EventEmitter;