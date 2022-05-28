import { Decimal128 } from "mongodb";

export interface ForexRate {
  _id: {
    currency: string;
    date: Date;
  };
  value: Decimal128;
}
