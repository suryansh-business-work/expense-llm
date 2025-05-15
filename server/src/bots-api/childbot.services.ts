import { ChildBotModel, UserBotMappingModel } from './childbot.models';
import mongoose from 'mongoose';

export const createChildBot = async (userId: string, data: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const bot = await ChildBotModel.create([data], { session });
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
