import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import dayjs from "dayjs";
import { uniqBy } from "lodash";
import { Db } from "mongodb";
import { NextApiResponse } from "next";
import {
  Account,
  toAccountUnitDto,
} from "../../../accounts/shared/documents.server";
import { recalculate } from "../../../shared/recalculate.server";
import { serializeId } from "../../../shared/serialization.server";
import {
  Booking,
  toBooking,
  Transaction,
} from "../../../shared/transactions/documents.server";
import {
  AppreciationDto,
  BookingDto,
  ChargeDto,
  DepositDto,
  DepreciationDto,
  ExpenseDto,
  IncomeDto,
  SaveTransactionDto,
  TransactionDto,
} from "../../../shared/transactions/dtos";
import { BookingType } from "../../../shared/transactions/enums";
import { isChargeOrDeposit } from "../../../shared/transactions/functions";
import { ensure } from "../../../shared/util";
import { getTenantDb } from "../../../shared/util.server";

export default withApiAuthRequired(async function deleteTransaction(req, res) {
  if (!req.query.id || typeof req.query.id !== "string") {
    res.status(400).json({ message: "No id specified" });
    return;
  }

  const db = await getTenantDb(req, res);

  switch (req.method) {
    case "DELETE":
      await del(req.query.id, db, res);
      return;
    case "GET":
      await get(req.query.id, db, res);
      return;
    case "PUT":
      await put(req.query.id, req.body, db, res);
      return;
    default:
      res.status(405).json({ message: "Invalid method" });
      return;
  }
});

async function del(id: string, db: Db, res: NextApiResponse) {
  const { ok, value } = await db
    .collection<Transaction>("transactions")
    .findOneAndDelete({
      _id: serializeId(id),
    });

  if (!ok || !value) {
    res.status(404).end();
    return;
  }

  const accountIds = value.bookings
    .filter(isChargeOrDeposit)
    .map((b) => b.accountId);
  await recalculate(db, accountIds, dayjs.utc(value.date));

  res.status(200).end();
}

async function get(id: string, db: Db, res: NextApiResponse) {
  const transaction = await db
    .collection<Transaction>("transactions")
    .findOne({ _id: serializeId(id) });

  if (!transaction) {
    res.status(404).end();
    return;
  }

  res.json(toTransactionDto(transaction));
}

async function put(
  id: string,
  dto: SaveTransactionDto,
  db: Db,
  res: NextApiResponse
) {
  const accountIds = dto.bookings
    .filter(isChargeOrDeposit)
    .map((b) => serializeId(b.accountId));

  const accounts = await db
    .collection<Account>("accounts")
    .find({ _id: { $in: accountIds } })
    .toArray();
  if (accounts.length !== accountIds.length)
    throw new Error("Not all accounts exist!");

  const newTransactionDate = dayjs.utc(dto.date);
  const { value: originalTransaction } = await db
    .collection<Transaction>("transactions")
    .findOneAndUpdate(
      { _id: serializeId(id) },
      {
        $set: {
          date: dayjs.utc(dto.date).toDate(),
          note: dto.note || undefined,
          bookings: dto.bookings.map((b) => toBooking(b, accounts)),
        },
      }
    );

  if (!originalTransaction) {
    res.status(404).end();
    return;
  }

  const originalAccountIds = originalTransaction.bookings
    .filter(isChargeOrDeposit)
    .map((b) => b.accountId);

  await recalculate(
    db,
    uniqBy(originalAccountIds.concat(accountIds), (id) => id.toHexString()),
    dayjs.min(dayjs.utc(originalTransaction.date), newTransactionDate)
  );

  res.status(200).end();
}

function toTransactionDto(transaction: Transaction): TransactionDto {
  return {
    _id: ensure(transaction._id).toHexString(),
    date: transaction.date.toUTCString(),
    note: transaction.note || null,
    bookings: transaction.bookings.map(toBookingDto),
  };
}

function toBookingDto(booking: Booking): BookingDto {
  switch (booking.type) {
    case BookingType.CHARGE:
      return {
        accountId: booking.accountId.toHexString(),
        unit: toAccountUnitDto(booking.unit),
        amount: booking.amount.toString(),
        type: booking.type,
        note: booking.note,
      } as ChargeDto;
    case BookingType.DEPOSIT:
      return {
        accountId: booking.accountId.toHexString(),
        unit: toAccountUnitDto(booking.unit),
        amount: booking.amount.toString(),
        type: booking.type,
        note: booking.note,
      } as DepositDto;
    case BookingType.INCOME:
      return {
        incomeCategoryId: booking.incomeCategoryId.toHexString(),
        currency: booking.currency,
        amount: booking.amount.toString(),
        type: booking.type,
        note: booking.note,
      } as IncomeDto;
    case BookingType.EXPENSE:
      return {
        expenseCategoryId: booking.expenseCategoryId.toHexString(),
        currency: booking.currency,
        amount: booking.amount.toString(),
        type: booking.type,
        note: booking.note,
      } as ExpenseDto;
    case BookingType.APPRECIATION:
      return {
        amount: booking.amount.toString(),
        type: booking.type,
      } as AppreciationDto;
    case BookingType.DEPRECIATION:
      return {
        amount: booking.amount.toString(),
        type: booking.type,
      } as DepreciationDto;
  }
}
