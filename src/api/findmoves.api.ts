const createStreamReader = () => {};
import type { Config, EventData } from '../types';
import type { EngineAnalysisStream } from './types';
import type { AxiosInstance } from 'axios';

export const createFindMovesApi = ({ axios, config }: { axios: AxiosInstance; config: Config }) => {
    if (!axios) throw new Error('Axios instance is required');
    if (!config?.tokens?.bot) throw new Error('Bot token is required');
    if (!config?.tokens?.user) throw new Error('User token is required');

    const getExplorerMoves = async (cleanedUciCode: string, fenCode: string) => {
        try {
            const response = await axios.get('https://explorer.lichess.ovh/lichess', {
                params: {
                    variant: 'standard',
                    play: cleanedUciCode,
                    fen: fenCode,
                    speeds: config.lichess.speeds,
                    ratings: config.lichess.ratings,
                },
            });
            return response.data.moves;
        } catch (error) {
            console.error('Error fetching data:');
            throw error;
        }
    };

    const getStockfishMoves = async (arrayedUci: string[], fenCode: string) => {
        try {
            const response = await axios.post(
                `https://engine.lichess.ovh/api/external-engine/${config.stockfish.id}/analyse`,
                {
                    clientSecret: config.stockfish.clientSecret,
                    work: {
                        sessionId: 'getbotplaymove',
                        threads: 4,
                        hash: 128,
                        multiPv: 1,
                        variant: 'chess',
                        initialFen: fenCode,
                        moves: arrayedUci,
                        movetime: 5,
                        depth: 25,
                        nodes: 10000,
                    },
                },
                {
                    headers: {
                        'Authorization': `Bearer ${config.tokens.bot}`,
                        'Content-Type': 'application/json',
                    },
                    responseType: 'stream',
                },
            );

            return new Promise((resolve, reject) => {
                const streamReader = createStreamReader();

                const handleLine = (json: EngineAnalysisStream) => {
                    if (!json.pvs[0]) {
                        return false;
                    }

                    const firstPv = json.pvs[0];
                    const firstMove = firstPv.moves[0];
                    console.log('First move found:', firstMove);
                    resolve(firstMove);
                    return true;
                };

                const handleError = (error: unknown) => {
                    console.error(
                        'Stream error:',
                        error instanceof Error ? error.message : 'Unknown error',
                    );
                    reject(error);
                };

                // const stream = streamReader.readStream(response.data, handleLine, handleError);

                // response.data.on('end', () => stream.destroy());
            });
        } catch (error) {
            console.error(
                'Error fetching data:',
                error instanceof Error ? error.message : 'Unknown error',
            );
            throw error;
        }
    };
    return {
        getExplorerMoves,
        getStockfishMoves,
    };
};
