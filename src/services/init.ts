import { databaseService, DBService } from './database';
import { OperationService } from './operations';
import { Tokens } from './tokens';
// import { UsersService } from './users';

export interface IServices {
  operations: OperationService;
  tokens: Tokens;
  database: DBService;
  // users: UsersService;
}

export const InitServices = async (): Promise<IServices> => {
  const operations = new OperationService({ database: databaseService });
  const tokens = new Tokens({ database: databaseService, operations });
  // const users = new UsersService({ database: databaseService, operations });

  return {
    operations,
    database: databaseService,
    tokens,
    // users
  };
};
