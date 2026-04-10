const getAlchemyApiKey = (): string => {
  const apiKey = process.env.ALCHEMY_API_KEY;

  if (!apiKey) {
    throw new Error('ALCHEMY_API_KEY is required');
  }

  return apiKey;
};

export const getAlchemyRpcUrl = (network: string): string => {
  return `https://${network}.g.alchemy.com/v2/${getAlchemyApiKey()}`;
};
