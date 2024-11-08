const getExplorerService = (findMovesApi, eventEmitter, config) => {
  const cleanUciCode = async (uciCode) => {
    return uciCode.replace(/ +/g, ",");
  };

  const uciToArray = async (uciCode) => {
    return uciCode.split(/\s+/);
  };

  /**
   * Selects a move based on weighted probabilities
   * @param {Array<{uci: string, white: number, draws: number, black: number}>} moves
   * @returns {string}
   * @throws {Error}
   */
  const getMove = async (moves) => {
    try {
      if (!moves || !Array.isArray(moves)) {
        throw new Error("Invalid moves input");
      }
      // Return the only element if the array has one item
      if (moves.length === 1) return moves[0].uci;
      const weights = moves.map((move) => move.white + move.draws + move.black);
      const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

      if (totalWeight === 0) {
        console.error("Total weight is zero. Unable to compute probabilities.");
        return null; // Handle the case where total weight is zero
      }

      // Normalize weights to get probabilities
      const probabilities = weights.map((weight) => weight / totalWeight);

      // Calculate percentages for logging
      const percentages = probabilities.map((prob) => (prob * 100).toFixed(2)); // Convert to percentage

      // Log percentages for each move
      moves.forEach((move, index) => {
        console.log(`Move: ${move.uci}, Percentage: ${percentages[index]}%`);
      });

      const threshold = Math.random();
      console.log(`Random threshold = ${threshold}`);

      let cumulativeProbability = 0;
      for (let i = 0; i < probabilities.length; i++) {
        cumulativeProbability += probabilities[i];
        console.log(
          `Cumulative Probability for move ${i}: ${cumulativeProbability}`
        );
        if (threshold <= cumulativeProbability) {
          return moves[i].uci; // Return the UCI of the selected move
        }
      }

      console.warn(
        "No move selected. This should not happen if probabilities are correct."
      );
    } catch (error) {
      console.error("Error selecting move:", error.message);
      throw error;
    }
  };

  /**
   * Filters and processes moves from explorer
   * @param {Array} moves
   * @returns {Promise<string>}
   */
  // const filterMoves = async (moves) => {
  //   try {
  //     return getMove(moves); // Pass the full move objects to getMove
  //   } catch (error) {
  //     console.error("Error fetching data:", error.message);
  //   }
  // };

  /**
   * Gets moves from explorer or falls back to stockfish
   * @param {string} uciCode
   * @param {string} fenCode
   * @param {string} gameId
   * @returns {Promise<string>}
   */
  const getMoveFromExplorer = async (uciCode, fenCode) => {
    const cleanedUci = uciCode ? await cleanUciCode(uciCode) : undefined;
    const response = await findMovesApi.getExplorerMoves(cleanedUci, fenCode);
    return response.data.moves;
  };
  const handleFindMove = async ({ uciCode, fenCode, gameId }) => {
    try {
      if (config.lichess.useExplorer) {
        const moves = await getMoveFromExplorer(uciCode, fenCode);

        if (moves.length === 0) {
          config.lichess.useExplorer = false;
          eventEmitter.emit(
            "sendChat",
            gameId,
            "No more moves found in the Lichess explorer. Switching to Stockfish analysis."
          );
          const move = getMove(uciCode, fenCode);
          eventEmitter.emit("moveFound", { gameId, move });
          return;
        }

        const move = getMove(moves);
        eventEmitter.emit("moveFound", { gameId, move });
      }
    } catch (error) {
      console.error("Failed to find move:", error);
      throw error;
    }

    return { handleFindMove };
  };
};
