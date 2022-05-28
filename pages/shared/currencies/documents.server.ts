import { CurrencyDto } from "./dtos";

export interface Currency {
  _id: string;
  name: string;
  blacklisted: boolean;
  decimals?: number;
  forexRateSource: ForexRateSource;
  startDate: Date;
}

export enum ForexRateSource {
  CURRENCYLAYER = "CURRENCYLAYER",
  COINLAYER = "COINLAYER",
}

export function toCurrencyDto(currency: Currency): CurrencyDto {
  return {
    _id: currency._id,
    name: currency.name,
    decimals: currency.decimals,
  };
}
