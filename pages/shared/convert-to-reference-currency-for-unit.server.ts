import { Dayjs } from "dayjs";
import Decimal from "decimal.js-light";
import { ObjectId } from "mongodb";
import { AccountUnit } from "./accounts/documents.server";
import { AccountUnitKind } from "./accounts/enums";
import { AccountUnitModel } from "./accounts/model.server";
import {
  convertToCurrency,
  RateProvider,
} from "./forex-rates/functions.server";
import {
  convertStockQuantityToCurrency,
  StockPriceProvider,
} from "./stock-prices/functions.server";
import { referenceCurrency } from "./util";

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
