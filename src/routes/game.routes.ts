import express from 'express';
const router = express.Router();
import type { ExplorerService, GameService } from '../services/types';
import type { FenCodeStructure } from '../types';
import type { Request, Response } from 'express';

export const gameRoutes = (
    services: { game: GameService; explorer: ExplorerService },
    fenCodes: FenCodeStructure,
) => {
    router.get('/', (req: Request, res: Response) => {
        const gameUrl = req.query.gameUrl;
        res.send(`
      <html>
        <body>
          <h1>Welcome to Lichess Bot</h1>
          <button onclick="location.href='/challenge'">Create Challenge</button>
          ${
              gameUrl
                  ? `<p>Challenge created! <a href="${gameUrl}" target="_blank">Open Game</a></p>`
                  : ''
          }
        </body>
      </html>
    `);
    });
    router.get('/challenge', (req: Request, res: Response) => {
        const fenOptions = Object.keys(fenCodes)
            .map((key) => `<option value="${key}">${key}</option>`)
            .join('');

        res.send(`
      <html>
        <body>
          <h1>Create Challenge</h1>
          <form action="/challenge" method="POST">
            <select name="fenCode">${fenOptions}</select>
            <select name="color">
              <option value="white">White</option>
              <option value="black">Black</option>
            </select>
            <button type="submit">Start</button>
          </form>
        </body>
      </html>
    `);
    });

    router.post('/challenge', async (req: Request, res: Response) => {
        try {
            const { fenCode, color }: { fenCode: string; color: 'black' | 'white' } = req.body;
            const fenValue = fenCodes[fenCode];
            const startingPositionFen = fenValue ?? (fenCodes.default as string);
            const gameUrl = await services.game.callSendChallenge(startingPositionFen, color);
            res.redirect(`/?gameUrl=${encodeURIComponent(gameUrl)}`);
        } catch (error) {
            res.status(500).send('Failed to create challenge');
        }
    });

    return router;
};
