import { ChatSettingModel } from "./bot.settings.model";

export const createChatSetting = async (data: any) => {
  let setting = await ChatSettingModel.findOne({ botId: data.botId });
  if (setting) return setting;
  return ChatSettingModel.create(data);
};

export const getChatSetting = async (botId: string) => {
  return ChatSettingModel.findOne({ botId });
};

export const updateChatSetting = async (chatBotId: string, update: any) => {
  // Merge update with existing document
  return ChatSettingModel.findOneAndUpdate(
    { botId: chatBotId },
    { $set: update },
    { new: true, upsert: true }
  );
};

export const deleteChatSetting = async (botId: string) => {
  return ChatSettingModel.findOneAndDelete({ botId });
};