import { PromptModel } from './prompt.models';

export const updateBotPrompt = async (chatBotId: string, prompt: any[], upsert = false) => {
  return PromptModel.findOneAndUpdate(
    { botId: chatBotId },
    { $set: { prompt, botId: chatBotId } },
    { new: true, upsert }
  );
};

export const getBotPrompt = async (chatBotId: string) => {
  return PromptModel.findOne({ botId: chatBotId }, { prompt: 1, _id: 0 });
};
