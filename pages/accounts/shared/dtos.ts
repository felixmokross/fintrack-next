import { AccountCategoryDto, AccountDto } from "../../shared/accounts/dtos";

export type AccountCategoryWithAccountsDto = AccountCategoryDto & {
  accounts: AccountDto[];
};
