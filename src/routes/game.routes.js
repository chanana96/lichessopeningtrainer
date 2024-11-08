const express = require("express");
const router = express.Router();

module.exports = (services) => {
  router.get("/", async (req, res) => {
    try {
      await services.game.startEventStream();
      res.send("Game service started");
    } catch (error) {
      res.status(500).send("Failed to start game service");
    }
  });

  return router;
};
