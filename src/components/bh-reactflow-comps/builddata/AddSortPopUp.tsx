import React from "react";
import { IoAddCircle, IoCloseSharp } from "react-icons/io5";
import { useForm, FormProvider } from "react-hook-form";

import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { CustomField } from "@/components/shared/CustomField";

interface AddSortPopUpProps {
  openSort: boolean;
  handleSortClose: () => void;
}

/** Example form fields */
interface SortFormValues {
  column: string;
}

export default function AddSortPopUp({
  openSort,
  handleSortClose,
}: AddSortPopUpProps) {
  // Local state for ascending vs descending
  const [checked, setChecked] = React.useState(true);

  // Setup react-hook-form
  const methods = useForm<SortFormValues>({
    defaultValues: {
      column: "",
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    control
  } = methods;

  // Called when user clicks "Apply"
  const onSubmit = (data: SortFormValues) => {
     // Use the 'checked' local state for ascending/descending
    // ... do something with the data
  };

  return (
    <>
      {openSort && (
        <div
          className="
            shadow-lg w-[300px] absolute top-[16%] left-[8%]
            bg-white rounded p-2
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">Add Sort</div>
            <IoCloseSharp
              onClick={handleSortClose}
              className="cursor-pointer text-xl"
            />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Ascending / Descending Switch */}
            <div className="flex items-center gap-2 mb-2">
              <div className={`font-${checked ? "semibold" : "normal"}`}>
                Ascending
              </div>
              <Switch
                checked={checked}
                onCheckedChange={(val) => setChecked(val)}
              />
              <div className={`font-${!checked ? "semibold" : "normal"}`}>
                Descending
              </div>
            </div>

            {/* Column Select */}
            <Label className="text-sm font-medium mb-1">Column</Label>
            <CustomField<SortFormValues>
              name="column"
              control={control}
              controlName="select"
              valueKey="id"
              labelKey="columnName"
              // If you prefer to store these in a prop, that's fine.
              options={[
                { id: 1, columnName: "Id" },
                { id: 2, columnName: "Name" },
                { id: 3, columnName: "Age" },
              ]}
            />

            {/* "ADD SORT" row */}
            <div className="flex items-center gap-2 my-4 text-green-600 font-semibold cursor-pointer">
              <IoAddCircle size={18} />
              <span>ADD SORT</span>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between mt-4">
              <Button
                variant="outline"
                className="font-semibold"
                onClick={handleSortClose}
              >
                Close
              </Button>
              <Button
                type="submit"
                variant="default"
                className="font-semibold"
                disabled={isSubmitting}
              >
                Apply
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
