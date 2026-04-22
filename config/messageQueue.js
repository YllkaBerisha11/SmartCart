const EventEmitter = require("events");

class MessageQueue extends EventEmitter {
  constructor() {
    super();
    this.queues = {};
  }

  publish(queue, message) {
    if (!this.queues[queue]) {
      this.queues[queue] = [];
    }
    this.queues[queue].push(message);
    this.emit(queue, message);
    console.log(`📨 [MQ] Message published to queue: ${queue}`, message);
  }

  subscribe(queue, callback) {
    this.on(queue, callback);
    console.log(`👂 [MQ] Subscribed to queue: ${queue}`);
  }

  getMessages(queue) {
    return this.queues[queue] || [];
  }
}

module.exports = new MessageQueue();