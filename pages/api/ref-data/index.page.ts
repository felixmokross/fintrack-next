import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import { Account, toAccountDto } from "../../accounts/shared/documents.server";
import {
  AccountCategory,
  toAccountCategoryDto,
} from "../../shared/account-categories/documents.server";
import {
  Currency,
  toCurrencyDto,
} from "../../shared/currencies/documents.server";
import { ExpenseCategory } from "../../shared/expense-categories/documents.server";
import { ExpenseCategoryDto } from "../../shared/expense-categories/dtos";
import { IncomeCategory } from "../../shared/income-categories/documents.server";
import { IncomeCategoryDto } from "../../shared/income-categories/dtos";
import { RefDataDto } from "../../shared/ref-data/dtos";
import { Stock } from "../../shared/stocks/documents.server";
import { StockDto } from "../../shared/stocks/dtos";
import { byKey, ensure } from "../../shared/util";
import { getTenantDb } from "../../shared/util.server";
import { ValueType } from "../../shared/value-types/documents.server";
import { ValueTypeDto } from "../../shared/value-types/dtos";

export default withApiAuthRequired(async function getRefData(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Invalid method" });
    return;
  }

  const db = await getTenantDb(req, res);

  const [
    currencies,
    stocks,
    incomeCategories,
    expenseCategories,
    accounts,
    accountCategories,
    valueTypes,
  ] = await Promise.all([
    getCurrencies(),
    getStocks(),
    getIncomeCategories(),
    getExpenseCategories(),
    getAccounts(),
    getAccountCategories(),
    getValueTypes(),
  ]);

  return res.json({
    currencies,
    stocks,
    incomeCategories,
    expenseCategories,
    accounts,
    accountCategories,
    valueTypes,
  } as RefDataDto);

  async function getCurrencies() {
    return byKey(
      (
        await db
          .collection<Currency>("currencies")
          .find({ blacklisted: false })
          .sort({ _id: 1 })
          .toArray()
      ).map(toCurrencyDto),
      (c) => c._id
    );
  }

  async function getStocks() {
    return byKey(
      (await db.collection<Stock>("stocks").find().toArray()).map(toStockDto),
      (c) => c._id
    );
  }

  async function getIncomeCategories() {
    return byKey(
      (
        await db.collection<IncomeCategory>("incomeCategories").find().toArray()
      ).map(toIncomeCategoryDto),
      (c) => c._id
    );
  }

  async function getExpenseCategories() {
    return byKey(
      (
        await db
          .collection<ExpenseCategory>("expenseCategories")
          .find()
          .toArray()
      ).map(toExpenseCategoryDto),
      (c) => c._id
    );
  }

  async function getAccounts() {
    return byKey(
      (
        await db
          .collection<Account>("accounts")
          .find()
          .sort({ name: 1, unit: 1, "unit.currency": 1 })
          .toArray()
      ).map(toAccountDto),
      (c) => c._id
    );
  }

  async function getAccountCategories() {
    return byKey(
      (
        await db
          .collection<AccountCategory>("accountCategories")
          .find()
          .sort({ order: 1 })
          .toArray()
      ).map(toAccountCategoryDto),
      (c) => c._id
    );
  }

  async function getValueTypes() {
    return byKey(
      (await db.collection<ValueType>("valueTypes").find().toArray()).map(
        toValueTypeDto
      ),
      (vt) => vt._id
    );
  }
});

function toStockDto(stock: Stock): StockDto {
  return {
    _id: ensure(stock._id).toHexString(),
    symbol: stock.symbol,
    tradingCurrency: stock.tradingCurrency,
  };
}

function toIncomeCategoryDto(
  incomeCategory: IncomeCategory
): IncomeCategoryDto {
  return {
    _id: ensure(incomeCategory._id).toHexString(),
    name: incomeCategory.name,
  };
}

function toExpenseCategoryDto(
  expenseCategory: ExpenseCategory
): ExpenseCategoryDto {
  return {
    _id: ensure(expenseCategory._id).toHexString(),
    name: expenseCategory.name,
  };
}

function toValueTypeDto(valueType: ValueType): ValueTypeDto {
  return {
    _id: valueType._id.toHexString(),
    name: valueType.name,
  };
}
