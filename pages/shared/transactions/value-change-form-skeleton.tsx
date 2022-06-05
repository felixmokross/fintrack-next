import { Button, ButtonVariant } from "../button";
import { Labeled } from "../forms/labeled";
import { ModalBody, ModalFooter } from "../modal";
import { ButtonSkeleton } from "../skeletons";

export function ValueChangeFormSkeleton({
  title,
}: ValueChangeFormSkeletonProps) {
  return (
    <>
      <ModalBody title={title}>
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-12">
            <Labeled htmlFor="date" label="Date" className="sm:col-span-4">
              <ButtonSkeleton className="w-full" />
            </Labeled>
            <Labeled htmlFor="note" label="Note" className="sm:col-span-5">
              <ButtonSkeleton className="w-full" />
            </Labeled>
            <Labeled
              htmlFor="valueChange"
              label="Change"
              className="sm:col-span-3"
            >
              <ButtonSkeleton className="w-full" />
            </Labeled>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          variant={ButtonVariant.PRIMARY}
          className="w-full sm:w-auto"
          disabled={true}
        >
          Save
        </Button>
        <Button
          variant={ButtonVariant.SECONDARY}
          className="w-full sm:w-auto"
          disabled={true}
        >
          Cancel
        </Button>
      </ModalFooter>
    </>
  );
}

export interface ValueChangeFormSkeletonProps {
  title: string;
}
