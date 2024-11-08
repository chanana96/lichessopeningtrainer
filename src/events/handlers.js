const createEventHandlers = ({ chatService }) => {
  const handleSendChat = async (gameId, text) => {
    await chatService.sendMessage(gameId, text);
  };

  return {
    handleSendChat,
  };
};

module.exports = createEventHandlers;
