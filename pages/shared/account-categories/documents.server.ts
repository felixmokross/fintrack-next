import { Decimal128, ObjectId } from "mongodb";
import { ensure } from "../util";
import { AccountCategoryDto } from "./dtos";
import { AccountCategoryType } from "./enums";

export interface AccountCategory {
  _id?: ObjectId;
  name: string;
  type: AccountCategoryType;
  order: number;
  currentBalance: Decimal128;
}

export function toAccountCategoryDto(
  accountCategory: AccountCategory
): AccountCategoryDto {
  return {
    ...accountCategory,
    _id: ensure(accountCategory._id).toHexString(),
    currentBalance: accountCategory.currentBalance.toString(),
  };
}
