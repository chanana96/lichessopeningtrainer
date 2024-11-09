const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const fenCodes = require("./fencodes.json");
const createApplication = require("./composition");
const gameRoutes = require("./routes/game.routes");

const {
  authMiddleware,
  errorMiddleware,
  loggerMiddleware,
} = require("./middleware");

const application = createApplication();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);
app.use("/api", authMiddleware);
app.use(errorMiddleware);

// Routes

application.services.game
  .startEventStream()
  .catch((err) => console.error("Failed to start game service:", err));
app.use("/", gameRoutes(application.services, fenCodes));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
