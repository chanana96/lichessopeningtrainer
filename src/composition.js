const EventEmitter = require("events");
const config = require("./config/config");
const axios = require("axios");

const { createLichessApi, createFindMovesApi } = require("./api");
const { createExplorerService, createGameService } = require("./services");
const { createEventHandlers, EVENT_TYPES } = require("./events");

const createApplication = () => {
  try {
    const eventEmitter = new EventEmitter();
    eventEmitter.setMaxListeners(15);

    // APIs
    const lichessApi = createLichessApi({ axios, config });
    const findMovesApi = createFindMovesApi({ axios, config });

    // Services
    const explorerService = createExplorerService({
      findMovesApi,
      eventEmitter,
      config: config.lichess,
    });

    const gameService = createGameService({
      lichessApi,
      eventEmitter,
      config,
    });

    // Event Handlers
    const handlers = createEventHandlers({
      chatService: gameService,
    });

    // Register Events
    eventEmitter.on(EVENT_TYPES.SEND_CHAT, handlers.handleSendChat);
    eventEmitter.on(EVENT_TYPES.GAME_START, gameService.handleGameStart);
    eventEmitter.on(
      EVENT_TYPES.CHALLENGE_RECEIVED,
      gameService.handleChallengeReceived
    );
    eventEmitter.on(EVENT_TYPES.GAME_STARTED, gameService.handleGameStarted);
    eventEmitter.on(EVENT_TYPES.GAME_FULL, gameService.handleGameFull);
    eventEmitter.on(EVENT_TYPES.GAME_STATE, gameService.handleGameState);
    eventEmitter.on(EVENT_TYPES.GAME_FINISHED, gameService.handleGameFinished);

    eventEmitter.on(EVENT_TYPES.FIND_MOVE, explorerService.handleFindMove);
    eventEmitter.on(EVENT_TYPES.MOVE_FOUND, gameService.handleMoveFound);

    return {
      services: {
        explorer: explorerService,
        game: gameService,
      },
      shutdown: async () => {
        // Cleanup resources
      },
    };
  } catch (error) {
    console.error("Failed to initialize application:", error);
    throw error;
  }
};

module.exports = createApplication;
