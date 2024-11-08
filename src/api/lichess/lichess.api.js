const createLichessApi = ({ axios, config }) => {
  const streamEvent = async () => {
    try {
      const response = await axios.get("https://lichess.org/api/stream/event", {
        headers: {
          Authorization: `Bearer ${config.tokens.bot}`,
        },
        responseType: "stream",
      });
      return {
        stream: response.data,
        destroy: () => response.data.destroy(),
        onError: (handler) => response.data.on("error", handler),
        onData: (handler) => response.data.on("data", handler),
      };
    } catch (error) {
      console.error("Event stream creation failed:", error.message);
      throw error;
    }
  };
  const streamGame = async (challengeId) => {
    try {
      const response = await axios.get(
        `https://lichess.org/api/bot/game/stream/${challengeId}`,
        {
          headers: {
            Authorization: `Bearer ${config.tokens.bot}`,
            "Content-Type": "application/x-ndjson",
          },
          responseType: "stream",
        }
      );

      // Return the stream for service layer to handle
      return {
        stream: response.data,
        destroy: () => response.data.destroy(),
        onError: (handler) => response.data.on("error", handler),
        onData: (handler) => response.data.on("data", handler),
      };
    } catch (error) {
      console.error("Game stream creation failed:", error.message);
      throw error;
    }
  };
  const sendChallenge = async (startingPositionFen, playerColorChoice) => {
    try {
      await axios.post(
        "https://lichess.org/api/challenge/lobster_bot",
        {
          "clock.limit": 300,
          "clock.increment": 5,
          color: playerColorChoice,
          variant: "standard",
          fen: startingPositionFen,
        },
        {
          headers: {
            Authorization: `Bearer ${config.tokens.user}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
    } catch (error) {
      console.error("Challenge creation failed:", error.message);
      throw error;
    }
  };
  const acceptChallenge = async (challengeId) => {
    try {
      const response = await axios.post(
        `https://lichess.org/api/challenge/${challengeId}/accept`,
        {
          challengeId: challengeId,
        },
        {
          headers: {
            Authorization: `Bearer ${config.tokens.bot}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to accept challenge", error.messsage);
    }
  };
  const sendChat = async (gameId, text) => {
    try {
      await axios.post(
        `https://lichess.org/api/bot/game/${gameId}/chat`,
        {
          room: "player",
          text: text,
        },
        {
          headers: {
            Authorization: `Bearer ${config.tokens.bot}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
    } catch (error) {
      console.error("Failed to send chat:", error.messsage);
    }
  };
  const makeMove = async (gameId, move) => {
    try {
      const response = await axios.post(
        `https://lichess.org/api/bot/game/${gameId}/move/${move}`,
        { gameId, move },
        {
          headers: {
            Authorization: `Bearer ${config.tokens.bot}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Move execution failed:", error.message);
      throw error;
    }
  };
  const resign = async (gameId) => {
    try {
      const response = await axios.post(
        `https://lichess.org/api/bot/game/${gameId}/resign`,
        {
          gameId: gameId,
        },
        {
          headers: {
            Authorization: `Bearer ${config.tokens.bot}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to resign:", error.messsage);
    }
  };

  return {
    sendChallenge,
    acceptChallenge,
    sendChat,
    makeMove,
    streamGame,
    streamEvent,
    resign,
  };
};

module.exports = createLichessApi;
