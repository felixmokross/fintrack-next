import { orderBy } from "lodash";
import { useRefData } from "../../ref-data-context";
import { Select, SelectProps } from "../forms/select";
import { ButtonSkeleton } from "../skeletons";

export function ExpenseCategorySelect({
  ...props
}: ExpenseCategorySelectProps) {
  const { expenseCategories } = useRefData();
  if (!expenseCategories) return <ButtonSkeleton className="w-full" />;
  return (
    <Select {...props}>
      {orderBy(Object.values(expenseCategories), (ec) => ec.name).map((ec) => (
        <option key={ec._id} value={ec._id}>
          {ec.name}
        </option>
      ))}
    </Select>
  );
}

export type ExpenseCategorySelectProps = SelectProps;
