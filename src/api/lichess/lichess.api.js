const createStreamReader = require("../../utils/stream.utils");

const createLichessApi = ({ axios, config }) => {
  if (!axios) throw new Error("Axios instance is required");
  if (!config?.tokens?.bot) throw new Error("Bot token is required");
  if (!config?.tokens?.user) throw new Error("User token is required");
  const streamReader = createStreamReader();

  const streamEvent = async () => {
    try {
      const response = await axios.get("https://lichess.org/api/stream/event", {
        headers: {
          Authorization: `Bearer ${config.tokens.bot}`,
        },
        responseType: "stream",
      });
      return streamReader.readStream(response.data, onEvent, (error) =>
        console.error("Stream error:", error.message)
      );
    } catch (error) {
      console.error("Failed to create stream:", error.message);
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

      return streamReader.readStream(response.data, onEvent, (error) =>
        console.error("Stream error:", error.message)
      );
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
      return;
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
      throw error;
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
      return;
    } catch (error) {
      console.error("Failed to send chat:", error.messsage);
      throw error;
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
      throw error;
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
