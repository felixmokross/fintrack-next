import { AccountCategoryType } from "../../shared/account-categories/enums";
import { AccountUnitDto } from "../shared/dtos";
import { AccountType } from "../shared/enums";

export interface AccountDetailDto {
  _id: string;
  name: string;
  type: AccountType;
  unit: AccountUnitDto;
  categoryId: string;
  categoryType: AccountCategoryType;
  groupId: string | null;
  isActive: boolean;
  openingBalance: string | null;
  openingDate: string | null;
  closingDate: string | null;
}
