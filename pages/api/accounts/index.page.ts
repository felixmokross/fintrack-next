import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import dayjs from "dayjs";
import { ObjectId } from "mongodb";
import { Account, AccountUnit } from "../../accounts/shared/documents.server";
import { AccountUnitDto } from "../../accounts/shared/dtos";
import { AccountUnitKind } from "../../accounts/shared/enums";
import { AccountCategory } from "../../shared/account-categories/documents.server";
import { CreateAccountDto } from "../../shared/accounts/dtos";
import { recalculate } from "../../shared/recalculate.server";
import {
  serializeDecimal,
  serializeId,
} from "../../shared/serialization.server";
import { getTenantDb } from "../../shared/util.server";

export default withApiAuthRequired(async function createAccount(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Invalid method" });
    return;
  }

  const dto = req.body as CreateAccountDto;
  const db = await getTenantDb(req, res);

  const categoryId = serializeId(dto.categoryId);
  const category = await db
    .collection<AccountCategory>("accountCategories")
    .findOne({ _id: categoryId });
  if (!category)
    throw new Error(`Account category ${categoryId} does not exist`);

  const openingDate = dto.openingDate && dayjs.utc(dto.openingDate);
  const { insertedId } = await db.collection<Account>("accounts").insertOne({
    name: dto.name,
    type: dto.type,
    unit: toAccountUnit(dto.unit),
    categoryId,
    categoryType: category?.type,
    groupId: dto.groupId
      ? ObjectId.createFromHexString(dto.groupId)
      : undefined,
    isActive: true,
    openingDate: openingDate ? openingDate.toDate() : undefined,
    currentBalance: {
      valueInAccountUnit: serializeDecimal(0),
      valueInReferenceCurrency: serializeDecimal(0),
    },
  });

  await recalculate(db, [insertedId], openingDate || undefined);

  res.setHeader("Location", `/api/accounts/${insertedId}`).status(201).end();
});

function toAccountUnit(unit: AccountUnitDto): AccountUnit {
  switch (unit.kind) {
    case AccountUnitKind.CURRENCY:
      return {
        kind: unit.kind,
        currency: unit.currency,
      };
    case AccountUnitKind.STOCK:
      return {
        kind: unit.kind,
        stockId: ObjectId.createFromHexString(unit.stockId),
      };
  }
}
