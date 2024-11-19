export type Config = typeof import('./config/config').config;

export interface EventData {
    type: string;
    status: string;
    game: {
        id: string;
        isMyTurn: boolean;
        fen: string;
    };
    challenge: {
        id: string;
    };
}

export type FenCodeStructure = {
    readonly [key: string]: string;
};
export interface Error {
    message: string;
    status?: number;
}
