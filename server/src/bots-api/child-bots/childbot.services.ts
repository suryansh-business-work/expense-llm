import { PromptModel } from '../../chat-api/chat-lab-apis/prompt/prompt.models';
import { ChatSettingModel } from '../../chat-api/chat-settings-api/bot.settings.model';
import { ChildBotModel, UserBotMappingModel } from './childbot.models';
import mongoose from 'mongoose';

// You may want to import your default settings structure:

export const createChildBot = async (userId: string, data: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // 1. Create the bot
    const bot = await ChildBotModel.create([data], { session });

    // 2. Create the user-bot mapping
    await UserBotMappingModel.create([{
      userId,
      botId: bot[0].botId,
      ownerId: userId,
      canEdit: true,
      canDelete: true,
    }], { session });

    // 3. Create default chat settings for this bot (do NOT import chatSettings, use structure below)
    await ChatSettingModel.create([{
      botId: bot[0].botId,
      advanced: {
        autoScroll: true,
        showTimestamps: true,
        showTypingIndicator: true,
      },
      appearance: {
        font: "Roboto",
        chatBackground: "#f5f7fa",
        bot: {
          bubble: {
            background: "#e3f2fd",
            textColor: "#7b4c6c",
            borderRadius: "10px",
            borderWidth: "1px",
            borderColor: "#e0e0e0",
          },
          avatar: {
            url: "",
            shape: "circle",
            size: "50px",
          },
        },
        user: {
          bubble: {
            background: "#fff",
            textColor: "#222",
            borderRadius: "10px",
            borderWidth: "1px",
            borderColor: "#e0e0e0",
          },
          avatar: {
            url: "",
            shape: "circle",
            size: "50px",
          },
        },
      },
      modelSetting: {
        model: "gpt-3.5-turbo",
        modelName: "gpt-3.5-turbo",
        modelType: "chat",
        modelDescription: "GPT-3.5 Turbo is a variant of the GPT-3 model that is optimized for chat-based applications.",
        modelVersion: {
          version: "v1",
          description: "The latest version of the GPT-3.5 Turbo model.",
          date: "2023-10-01",
          releaseNotes: {
            url: "https://platform.openai.com/docs/guides/gpt/release-notes",
            description: "Release notes for the latest version of the GPT-3.5 Turbo model.",
            label: "Release Notes",
            labelDescription: "Label for the link to the release notes for the latest version of the GPT-3.5 Turbo model.",
            labelDate: "2023-10-01",
          }
        },
        maxTokens: 512,
        fileUpload: {
          maxSize: 22,
          unit: "MB",
          valueInBytes: 23068672,
        },
      },
      report: {
        email: "",
        emailSubject: "Chatbot Report",
        format: "text",
        schedule: "daily",
        time: "09:00",
        timeZone: "UTC",
      },
    }], { session });

    // 4. Create default prompt for this bot
    await PromptModel.create([{
      botId: bot[0].botId,
      prompt: [
        {
          name: "Default Prompt",
          prompt: "How can I help you?",
          output: "",
          isUseForChat: true,
        }
      ]
    }], { session });

    await session.commitTransaction();
    return bot[0];
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const updateChildBot = async (botId: string, data: any) => {
  return ChildBotModel.findOneAndUpdate({ botId }, { $set: data }, { new: true });
};

export const deleteChildBot = async (botId: string, userId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Only owner or user with canDelete can delete
    const mapping = await UserBotMappingModel.findOne({ botId, userId });
    if (!mapping || (!mapping.canDelete && String(mapping.ownerId) !== String(userId))) {
      throw new Error('Not authorized to delete this bot');
    }
    await ChildBotModel.deleteOne({ botId }, { session });
    await UserBotMappingModel.deleteMany({ botId }, { session });
    await session.commitTransaction();
    return true;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const listChildBotsForUser = async (userId: string) => {
  try {
    const bots = await UserBotMappingModel.aggregate([
      { $match: { userId } }, // userId should be string if your schema is string
      {
        $lookup: {
          from: 'childbots', // check your actual collection name!
          localField: 'botId',
          foreignField: 'botId',
          as: 'bot',
        },
      },
      { $unwind: '$bot' },
      {
        $project: {
          _id: 0,
          botId: 1,
          ownerId: 1,
          canEdit: 1,
          canDelete: 1,
          sharedVia: 1,
          sharedIdentifier: 1,
          bot: 1,
        },
      },
    ]);
    console.log('Bots found:', bots.length);
    return bots;
  } catch (err) {
    console.error('Aggregation error:', err);
    throw err;
  }
};

export const listChildBotsForUserByType = async (userId: string, type: string) => {
  return UserBotMappingModel.aggregate([
    { $match: { userId } },
    {
      $lookup: {
        from: 'childbots',
        localField: 'botId',
        foreignField: 'botId',
        as: 'bot',
      },
    },
    { $unwind: '$bot' },
    { $match: { 'bot.type': type } },
    {
      $project: {
        _id: 0,
        botId: 1,
        ownerId: 1,
        canEdit: 1,
        canDelete: 1,
        sharedVia: 1,
        sharedIdentifier: 1,
        bot: 1,
      },
    },
  ]);
};
