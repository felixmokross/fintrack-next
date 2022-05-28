import { AccountCategoryDto } from "../../shared/account-categories/dtos";
import { AccountDto } from "../../shared/accounts/dtos";

export type AccountCategoryWithAccountsDto = AccountCategoryDto & {
  accounts: AccountDto[];
};
