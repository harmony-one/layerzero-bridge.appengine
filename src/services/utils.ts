import { randomBytes } from '@harmony-js/crypto/dist/random';

export const uuidv4 = () => {
  return [randomBytes(4), randomBytes(4), randomBytes(4), randomBytes(4)].join('-');
};

const payloadKeys = [
  'gas',
  'gasPrice',
  'gasUsed',
  'gasLimit',
  'blockHash',
  'blockNumber',
  'transactionHash',
  'hrc20Address',
];

export function clearPayload(obj: any) {
  const newObj = payloadKeys.reduce((acc: any, key: string) => {
    if (obj[key]) {
      acc[key] = String(obj[key]);
    }

    return acc;
  }, {});

  return newObj;
}
