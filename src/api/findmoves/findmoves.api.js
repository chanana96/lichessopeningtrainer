const createFindMovesApi = ({ axios, config }) => {
  if (!axios) throw new Error("Axios instance is required");
  if (!config?.tokens?.bot) throw new Error("Bot token is required");
  if (!config?.tokens?.user) throw new Error("User token is required");

  const getExplorerMoves = async (cleanedUciCode, fenCode) => {
    try {
      axios.get("https://explorer.lichess.ovh/lichess", {
        params: {
          variant: "standard",
          play: cleanedUciCode,
          fen: fenCode,
          speeds: config.lichess.speeds,
          ratings: config.lichess.ratings,
        },
      });
    } catch (error) {
      console.error("Error fetching data:", error.message);
      throw error;
    }
  };
  return {
    getExplorerMoves,
  };
};

module.exports = createFindMovesApi;
