import type { FindMovesApi } from '../api/types';
import type { MovesArray, CurrentBoardData } from './types';
import type { Config } from '../types';

import EventEmitter from 'events';

export const createExplorerService = ({
    findMovesApi,
    eventEmitter,
    config,
}: {
    findMovesApi: FindMovesApi;
    eventEmitter: EventEmitter;
    config: Config;
}) => {
    const cleanUciCode = async (uciCode: CurrentBoardData['uciCode']) => {
        return uciCode.replace(/ +/g, ',');
    };

    const uciToArray = async (uciCode: CurrentBoardData['uciCode']) => {
        return uciCode.split(/\s+/);
    };

    const getMove = (moves: MovesArray[]) => {
        try {
            if (!moves[0]) {
                throw new Error('No moves found');
            }

            if (moves.length === 1) return moves[0].uci;
            const weights = moves.map((move) => move.white + move.draws + move.black);
            const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

            const probabilities = weights.map((weight) => weight / totalWeight);

            // const percentages = probabilities.map((prob) => (prob * 100).toFixed(2));
            // moves.forEach((move, index) => {
            //     console.log(`Move: ${move.uci}, Percentage: ${percentages[index]}%`);
            // });

            const threshold = Math.random();

            let cumulativeProbability = 0;
            for (let i = 0; i < probabilities.length; i++) {
                cumulativeProbability += probabilities[i] as number;
                if (threshold <= cumulativeProbability) {
                    return (moves[i] as MovesArray).uci;
                }
            }
        } catch (error) {
            console.error(
                'Error selecting move:',
                error instanceof Error ? error.message : 'Unknown error',
            );
            throw error;
        }
    };

    const getMoveFromExplorer = async ({
        uciCode,
        fenCode,
    }: Pick<CurrentBoardData, 'uciCode' | 'fenCode'>) => {
        const cleanedUci = await cleanUciCode(uciCode);
        const response = await findMovesApi.getExplorerMoves(cleanedUci, fenCode);
        return response;
    };

    const getMoveFromStockfish = async ({
        uciCode,
        fenCode,
    }: Pick<CurrentBoardData, 'uciCode' | 'fenCode'>) => {
        const arrayedUci = await uciToArray(uciCode);
        const response = await findMovesApi.getStockfishMoves(arrayedUci, fenCode);
        return response;
    };

    const handleFindMove = async ({ uciCode, fenCode, gameId }: CurrentBoardData) => {
        try {
            if (!config.lichess.useExplorer) {
                const move = await getMoveFromStockfish({ uciCode, fenCode });
                eventEmitter.emit('moveFound', { gameId, move });
            }

            const moves = await getMoveFromExplorer({ uciCode, fenCode });

            if (moves.length === 0) {
                config.lichess.useExplorer = false;
                eventEmitter.emit(
                    'sendChat',
                    gameId,
                    'No more moves found in the Lichess explorer. Switching to Stockfish analysis.',
                );
                const move = await getMoveFromStockfish({ uciCode, fenCode });
                eventEmitter.emit('moveFound', { gameId, move });
            }

            const move = getMove(moves);
            return eventEmitter.emit('moveFound', { gameId, move });
        } catch (error) {
            console.error(
                'Failed to find move:',
                error instanceof Error ? error.message : 'Unknown error',
            );
            throw error;
        }
    };
    return { handleFindMove };
};
