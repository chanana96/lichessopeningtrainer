// const axios = require("axios");
// require("dotenv").config();
// const { getExplorerMoves, getBestMove } = require("./explorer");
// const botToken = process.env.BOT_TOKEN;
// const userToken = process.env.USER_TOKEN;
// const readline = require("readline");
// const eventEmitter = require("./eventEmitter");

// eventEmitter.on("sendChat", async (gameId, text) => {
//   await sendChat(gameId, text);
// });

// // const sendChat = async (gameId, text) => {
// //   try {
// //     await axios.post(
// //       `https://lichess.org/api/bot/game/${gameId}/chat`,
// //       {
// //         room: "player",
// //         text: text,
// //       },
// //       {
// //         headers: {
// //           Authorization: `Bearer ${botToken}`,
// //           "Content-Type": "application/x-www-form-urlencoded",
// //         },
// //       }
// //     );
// //   } catch (error) {
// //     console.error(error.messsage);
// //   }
// // };
// const streamEvent = async () => {
//   try {
//     // const response = await axios.get("https://lichess.org/api/stream/event", {
//     //   headers: {
//     //     Authorization: `Bearer ${botToken}`,
//     //   },
//     //   responseType: "stream", // Ensure Axios treats the response as a stream
//     // });

//     // Use readline to handle new lines (NDJSON format)
//     const rl = readline.createInterface({
//       input: response.data,
//       crlfDelay: Infinity,
//     });

//     // Listen for each line in the stream
//     rl.on("line", (line) => {
//       if (line.trim()) {
//         // Ignore empty lines
//         const event = JSON.parse(line); // Parse each JSON line
//         console.log("Event received:", event);

//         // Handle the event type as needed
//         switch (event.type) {
//           case "gameStart":
//             streamGameState(
//               event.game.gameId,
//               event.game.isMyTurn,
//               event.game.fen
//             );
//             break;
//           case "gameFinish":
//             console.log("Game finished:", event);
//             break;
//           case "challenge":
//             acceptChallenge(event.challenge.id);
//             break;
//           case "challengeCanceled":
//             console.log("Challenge canceled:", event);
//             break;
//           case "challengeDeclined":
//             console.log("Challenge declined:", event);
//             break;
//           default:
//             console.log("Unknown event type:", event);
//         }
//       }
//     });

//     // Handle errors in the stream
//     response.data.on("error", (error) => {
//       console.error("Stream error:", error.messsage);
//     });
//   } catch (error) {
//     console.error("Error fetching stream data:", error.messsage);
//   }
// };
// const acceptChallenge = async (challengeId) => {
//   // try {
//   //   await axios.post(
//   //     `https://lichess.org/api/challenge/${challengeId}/accept`,
//   //     {
//   //       challengeId: challengeId,
//   //     },
//   //     {
//   //       headers: {
//   //         Authorization: `Bearer ${botToken}`,
//   //         "Content-Type": "application/json",
//   //       },
//   //     }
//   //   );
//   // } catch (error) {
//   //   console.error("Error fetching data:", error.messsage);
//   // }
// };
// // const resign = async (gameId) => {
// //   try {
// //     await axios.post(
// //       `https://lichess.org/api/bot/game/${gameId}/resign`,
// //       {
// //         gameId: gameId,
// //       },
// //       {
// //         headers: {
// //           Authorization: `Bearer ${botToken}`,
// //           "Content-Type": "application/json",
// //         },
// //       }
// //     );
// //   } catch (error) {
// //     console.error(error.messsage);
// //   }
// // };

// const streamGameState = async (challengeId, isMyTurn, initialFen) => {
//   try {
//     // const response = await axios.get(
//     //   `https://lichess.org/api/bot/game/stream/${challengeId}`,

//     //   {
//     //     headers: {
//     //       Authorization: `Bearer ${botToken}`,
//     //       "Content-Type": "application/x-ndjson",
//     //     },
//     //     responseType: "stream",
//     //   }
//     // );
//     let move;
//     let id;
//     let turnOnOddMoveLength = isMyTurn;

//     const handleEvent = async (event) => {
//       switch (event.type) {
//         case "gameFull":
//           id = event.id;
//           move = await getExplorerMoves(event.state.moves, initialFen, id);

//           await playMove(id, move);
//           break;
//         case "gameState":
//           console.log(event);
//           if (
//             !Number.isInteger(event.moves.length / 2) === turnOnOddMoveLength
//           ) {
//             const bestMove = await getBestMove(
//               event.moves,
//               initialFen,
//               event.id
//             ); // Get the function
//             await sendChat(id, `Best move was ${bestMove}`);
//             move = await getExplorerMoves(event.moves, initialFen, id);
//             await playMove(id, move);
//           }
//           break;
//         case "gameFinish":
//           console.log("Game finished:", event);
//           break;

//         default:
//           console.log("Unknown event type:", event);
//       }
//     };
//     // Use readline to handle new lines (NDJSON format)
//     const rl = readline.createInterface({
//       input: response.data,
//       crlfDelay: Infinity,
//     });
//     rl.on("line", (line) => {
//       if (line.trim()) {
//         // Ignore empty lines
//         const event = JSON.parse(line); // Parse each JSON line
//         console.log("Event received:", event);

//         // Handle the event type as needed
//         handleEvent(event);
//       }
//     });

//     // Handle errors in the stream
//     response.data.on("error", (error) => {
//       console.error("Stream error:", error.messsage);
//     });
//   } catch (error) {
//     console.error("Error fetching data:", error.messsage);
//   }
// };

// const sendChallenge = async (startingPositionFen, playerColorChoice) => {
//   try {
//     // const response = await axios.post(
//     //   `https://lichess.org/api/challenge/lobster_bot`,
//     //   {
//     //     "clock.limit": 300,
//     //     "clock.increment": 5,
//     //     color: playerColorChoice,
//     //     variant: "standard",
//     //     fen: startingPositionFen,
//     //   },
//     //   {
//     //     headers: {
//     //       Authorization: `Bearer ${userToken}`,
//     //       "Content-Type": "application/x-www-form-urlencoded",
//     //     },
//     //   }
//     // );
//     console.log("challenge sent:", response.data);
//     return response.data.url;
//   } catch (error) {
//     console.error(error.messsage);
//     return null;
//   }
// };

// const playMove = async (gameId, move) => {
//   try {
//     // await axios.post(
//     //   `https://lichess.org/api/bot/game/${gameId}/move/${move}`,
//     //   {
//     //     gameId: gameId,
//     //     move: move,
//     //   },
//     //   {
//     //     headers: {
//     //       Authorization: `Bearer ${botToken}`,
//     //       "Content-Type": "application/json",
//     //     },
//     //   }
//     // );
//   } catch (error) {
//     console.error(error.messsage);
//   }
// };

// module.exports = { streamEvent, sendChallenge, streamGameState };
