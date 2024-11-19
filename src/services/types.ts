import type { EventData } from '../../src/types';

export interface ExplorerService {}

export interface GameService {
    callSendChallenge: (
        startingPositionFen: string,
        playerColorChoice: 'black' | 'white',
    ) => Promise<string>;
    handleChallengeReceived: (challenge: EventData['challenge']['id']) => Promise<void>;
    handleGameStarted: (data: { id: string; isMyTurn: boolean; fen: string }) => Promise<void>;
    handleGameState: (event: { moves: string }) => Promise<void>;
    handleMoveFound: (data: { gameId: string; move: string }) => Promise<void>;
    startEventStream: () => Promise<void>;
}

export interface MovesArray {
    uci: string;
    white: number;
    draws: number;
    black: number;
}

export interface CurrentBoardData {
    uciCode: string;
    fenCode: string;
    gameId?: string;
}
