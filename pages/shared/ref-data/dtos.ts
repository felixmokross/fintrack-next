import { AccountDto } from "../../accounts/shared/dtos";
import { AccountCategoryDto } from "../account-categories/dtos";
import { CurrencyDto } from "../currencies/dtos";
import { ExpenseCategoryDto } from "../expense-categories/dtos";
import { IncomeCategoryDto } from "../income-categories/dtos";
import { StockDto } from "../stocks/dtos";
import { ValueTypeDto } from "../value-types/dtos";

export type RefDataDto = {
  currencies: Record<string, CurrencyDto>;
  stocks: Record<string, StockDto>;
  incomeCategories: Record<string, IncomeCategoryDto>;
  expenseCategories: Record<string, ExpenseCategoryDto>;
  accounts: Record<string, AccountDto>;
  accountCategories: Record<string, AccountCategoryDto>;
  valueTypes: Record<string, ValueTypeDto>;
};
