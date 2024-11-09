const createGameService = ({ lichessApi, eventEmitter, config }) => {
  const gameData = {
    id: null,
    isMyTurn: null,
    fen: null,
  };

  const startEventStream = async () => {
    try {
      const stream = await lichessApi.streamEvent();

      stream.setLineHandler((event) => {
        console.log(event);
        switch (event.type) {
          case "challenge":
            eventEmitter.emit("challengeReceived", event.challenge.id);
            break;
          case "gameStart":
            eventEmitter.emit("gameStarted", {
              gameId: event.game.id,
              isMyTurn: event.game.isMyTurn,
              fen: event.game.fen,
            });
            break;
        }
      });
    } catch (error) {
      console.error("Failed to stream event:", error.message);
      throw error;
    }
  };
  const sendChallenge = async (startingPositionFen, playerColorChoice) => {
    try {
      const response = await lichessApi.sendChallenge(
        startingPositionFen,
        playerColorChoice
      );
      return response;
    } catch (error) {
      console.error("Failed to send challenge:", error.message);
      throw error;
    }
  };
  const handleChallengeReceived = async (challengeId) => {
    try {
      const response = await lichessApi.acceptChallenge(challengeId);
      return response;
    } catch (error) {
      console.error("Failed to accept challenge:", error.message);
      throw error;
    }
  };
  const handleGameStarted = async (data) => {
    try {
      gameData.isMyTurn = data.isMyTurn;
      gameData.fen = data.fen;
      gameData.id = data.gameId;

      const stream = await lichessApi.streamGame(data.gameId);
      if (gameData.isMyTurn) {
        eventEmitter.emit("findMove", {
          uciCode: "",
          fenCode: gameData.fen,
          gameId: gameData.id,
        });
      }
      stream.setLineHandler((event) => {
        console.log(event.type);
        switch (event.type) {
          case "gameState":
            if (event.status === "started")
              eventEmitter.emit("gameState", event);

            break;
          case "gameFinish":
            eventEmitter.emit("gameFinished", event.challenge.id);
            break;
        }
      });
    } catch (error) {
      console.error("Failed to stream game:", error.message);
      throw error;
    }
  };

  const handleGameState = async (event) => {
    if (gameData.isMyTurn) {
      eventEmitter.emit("findMove", {
        uciCode: event.moves,
        fenCode: gameData.fen,
        gameId: gameData.id,
      });
    } else {
      gameData.isMyTurn = !gameData.isMyTurn;
      return;
    }
  };
  const handleMoveFound = async ({ gameId, move }) => {
    try {
      const response = await lichessApi.makeMove({ gameId, move });
      if (response?.data?.ok) {
        gameData.isMyTurn = !gameData.isMyTurn;
      }
    } catch (error) {
      console.error("Move execution failed:", error.message);
      throw error;
    }
  };
  return {
    startEventStream,
    sendChallenge,
    handleChallengeReceived,
    handleGameState,
    handleGameStarted,
    handleMoveFound,
  };
};

module.exports = createGameService;
