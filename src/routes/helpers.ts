import { DBService } from '../services/database';
import * as bcrypt from 'bcryptjs';

export const asyncHandler = fn => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

type TExtendError = Error & { status?: number };

export const createError = (status: number, message: string): TExtendError => {
  const error: TExtendError = new Error(message);
  error.status = status;

  return error;
};

const asyncValidate = async (userSecret, dbSecret) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(userSecret, dbSecret, (err, result) => {
      if (err) {
        reject(err);
      }

      if (result) {
        resolve(result);
      } else {
        reject('Wrong secret string');
      }
    });
  });
};

export const checkAuth = async (secret: string, database: DBService) => {
  if (!secret) {
    throw createError(403, 'Wrong secret string');
  }

  const config = await database.getCollectionData('config');

  if (config && config[0] && config[0].password) {
    return await asyncValidate(secret, config[0].password);
  }

  throw createError(403, 'Admin operations disabled');
};
