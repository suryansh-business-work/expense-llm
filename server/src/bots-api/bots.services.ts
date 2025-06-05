import { BotModel, UserBotMappingModel } from './bots.models';
import mongoose from 'mongoose';

export const createBot = async (userId: string, data: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // 1. Create the bot
    const bot = await BotModel.create([data], { session });

    // 2. Create the user-bot mapping
    await UserBotMappingModel.create([{
      userId,
      botId: bot[0].botId,
      ownerId: userId,
      canEdit: true,
      canDelete: true,
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

export const updateBot = async (botId: string, data: any) => {
  return BotModel.findOneAndUpdate({ botId }, { $set: data }, { new: true });
};

export const deleteBot = async (botId: string, userId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Only owner or user with canDelete can delete
    const mapping = await UserBotMappingModel.findOne({ botId, userId });
    if (!mapping || (!mapping.canDelete && String(mapping.ownerId) !== String(userId))) {
      throw new Error('Not authorized to delete this bot');
    }
    await BotModel.deleteOne({ botId }, { session });
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

export const listBotsForUser = async (userId: string) => {
  try {
    const bots = await UserBotMappingModel.aggregate([
      { $match: { userId } },
      {
        $lookup: {
          from: 'bots',
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

export const listBotsForUserByCategory = async (userId: string) => {
  return UserBotMappingModel.aggregate([
    { $match: { userId } },
    {
      $lookup: {
        from: 'bots',
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
};

export const getBotById = async (botId: string) => {
  return BotModel.findOne({ botId });
};
