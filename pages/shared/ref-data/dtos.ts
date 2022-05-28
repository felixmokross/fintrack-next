import { CurrencyDto } from "../currencies/dtos";

export type RefDataDto = {
  currencies: Record<string, CurrencyDto>;
};
