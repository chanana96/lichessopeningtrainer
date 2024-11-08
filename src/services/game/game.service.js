const getGameService = (lichessApi, eventEmitter, config) => {
  const startEventStream = async () => {
    try {
      const stream = await lichessApi.streamEvent();
      stream.setLineHandler((event) => {
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
      const response = await lichessApi.sendChallenge(opponent);
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
  const handleGameStarted = async (challengeId) => {
    try {
      const stream = await lichessApi.streamGame(challengeId);
      stream.setLineHandler((event) => {
        switch (event.type) {
          case "gameFull":
            eventEmitter.emit("gameFull", event.challenge.id);
            break;
          case "gameState":
            eventEmitter.emit("gameState", {
              gameId: event.game.id,
              isMyTurn: event.game.isMyTurn,
              fen: event.game.fen,
            });
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
  const handleGameFull = async (event) => {
    if (event.game.isMyTurn) {
      eventEmitter.emit("findMove", {
        moves: event.state.moves,
        fen: event.game.fen,
        gameId: event.game.id,
      });
    }
  };

  const handleMoveFound = async (gameId, move) => {
    try {
      const response = await lichessApi.makeMove(gameId, move);
      return response;
    } catch (error) {
      console.error("Move execution failed:", error.message);
      throw error;
    }
  };
  return {
    startEventStream,
    sendChallenge,
    handleChallengeReceived,
    handleGameFull,
    handleGameStarted,
    handleMoveFound,
  };
};
