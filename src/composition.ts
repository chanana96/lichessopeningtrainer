import type { ExplorerService, GameService } from './services/types';

import EventEmitter from 'events';
import { config } from './config/config';
import axios from 'axios';
import { createLichessApi, createFindMovesApi } from './api';
import { createExplorerService, createGameService } from './services';
import { EVENT_TYPES } from './events/types';
type EVENT_TYPES = typeof EVENT_TYPES;

interface Application {
    services: {
        explorer: ExplorerService;
        game: GameService;
    };
    shutdown: () => Promise<void>;
}

export const createApplication = (): Application => {
    try {
        const eventEmitter = new EventEmitter();
        eventEmitter.setMaxListeners(15);

        const lichessApi = createLichessApi({ axios, config });
        const findMovesApi = createFindMovesApi({ axios, config });

        const explorerService = createExplorerService({
            findMovesApi,
            eventEmitter,
            config: config,
        });

        const gameService = createGameService({
            lichessApi,
            eventEmitter,
        });

        // const handlers = createEventHandlers({
        //     chatService: gameService,
        // });

        // eventEmitter.on(EVENT_TYPES.SEND_CHAT, handlers.handleSendChat);
        eventEmitter.on(EVENT_TYPES.CHALLENGE_RECEIVED, gameService.handleChallengeReceived);
        eventEmitter.on(EVENT_TYPES.GAME_STARTED, gameService.handleGameStarted);
        eventEmitter.on(EVENT_TYPES.GAME_STATE, gameService.handleGameState);
        // eventEmitter.on(EVENT_TYPES.GAME_FINISHED, gameService.handleGameFinished);

        eventEmitter.on(EVENT_TYPES.FIND_MOVE, explorerService.handleFindMove);
        eventEmitter.on(EVENT_TYPES.MOVE_FOUND, gameService.handleMoveFound);

        return {
            services: {
                explorer: explorerService,
                game: gameService,
            },
            shutdown: async () => {},
        };
    } catch (error) {
        console.error('Failed to initialize application:', error);
        throw error;
    }
};
