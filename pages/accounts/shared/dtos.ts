import { AccountCategoryDto, AccountDto } from "../../../lib/dtos";

export type AccountCategoryWithAccountsDto = AccountCategoryDto & {
  accounts: AccountDto[];
};
