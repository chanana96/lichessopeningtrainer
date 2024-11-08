const EventEmitter = require("events");
const config = require("./config/config");
const axios = require("axios");
const EVENT_TYPES = require("./events/types");
const createEventHandlers = require("./events/handlers");

const eventEmitter = new EventEmitter();
eventEmitter.setMaxListeners(15);

const handlers = createEventHandlers({ chatService });

eventEmitter.on(EVENT_TYPES.SEND_CHAT, handlers.handleSendChat);

const services = {
  config,
  eventEmitter,
  explorer: createExplorerService({
    axios,
    eventEmitter,
    config: config.lichess,
  }),
};

module.exports = services;
