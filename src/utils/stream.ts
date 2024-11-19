import type { Readable } from 'stream';
import type { EventData } from '../types';

export const readStream = async (
    stream: Readable,
    handler: (event: EventData) => void,
): Promise<void> => {
    stream.on('data', (chunk) => {
        const str = chunk.toString().trim();
        if (/^[\[{]/.test(str))
            try {
                handler(JSON.parse(str));
            } catch (e) {
                console.error(e);
            }
    });
};
