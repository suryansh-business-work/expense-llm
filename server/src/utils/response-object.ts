import { statusCode, statusMessage } from '../enums/status';

export const noContentResponse = (res: any, data: any, message = 'No data found') => {
  return res.status(statusCode.NO_CONTENT).json({
    message: message,
    data: data,
    status: statusMessage.NO_CONTENT,
    statusCode: statusCode.NO_CONTENT
  })
}

export const successResponse = (res: any, data: any, message = 'Operation Successfull') => {
  return res.status(statusCode.SUCCESS).json({
    message: message,
    data: data,
    status: statusMessage.SUCCESS,
    statusCode: statusCode.SUCCESS
  })
}

export const successResponseArr = (res: any, data: any, paginationData = {}, message = 'Operation Successfull') => {
  return res.status(statusCode.SUCCESS).json({
    message: message,
    data: data,
    columns: data.length > 0 ? [] : [],
    paginationData: paginationData,
    status: statusMessage.SUCCESS,
    statusCode: statusCode.SUCCESS
  })
}

export const errorResponse = (res: any, error: any, message = 'Something went wrong') => {
  const response = {
    message: message,
    data: error,
    status: statusMessage.ERROR,
    statusCode: statusCode.ERROR
  }
  // logger.error(error);
  return res.status(statusCode.ERROR).json(response)
}
