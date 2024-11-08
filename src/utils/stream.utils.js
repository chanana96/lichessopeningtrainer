const readline = require("readline");

const createStreamReader = () => {
  const readStream = (stream, onLine, onError) => {
    const rl = readline.createInterface({
      input: stream,
      crlfDelay: Infinity,
    });

    rl.on("line", (line) => {
      if (line.trim()) {
        try {
          const data = JSON.parse(line);
          onLine(data);
        } catch (err) {
          onError?.(new Error(`Failed to parse stream data: ${err.message}`));
        }
      }
    });

    rl.on("error", (error) => {
      onError?.(error);
    });

    return {
      destroy: () => rl.close(),
    };
  };

  return { readStream };
};

module.exports = createStreamReader;
