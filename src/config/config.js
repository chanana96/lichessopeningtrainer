const config = {
  lichess: {
    useExplorer: true,
    speeds: ["blitz", "rapid", "classical"],
    ratings: [2000],
  },
  tokens: {
    bot: process.env.BOT_TOKEN,
    user: process.env.USER_TOKEN,
  },
  stockfish: {
    id: process.env.STOCKFISH_ID,
    clientSecret: process.env.STOCKFISH_CLIENTSECRET,
  },
  chat: {
    id: process.env.STOCKFISH_CHAT_ID,
    clientSecret: process.env.STOCKFISH_CHAT_CLIENTSECRET,
  },
};

module.exports = config;
