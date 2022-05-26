import { ReactElement } from "react";
import { Button, ButtonVariant } from "../../components/button";
import { DatepickerInput } from "../../components/datepicker/datepicker-input";
import Form from "../../components/form";
import { Input } from "../../components/input";
import { Labeled } from "../../components/labeled";
import { ModalBody, ModalFooter } from "../../components/modal";
import SubmitButton from "../../components/submit-button";
import { dateFormat } from "../../lib/util";
import { ValueChangeFormValues } from "./types";
import validateValueChange from "./validate-value-change";

export function ValueChangeForm({ title, initialValues, onSubmit, onClose }: ValueChangeFormProps): ReactElement {
    return (
        <Form<ValueChangeFormValues> validate={validateValueChange} initialValues={initialValues} onSubmit={onSubmit}>
            <ModalBody title={title}>
                <div className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-12">
                        <Labeled htmlFor="date" label="Date" className="sm:col-span-4">
                            <DatepickerInput name="date" id="date" format={dateFormat} />
                        </Labeled>
                        <Labeled htmlFor="note" label="Note" className="sm:col-span-5">
                            <Input name="note" id="note" />
                        </Labeled>
                        <Labeled htmlFor="valueChange" label="Change" className="sm:col-span-3">
                            <Input name="valueChange" id="valueChange" />
                        </Labeled>
                    </div>
                </div>
            </ModalBody>
            <ModalFooter>
                <SubmitButton variant={ButtonVariant.PRIMARY} className="w-full sm:w-auto">
                    Save
                </SubmitButton>
                <Button variant={ButtonVariant.SECONDARY} className="w-full sm:w-auto" onClick={onClose}>
                    Cancel
                </Button>
            </ModalFooter>
        </Form>
    );
}

export interface ValueChangeFormProps {
    title: string;
    initialValues: ValueChangeFormValues;
    onSubmit: (values: ValueChangeFormValues) => void | Promise<void>;
    onClose: () => void;
}
