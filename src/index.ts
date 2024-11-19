import express from 'express';
import { config } from 'dotenv';
import fenCodes from './fencodes.json';
import { createApplication } from './composition';
import { gameRoutes } from './routes/game.routes';
import { authMiddleware, errorMiddleware, loggerMiddleware } from './middleware';

config();

const app = express();
const PORT = process.env.PORT || 3000;
const application = createApplication();

app.use(express.urlencoded({ extended: true }));
// app.use(loggerMiddleware);
// app.use('/api');
// app.use(errorMiddleware);

application.services.game
    .startEventStream()
    .catch((err: Error) => console.error('Failed to start game service:', err));

app.use('/', gameRoutes(application.services, fenCodes));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
