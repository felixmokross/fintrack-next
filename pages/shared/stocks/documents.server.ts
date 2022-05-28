import { ObjectId } from "mongodb";

export interface Stock {
  _id?: ObjectId;
  symbol: string;
  tradingCurrency: string;
  startDate?: Date;
  endDate?: Date;
}
