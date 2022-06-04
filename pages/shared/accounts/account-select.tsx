import dayjs from "dayjs";
import { orderBy } from "lodash";
import { AccountUnitKind } from "../../accounts/shared/enums";
import { useRefData } from "../../ref-data-context";
import { Select, SelectProps } from "../forms/select";
import { ButtonSkeleton } from "../skeletons";
import { today } from "../today";

export function AccountSelect({ ...props }: AccountSelectProps) {
  const { accounts } = useRefData();
  if (!accounts) return <ButtonSkeleton className="w-full" />;
  return (
    <Select {...props}>
      {orderBy(Object.values(accounts), (a) => a.name)
        .filter(
          (a) =>
            !a.closingDate || dayjs.utc(a.closingDate).isSameOrAfter(today())
        )
        .map((a) => (
          <option key={a._id} value={a._id}>
            {a.name} (
            {a.unit.kind === AccountUnitKind.CURRENCY
              ? a.unit.currency
              : "Stock"}
            )
          </option>
        ))}
    </Select>
  );
}

export type AccountSelectProps = SelectProps;
