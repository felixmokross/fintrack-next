import { ObjectId } from "mongodb";

export interface ExpenseCategory {
  _id?: ObjectId;
  name: string;
}
