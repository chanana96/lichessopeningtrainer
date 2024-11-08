const express = require("express");
const { streamEvent, sendChallenge } = require("./axios");
const app = express();
const PORT = process.env.PORT || 3000;
const fenCodes = require("./fencodes.json");
const createApplication = require("./composition");
const gameRoutes = require("./routes/game.routes");
const application = createApplication();

const {
  authMiddleware,
  errorMiddleware,
  loggerMiddleware,
} = require("./middleware");

app.use(loggerMiddleware);
app.use("/api", authMiddleware);
app.use(errorMiddleware);

app.use(express.urlencoded({ extended: true }));
app.use("/game", gameRoutes(application.services));
app.get("/", (req, res) => {
  // Extract gameUrl from the query string, if available
  const gameUrl = req.query.gameUrl;

  res.send(`
    <html>
      <body>
        <h1>Welcome!</h1>
        <button onclick="location.href='/challenge'">Go to Challenge</button>

        ${
          gameUrl
            ? `<p>Challenge created! <a href="${gameUrl}" target="_blank">Click here to open the game</a></p>`
            : ""
        }
      </body>
    </html>
  `);
  streamEvent();
});

app.get("/challenge", (req, res) => {
  const fenOptions = Object.keys(fenCodes)
    .map((key) => `<option value="${key}">${key}</option>`)
    .join("");

  res.send(`
    <html>
      <body>
        <h1>Choose your challenge</h1>
        <form action="/start-challenge" method="POST">
          <label for="fenCode">Select Opening:</label>
          <select name="fenCode" id="fenCode">
            ${fenOptions}
          </select>
          <label for="color">Select Color:</label>
          <select name="color" id="color">
            <option value="white">White</option>
            <option value="black">Black</option>
          </select>
          <button type="submit">Start Challenge</button>
        </form>
      </body>
    </html>
  `);
});

app.post("/start-challenge", async (req, res) => {
  const fenCodeKey = req.body.fenCode;
  const playerColorChoice = req.body.color;
  const startingPositionFen = fenCodes[fenCodeKey]?.default || fenCodes.default;

  const gameUrl = await sendChallenge(startingPositionFen, playerColorChoice);

  if (gameUrl) {
    res.redirect(`/?gameUrl=${encodeURIComponent(gameUrl)}`);
  } else {
    res.send("Failed to start challenge. Please try again.");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
