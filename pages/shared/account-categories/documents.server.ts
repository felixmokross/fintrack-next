import { Decimal128, ObjectId } from "mongodb";
import { AccountCategoryType } from "./enums";

export interface AccountCategory {
  _id?: ObjectId;
  name: string;
  type: AccountCategoryType;
  order: number;
  currentBalance: Decimal128;
}
