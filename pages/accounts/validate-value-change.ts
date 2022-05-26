import Decimal from "decimal.js-light";
import { FormikErrors } from "formik";
import { ValueChangeFormValues } from "./types";

export default function validateValueChange(values: ValueChangeFormValues): FormikErrors<ValueChangeFormValues> {
    const errors: FormikErrors<ValueChangeFormValues> = {};

    if (!values.date) errors.date = "Required";

    if (!values.valueChange) errors.valueChange = "Required";
    else if (!isValidDecimal(values.valueChange)) errors.valueChange = "Must be a decimal";
    else if (new Decimal(values.valueChange).isZero()) errors.valueChange = "Must not be zero";

    return errors;
}

function isValidDecimal(value: string): boolean {
    try {
        new Decimal(value);
        return true;
    } catch (e) {
        return false;
    }
}
