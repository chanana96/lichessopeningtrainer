const axios = require("axios");
const speeds = ["blitz", "rapid", "classical"];
const ratings = [2000];
const eventEmitter = require("./eventEmitter");
require("dotenv").config();

// const stockfishId = process.env.STOCKFISH_ID;
// const stockfishClientSecret = process.env.STOCKFISH_CLIENTSECRET;
// const botToken = process.env.BOT_TOKEN;
// const stockfishChatId = process.env.STOCKFISH_CHAT_ID;
// const stockfishChatClientSecret = process.env.STOCKFISH_CHAT_CLIENTSECRET;

// const cleanUciCode = async (uciCode) => {
//   return uciCode.replace(/ +/g, ",");
// };
// const uciToArray = async (uciCode) => {
//   return uciCode.split(/\s+/);
// };
// let useExplorer = true;

// const getExplorerMoves = async (uciCode, fenCode, gameId) => {
//   try {
//     // Check if the explorer should be queried
//     if (useExplorer) {
//       let response;
//       if (uciCode !== undefined) {
//         const cleanedUciCode = await cleanUciCode(uciCode);
//         response = await axios.get("https://explorer.lichess.ovh/lichess", {
//           params: {
//             variant: "standard",
//             play: cleanedUciCode,
//             fen: fenCode,
//             speeds: speeds,
//             ratings: ratings,
//           },
//         });
//       } else {
//         response = await axios.get("https://explorer.lichess.ovh/lichess", {
//           params: {
//             variant: "standard",
//             fen: fenCode,
//             speeds: speeds,
//             ratings: ratings,
//           },
//         });
//       }

//       // Check if the explorer returned any moves
//       if (response.data.moves.length === 0) {
//         if (useExplorer) {
//           useExplorer = false;
//           // Emit an event to trigger the sendChat function in axios.js
//           console.log("Emitting 'sendChat' event..." + gameId);
//           eventEmitter.emit(
//             "sendChat",
//             gameId,
//             "No more moves found in the Lichess explorer. Switching to Stockfish analysis."
//           );
//         }

//         const result = await getStockfishMove(uciCode, fenCode);
//         return result;
//       }
//       return filterMoves(response.data.moves);
//     } else {
//       const result = await getStockfishMove(uciCode, fenCode);
//       return result;
//     }
//   } catch (error) {
//     console.error("Error fetching data:", error.message);
//   }
// };

// const filterMoves = async (moves) => {
//   try {
//     // No need to map to an array of UCI strings; return the full move objects
//     console.log(moves); // Log the moves for debugging
//     return getMove(moves); // Pass the full move objects to getMove
//   } catch (error) {
//     console.error("Error fetching data:", error.message);
//   }
// };

// const getMove = async (moves) => {
//   try {
//     // Return the only element if the array has one item
//     if (moves.length === 1) return moves[0].uci;
//     const weights = moves.map((move) => move.white + move.draws + move.black);
//     const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

//     if (totalWeight === 0) {
//       console.error("Total weight is zero. Unable to compute probabilities.");
//       return null; // Handle the case where total weight is zero
//     }

//     // Normalize weights to get probabilities
//     const probabilities = weights.map((weight) => weight / totalWeight);

//     // Calculate percentages for logging
//     const percentages = probabilities.map((prob) => (prob * 100).toFixed(2)); // Convert to percentage

//     // Log percentages for each move
//     moves.forEach((move, index) => {
//       console.log(`Move: ${move.uci}, Percentage: ${percentages[index]}%`);
//     });

//     const threshold = Math.random();
//     console.log(`Random threshold = ${threshold}`);

//     let cumulativeProbability = 0;
//     for (let i = 0; i < probabilities.length; i++) {
//       cumulativeProbability += probabilities[i];
//       console.log(
//         `Cumulative Probability for move ${i}: ${cumulativeProbability}`
//       );
//       if (threshold <= cumulativeProbability) {
//         return moves[i].uci; // Return the UCI of the selected move
//       }
//     }

//     console.warn(
//       "No move selected. This should not happen if probabilities are correct."
//     );
//   } catch (error) {
//     console.error("Error selecting move:", error.message);
//   }
// };

const getBestMove = async (moves, fenCode) => {
  moves = await uciToArray(moves);
  try {
    const response = await axios.post(
      `https://engine.lichess.ovh/api/external-engine/${stockfishChatId}/analyse`,
      {
        clientSecret: stockfishChatClientSecret,
        work: {
          sessionId: "getbestmoveforplayer",
          threads: 4,
          hash: 128,
          multiPv: 1,
          variant: "chess",
          initialFen: fenCode,
          moves: moves.slice(0, -1),
          movetime: 5,
          depth: 25,
          nodes: 10000,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${botToken}`,
          "Content-Type": "application/json",
        },
        responseType: "stream",
      }
    );

    console.log(`moves array = ${moves.slice(0, -1)}`);

    // Listen for data
    return new Promise((resolve, reject) => {
      response.data.on("data", (chunk) => {
        const chunkStr = chunk.toString();
        const lines = chunkStr.split("\n");

        for (const line of lines) {
          if (line.trim()) {
            try {
              const json = JSON.parse(line);

              // Check if there are moves available
              if (
                json.pvs &&
                json.pvs[0] &&
                json.pvs[0].moves &&
                json.pvs[0].moves.length > 0
              ) {
                const firstMove = json.pvs[0].moves[0]; // Get the first move
                console.log("First move found:", firstMove);

                // Resolve the promise with the first move and stop listening
                resolve(firstMove);
                response.data.destroy(); // Stop reading the stream
                return; // Exit the for loop
              }
            } catch (err) {
              console.error("Error parsing JSON line:", err);
            }
          }
        }
      });

      response.data.on("error", (error) => {
        reject("Error reading stream:", error);
      });
    });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    throw error; // Rethrow the error to be caught by the calling function
  }
};

const getStockfishMove = async (moves, fenCode) => {
  moves = await uciToArray(moves);
  try {
    console.log(moves);
    const response = await axios.post(
      `https://engine.lichess.ovh/api/external-engine/${stockfishId}/analyse`,
      {
        clientSecret: stockfishClientSecret,
        work: {
          sessionId: "getbotplaymove",
          threads: 4,
          hash: 128,
          multiPv: 1,
          variant: "chess",
          initialFen: fenCode,
          moves: moves, //array
          movetime: 5,
          depth: 25,
          nodes: 10000,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${botToken}`,
          "Content-Type": "application/json",
        },
        responseType: "stream",
      }
    );
    // Listen for data
    return new Promise((resolve, reject) => {
      response.data.on("data", (chunk) => {
        const chunkStr = chunk.toString();
        const lines = chunkStr.split("\n");

        for (const line of lines) {
          if (line.trim()) {
            try {
              const json = JSON.parse(line);

              // Check if there are moves available
              if (
                json.pvs &&
                json.pvs[0] &&
                json.pvs[0].moves &&
                json.pvs[0].moves.length > 0
              ) {
                const firstMove = json.pvs[0].moves[0]; // Get the first move
                console.log("First move found:", firstMove);

                // Resolve the promise with the first move and stop listening
                resolve(firstMove);
                response.data.destroy(); // Stop reading the stream
                return; // Exit the for loop
              }
            } catch (err) {
              console.error("Error parsing JSON line:", err);
            }
          }
        }
      });

      response.data.on("error", (error) => {
        reject("Error reading stream:", error);
      });
    });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    throw error; // Rethrow the error to be caught by the calling function
  }
};

module.exports = { getExplorerMoves, getBestMove };
