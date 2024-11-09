const express = require("express");
const router = express.Router();

module.exports = (services, fenCodes) => {
  // Home page with game status
  router.get("/", (req, res) => {
    const gameUrl = req.query.gameUrl;
    res.send(`
      <html>
        <body>
          <h1>Welcome to Lichess Bot</h1>
          <button onclick="location.href='/challenge'">Create Challenge</button>
          ${
            gameUrl
              ? `<p>Challenge created! <a href="${gameUrl}" target="_blank">Open Game</a></p>`
              : ""
          }
        </body>
      </html>
    `);
  });

  // Challenge creation form
  router.get("/challenge", (req, res) => {
    const fenOptions = Object.keys(fenCodes)
      .map((key) => `<option value="${key}">${key}</option>`)
      .join("");

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

  // Handle challenge creation
  router.post("/challenge", async (req, res) => {
    try {
      const { fenCode, color } = req.body;
      const startingFen = fenCodes[fenCode]?.default || fenCodes.default;

      const gameUrl = await services.game.sendChallenge(startingFen, color);
      res.redirect(`/?gameUrl=${encodeURIComponent(gameUrl)}`);
    } catch (error) {
      res.status(500).send("Failed to create challenge");
    }
  });

  return router;
};
