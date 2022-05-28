import { AccountCategoryType } from "./enums";

export interface AccountCategoryDto {
  _id: string;
  name: string;
  type: AccountCategoryType;
  order: number;
  currentBalance: string;
}
