import type { LichessApi } from '../api/types.js';
import type { EventData } from '../types.js';
import EventEmitter from 'events';

export const createGameService = ({
    lichessApi,
    eventEmitter,
}: {
    lichessApi: LichessApi;
    eventEmitter: EventEmitter;
}) => {
    const gameState: EventData['game'] = {
        id: '',
        isMyTurn: false,
        fen: '',
    };

    const startEventStream = async () => {
        try {
            const stream = await lichessApi.streamEvent();
            stream.setHandler((event: EventData) => {
                console.log(event);
                switch (event.type) {
                    case 'challenge':
                        console.log('Challenge received:', event.challenge.id);
                        eventEmitter.emit('challengeReceived', event.challenge.id);

                        break;
                    case 'gameStart':
                        eventEmitter.emit('gameStarted', {
                            id: event.game.id,
                            isMyTurn: event.game.isMyTurn,
                            fen: event.game.fen,
                        });
                        break;
                }
            });
        } catch (error: unknown) {
            console.error(
                'Failed to stream event:',
                error instanceof Error ? error.message : 'Unknown error',
            );
            throw error;
        }
    };
    const callSendChallenge = async (
        startingPositionFen: string,
        playerColorChoice: 'black' | 'white',
    ) => {
        try {
            const response = await lichessApi.sendChallenge(startingPositionFen, playerColorChoice);
            return response;
        } catch (error: unknown) {
            console.error(
                'Failed to send challenge:',
                error instanceof Error ? error.message : 'Unknown error',
            );
            throw error;
        }
    };
    const handleChallengeReceived = async (challengeId: string) => {
        try {
            console.log('Accepting challenge:', challengeId);
            await lichessApi.acceptChallenge(challengeId);
        } catch (error: unknown) {
            console.error(
                'Failed to accept challenge:',
                error instanceof Error ? error.message : 'Unknown error',
            );
            throw error;
        }
    };
    const handleGameStarted = async (data: EventData['game']) => {
        try {
            Object.assign(gameState, data);

            const stream = await lichessApi.streamGame(data.id);
            if (gameState.isMyTurn) {
                eventEmitter.emit('findMove', {
                    uciCode: '',
                    fenCode: gameState.fen,
                    gameId: gameState.id,
                });
            }
            stream.setHandler((event: EventData) => {
                switch (event.type) {
                    case 'gameState':
                        if (event.status === 'started') eventEmitter.emit('gameState', event);

                        break;
                    case 'gameFinish':
                        eventEmitter.emit('gameFinished', event.challenge.id);
                        break;
                }
            });
        } catch (error: unknown) {
            console.error(
                'Failed to stream game:',
                error instanceof Error ? error.message : 'Unknown error',
            );
            throw error;
        }
    };

    const handleGameState = async (event: { moves: string }) => {
        if (gameState.isMyTurn) {
            eventEmitter.emit('findMove', {
                uciCode: event.moves,
                fenCode: gameState.fen,
                gameId: gameState.id,
            });
        } else {
            gameState.isMyTurn = !gameState.isMyTurn;
            return;
        }
    };
    const handleMoveFound = async ({ gameId, move }: { gameId: string; move: string }) => {
        try {
            const response = await lichessApi.makeMove({ gameId, move });
            if (response) {
                gameState.isMyTurn = !gameState.isMyTurn;
            }
        } catch (error: unknown) {
            console.error(
                'Move execution failed:',
                error instanceof Error ? error.message : 'Unknown error',
            );
            throw error;
        }
    };
    return {
        startEventStream,
        callSendChallenge,
        handleChallengeReceived,
        handleGameState,
        handleGameStarted,
        handleMoveFound,
    };
};
