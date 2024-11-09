const createFindMovesApi = ({ axios, config }) => {
  if (!axios) throw new Error("Axios instance is required");
  if (!config?.tokens?.bot) throw new Error("Bot token is required");
  if (!config?.tokens?.user) throw new Error("User token is required");

  const getExplorerMoves = async (cleanedUciCode, fenCode) => {
    try {
      const response = await axios.get("https://explorer.lichess.ovh/lichess", {
        params: {
          variant: "standard",
          play: cleanedUciCode,
          fen: fenCode,
          speeds: config.lichess.speeds,
          ratings: config.lichess.ratings,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching data:");
      throw error;
    }
  };

  const getStockfishMoves = async (arrayedUci, fenCode) => {
    try {
      const response = await axios.post(
        `https://engine.lichess.ovh/api/external-engine/${config.stockfish.id}/analyse`,
        {
          clientSecret: config.stockfish.clientSecret,
          work: {
            sessionId: "getbotplaymove",
            threads: 4,
            hash: 128,
            multiPv: 1,
            variant: "chess",
            initialFen: fenCode,
            moves: arrayedUci,
            movetime: 5,
            depth: 25,
            nodes: 10000,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${config.tokens.bot}`,
            "Content-Type": "application/json",
          },
          responseType: "stream",
        }
      );

      return new Promise((resolve, reject) => {
        const streamReader = createStreamReader();

        const handleLine = (json) => {
          if (json.pvs?.[0]?.moves?.length > 0) {
            const firstMove = json.pvs[0].moves[0];
            console.log("First move found:", firstMove);
            resolve(firstMove);
            return true;
          }
          return false;
        };

        const handleError = (error) => {
          console.error("Stream error:", error.message);
          reject(error);
        };

        const stream = streamReader.readStream(
          response.data,
          handleLine,
          handleError
        );

        response.data.on("end", () => stream.destroy());
      });
    } catch (error) {
      console.error("Error fetching data:", error.message);
      throw error;
    }
  };
  return {
    getExplorerMoves,
    getStockfishMoves,
  };
};

module.exports = createFindMovesApi;
