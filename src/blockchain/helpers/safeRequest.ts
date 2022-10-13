// import { sleep } from '../utils';
// import logger from '../../logger';
// const log = logger.module('validator:safeRequest');

const MAX_ATTEMPTS = 10;
const SLEEP_TIME = 30000;

export const safeRequest = async (
  requestFunction: () => Promise<any>,
  errorLabel: string,
  defaultValue?: any
) => {
  // let res = defaultValue;
  // let isStatusSuccess = false;
  // let maxAttempts = MAX_ATTEMPTS;
  // let error;

  return await requestFunction();

  // while (!isStatusSuccess && maxAttempts > 0) {
  //   try {
  //     res = await requestFunction();
  //
  //     isStatusSuccess = true;
  //   } catch (e) {
  //     error = e;
  //
  //     // log.warn(`safeRequest Warn ${errorLabel}`, { error: error });
  //
  //     maxAttempts = maxAttempts - 1;
  //     isStatusSuccess = false;
  //     await sleep(SLEEP_TIME);
  //   }
  // }
  //
  // if (!isStatusSuccess) {
  //   log.error(`1 safeRequest Error ${errorLabel}`, { error: error });
  // }
  //
  // return res;
};
