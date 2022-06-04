import { orderBy } from "lodash";
import { useRefData } from "../../ref-data-context";
import { Select, SelectProps } from "../../shared/forms/select";
import { ButtonSkeleton } from "../../shared/skeletons";

export function CurrencySelect(props: CurrencySelectProps) {
  const { currencies } = useRefData();
  if (!currencies) return <ButtonSkeleton className="w-full" />;

  return (
    <Select {...props}>
      {orderBy(Object.values(currencies), (c) => c._id).map((c) => (
        <option key={c._id} value={c._id}>
          {c._id} &ndash; {c.name}
        </option>
      ))}
    </Select>
  );
}

export type CurrencySelectProps = SelectProps;
