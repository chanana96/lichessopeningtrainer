import { readStream } from '../utils/stream';
import type { Config, EventData } from '../types';
import type { AxiosInstance } from 'axios';

export const createLichessApi = ({ axios, config }: { axios: AxiosInstance; config: Config }) => {
    if (!axios) throw new Error('Axios instance is required');
    if (!config?.tokens?.bot) throw new Error('Bot token is required');
    if (!config?.tokens?.user) throw new Error('User token is required');

    const streamEvent = async () => {
        try {
            const response = await axios.get('https://lichess.org/api/stream/event', {
                headers: {
                    Authorization: `Bearer ${config.tokens.bot}`,
                },
                responseType: 'stream',
            });

            return {
                setHandler: (handler: (event: EventData) => void) => {
                    return readStream(response.data, handler);
                },
            };
        } catch (error) {
            console.error(
                'Failed to create stream:',
                error instanceof Error ? error.message : 'Unknown error',
            );
            throw error;
        }
    };

    const streamGame = async (challengeId: string) => {
        try {
            const response = await axios.get(
                `https://lichess.org/api/bot/game/stream/${challengeId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${config.tokens.bot}`,
                        'Content-Type': 'application/x-ndjson',
                    },
                    responseType: 'stream',
                },
            );
            return {
                setHandler: (handler: (event: EventData) => void) => {
                    return readStream(response.data, handler);
                },
            };
        } catch (error) {
            console.error(
                'Game stream creation failed:',
                error instanceof Error ? error.message : 'Unknown error',
            );
            throw error;
        }
    };
    const sendChallenge = async (
        startingPositionFen: string,
        playerColorChoice: 'black' | 'white',
    ) => {
        try {
            const response = await axios.post(
                'https://lichess.org/api/challenge/lobster_bot',
                {
                    'clock.limit': 300,
                    'clock.increment': 5,
                    'color': playerColorChoice,
                    'variant': 'standard',
                    'fen': startingPositionFen,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${config.tokens.user}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                },
            );
            return response.data.url;
        } catch (error) {
            console.error(
                'Challenge creation failed:',
                error instanceof Error ? error.message : 'Unknown error',
            );
            throw error;
        }
    };
    const acceptChallenge = async (challengeId: string) => {
        try {
            console.log('Accepting challenge:', challengeId);
            await axios.post(
                `https://lichess.org/api/challenge/${challengeId}/accept`,
                {
                    challengeId: challengeId,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${config.tokens.bot}`,
                        'Content-Type': 'application/json',
                    },
                },
            );
        } catch (error) {
            console.error(
                'Failed to accept challenge',
                error instanceof Error ? error.message : 'Unknown error',
            );
            throw error;
        }
    };
    const sendChat = async (gameId: string, text: string) => {
        try {
            await axios.post(
                `https://lichess.org/api/bot/game/${gameId}/chat`,
                {
                    room: 'player',
                    text: text,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${config.tokens.bot}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                },
            );
            return;
        } catch (error) {
            console.error(
                'Failed to send chat:',
                error instanceof Error ? error.message : 'Unknown error',
            );
            throw error;
        }
    };
    const makeMove = async ({ gameId, move }: { gameId: string; move: string }) => {
        try {
            if (!gameId || !move) {
                throw new Error(`Invalid move parameters: gameId=${gameId}, move=${move}`);
            }
            const response = await axios.post(
                `https://lichess.org/api/bot/game/${gameId}/move/${move}`,
                { gameId: gameId, move: move },
                {
                    headers: {
                        'Authorization': `Bearer ${config.tokens.bot}`,
                        'Content-Type': 'application/json',
                    },
                },
            );
            return response?.data?.ok;
        } catch (error) {
            console.error(
                'Move execution failed:',
                error instanceof Error ? error.message : 'Unknown error',
            );
        }
    };
    const resign = async (gameId: string) => {
        try {
            const response = await axios.post(
                `https://lichess.org/api/bot/game/${gameId}/resign`,
                {
                    gameId: gameId,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${config.tokens.bot}`,
                        'Content-Type': 'application/json',
                    },
                },
            );
            return response.data;
        } catch (error) {
            console.error(
                'Failed to resign:',
                error instanceof Error ? error.message : 'Unknown error',
            );
            throw error;
        }
    };

    return {
        streamEvent,
        streamGame,
        sendChallenge,
        acceptChallenge,
        sendChat,
        makeMove,
        resign,
    };
};
