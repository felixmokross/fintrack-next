import { AccountUnitKind } from "./enums";
import {
  AccountUnitLike,
  CurrencyAccountUnitLike,
  StockAccountUnitLike,
  AccountModel,
  CurrencyAccountModel,
  StockAccountModel,
} from "./model.server";

export function isCurrencyUnit<T extends AccountUnitLike>(
  unit: T
): unit is CurrencyAccountUnitLike<T> {
  return unit.kind === AccountUnitKind.CURRENCY;
}

export function isStockUnit<T extends AccountUnitLike>(
  unit: T
): unit is StockAccountUnitLike<T> {
  return unit.kind === AccountUnitKind.STOCK;
}

export function isCurrencyAccountModel(
  account: AccountModel
): account is CurrencyAccountModel {
  return isCurrencyUnit(account.unit);
}

export function isStockAccountModel(
  account: AccountModel
): account is StockAccountModel {
  return isStockUnit(account.unit);
}
