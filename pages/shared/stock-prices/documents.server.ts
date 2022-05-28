import { Decimal128, ObjectId } from "mongodb";

export interface StockPrice {
  _id: {
    stockId: ObjectId;
    date: Date;
  };
  currency: string;
  value: Decimal128;
  tradingDate: Date;
}
