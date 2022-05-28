import { CurrencyDto } from "../currencies/dtos";
import { StockDto } from "../stocks/dtos";

export type RefDataDto = {
  currencies: Record<string, CurrencyDto>;
  stocks: Record<string, StockDto>;
};
