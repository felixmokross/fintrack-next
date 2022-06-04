import { orderBy } from "lodash";
import { useRefData } from "../../ref-data-context";
import { Select, SelectProps } from "../forms/select";
import { ButtonSkeleton } from "../skeletons";

export function IncomeCategorySelect({ ...props }: IncomeCategorySelectProps) {
  const { incomeCategories } = useRefData();
  if (!incomeCategories) return <ButtonSkeleton className="w-full" />;
  return (
    <Select {...props}>
      {orderBy(Object.values(incomeCategories), (ic) => ic.name).map((ic) => (
        <option key={ic._id} value={ic._id}>
          {ic.name}
        </option>
      ))}
    </Select>
  );
}

export type IncomeCategorySelectProps = SelectProps;
