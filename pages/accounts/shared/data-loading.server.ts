import { groupBy } from "lodash";
import { Db } from "mongodb";
import { AccountCategory } from "../../shared/account-categories/documents.server";
import {
  Account,
  toAccountUnitDto,
} from "../../shared/accounts/documents.server";
import { toAccountCategoryDto } from "../../../lib/mappings.server";
import { AccountCategoryWithAccountsDto } from "./dtos";
import { ensure } from "../../shared/util";
import { AccountDto } from "../../shared/accounts/dtos";

export async function getAccountCategoriesWithAccounts(
  db: Db
): Promise<AccountCategoryWithAccountsDto[]> {
  const accountsByCategoryId = groupBy(
    (
      await db
        .collection<Account>("accounts")
        .find()
        .sort({ name: 1, unit: 1, "unit.currency": 1 })
        .toArray()
    ).map(toAccountDto),
    (ac) => ac.categoryId
  );

  return (
    await db
      .collection<AccountCategory>("accountCategories")
      .find()
      .sort({ order: 1 })
      .toArray()
  )
    .map(toAccountCategoryDto)
    .map((ac) => ({
      ...ac,
    }))
    .map((ac) => ({
      ...ac,
      accounts: accountsByCategoryId[ac._id],
    }));
}

function toAccountDto(account: Account): AccountDto {
  return {
    _id: ensure(account._id).toHexString(),
    name: account.name,
    type: account.type,
    unit: toAccountUnitDto(account.unit),
    valueTypeId: account.valueTypeId?.toHexString() || null,
    valueSubtypeId: account.valueSubtypeId?.toHexString() || null,
    categoryId: account.categoryId.toHexString(),
    categoryType: account.categoryType,
    groupId: account.groupId?.toHexString() || null,
    isActive: account.isActive,
    currentBalance: {
      valueInReferenceCurrency:
        account.currentBalance.valueInReferenceCurrency.toString(),
      valueInAccountUnit: account.currentBalance.valueInAccountUnit.toString(),
    },
    closingDate: account.closingDate?.toUTCString() || null,
  };
}
