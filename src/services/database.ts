import admin from 'firebase-admin';

const DATABASE_URL = process.env.DATABASE_URL;

export class DBService {
  public db: admin.firestore.Firestore;

  constructor() {
    // Init admin
    try {
      const serviceAccount = require('../../keys/keys.json');

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: DATABASE_URL,
      });

      this.db = admin.firestore();
      this.db.settings({ ignoreUndefinedProperties: true });
    } catch (e) {
      console.error(e);
    }
  }

  public getCollectionData = async (collectionName: string): Promise<any> => {
    const snapshot = await this.db.collection(collectionName).get();
    return snapshot.docs.map(doc => doc.data());
  };

  public updateDocument = async (collectionName: string, docName: string, data) => {
    await this.db.collection(collectionName).doc(docName).set(data);
  };

  public getCollectionDataWithLimit = async (
    collectionName: string,
    orderBy: string,
    limit: number,
    offset: number
  ): Promise<any> => {
    try {
      const snapshot = await this.db
        .collection(collectionName)
        .orderBy(orderBy, 'desc')
        .limit(limit)
        .offset(offset)
        .get();
      return snapshot.docs.map(doc => doc.data());
    } catch (err) {
      console.log('getCollectionDataWithLimit: ', err);
      return [];
    }
  };

  public getGlobalDataWithLimit = async (collectionName, orderBy, limit) => {
    try {
      const snapshot = await this.db
        .collection(collectionName)
        .orderBy(orderBy, 'desc')
        .limit(limit)
        .get();
      return snapshot.docs.map(doc => doc.data());
    } catch (err) {
      console.log(`error when get global data ${collectionName}`);
      return [];
    }
  };

  public getDataByERC20 = async (collectionName, orderBy, erc20Address) => {
    try {
      const snapshot = await this.db
        .collection(collectionName)
        .where('erc20Address', '==', erc20Address)
        .orderBy(orderBy, 'desc')
        .limit(5000)
        .get();
      return snapshot.docs.map(doc => doc.data());
    } catch (err) {
      console.log(`error when get global data ${collectionName}`);
      return [];
    }
  };

  public getDataByHRC20 = async (collectionName, orderBy, hrc20Address) => {
    try {
      const snapshot = await this.db
        .collection(collectionName)
        .where('hrc20Address', '==', hrc20Address)
        .orderBy(orderBy, 'desc')
        .limit(5000)
        .get();
      return snapshot.docs.map(doc => doc.data());
    } catch (err) {
      console.log(`error when get global data ${collectionName}`);
      return [];
    }
  };

  public getAssets = async (collectionName, date, symbol) => {
    try {
      let snapshot;

      if (symbol) {
        snapshot = await this.db
          .collection(collectionName)
          .where('date', '==', date)
          .where('symbol', '==', symbol)
          .limit(1000)
          .get();
      } else {
        snapshot = await this.db
          .collection(collectionName)
          .where('date', '==', date)
          .limit(1000)
          .get();
      }

      return snapshot.docs.map(doc => doc.data());
    } catch (err) {
      console.log(`error when get global data ${collectionName}`, err);
      return [];
    }
  };

  public getAllIdentityTokens = async () => {
    try {
      let snapshot;

      snapshot = await this.db
        .collection('itoken')
        .where('enable', '==', 'true')
        .get();

      return snapshot.docs.map(doc => doc.data());
    } catch (err) {
      console.log(`error when get identity tokens`, err);
      return [];
    }
  }
}

export const databaseService = new DBService();
