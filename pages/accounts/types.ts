import { AccountCategoryDto, AccountDto } from "../../lib/dtos";

export type AccountCategoryWithAccountsDto = AccountCategoryDto & {
  accounts: AccountDto[];
};

export interface ValueChangeFormValues {
  date: string;
  note: string;
  valueChange: string;
}
