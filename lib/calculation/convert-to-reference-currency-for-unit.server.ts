import { Dayjs } from "dayjs";
import Decimal from "decimal.js-light";
import { ObjectId } from "mongodb";
import { AccountUnit } from "../../pages/shared/accounts/documents.server";
import { AccountUnitKind } from "../../pages/shared/accounts/enums";
import { AccountUnitModel } from "../../pages/shared/accounts/model.server";
import { referenceCurrency } from "../../pages/shared/util";
import { convertToCurrency, RateProvider } from "./forex-rates.server";
import {
  convertStockQuantityToCurrency,
  StockPriceProvider,
} from "./stock-prices.server";

export function convertToReferenceCurrencyForUnit(
  value: Decimal,
  unit: AccountUnit | AccountUnitModel,
  date: Dayjs,
  rateProvider: RateProvider,
  stockPriceProvider: StockPriceProvider
): Decimal {
  switch (unit.kind) {
    case AccountUnitKind.CURRENCY:
      return convertToCurrency(
        value,
        unit.currency,
        referenceCurrency,
        date,
        rateProvider
      );
    case AccountUnitKind.STOCK:
      return convertStockQuantityToCurrency(
        value,
        unit.stockId instanceof ObjectId
          ? unit.stockId.toHexString()
          : unit.stockId,
        referenceCurrency,
        date,
        stockPriceProvider,
        rateProvider
      );
  }
}
