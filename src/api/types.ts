import type { EventData } from '../types';

export interface MovesArray {
    uci: string;
    white: number;
    draws: number;
    black: number;
}
export interface PrincipalVariation {
    depth: number;
    cp: number;
    mate: number;
    moves: string[];
}

export interface EngineAnalysisStream {
    time: number;
    depth: number;
    nodes: number;
    pvs: PrincipalVariation[];
}

export interface LichessApi {
    streamEvent: () => Promise<{
        setHandler: (handler: (event: EventData) => void) => Promise<void>;
    }>;
    streamGame: (gameId: string) => Promise<{
        setHandler: (handler: (event: EventData) => void) => Promise<void>;
    }>;
    sendChallenge: (
        startingPositionFen: string,
        playerColorChoice: 'black' | 'white',
    ) => Promise<string>;
    acceptChallenge: (challengeId: string) => Promise<void>;
    sendChat: (gameId: string, text: string) => Promise<void>;
    makeMove: (moveData: { gameId: string; move: string }) => Promise<boolean>;
    resign: (gameId: string) => Promise<void>;
}

export interface FindMovesApi {
    getStockfishMoves: (arrayedUci: string[], fenCode: string) => Promise<any>;
    getExplorerMoves: (cleanedUciCode: string, fenCode: string) => Promise<MovesArray[]>;
}
