import { IoAddCircle, IoCloseSharp } from "react-icons/io5";
import { useForm, FormProvider } from "react-hook-form";

// If using shadcn/ui's Button, import from your local setup
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// Your custom field that integrates react-hook-form & shadcn/ui
import { CustomField } from "@/components/shared/CustomField";

interface AddFilterPopUpProps {
  openFilter: boolean;
  handleFilterClose: () => void;
}

type FilterFormValues = {
  condition: string;
  column: string;
  value: string;
};

export default function AddFilterPopUp({
  openFilter,
  handleFilterClose,
}: AddFilterPopUpProps) {
  const conditionList = [
    { id: 1, conditionName: "Greater than equal to" },
    { id: 2, conditionName: "Less than equal to" },
    { id: 3, conditionName: "equal to" },
  ];

  const columnList = [
    { id: 1, columnName: "Id" },
    { id: 2, columnName: "Name" },
    { id: 3, columnName: "Age" },
  ];

  // Setup react-hook-form
  const methods = useForm<FilterFormValues>({
    defaultValues: {
      condition: "",
      column: "",
      value: "",
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // Called when user clicks "Apply"
  const onSubmit = (data: FilterFormValues) => {
    // ... do something with the submitted data
  };

  return (
    <>
      {openFilter && (
        <div
          className="
            shadow-lg w-[300px] absolute top-[16%] left-[8%]
            bg-white rounded p-2
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">Add Filter</div>
            <IoCloseSharp
              onClick={handleFilterClose}
              className="cursor-pointer text-xl"
            />
          </div>

          {/* Form */}
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Condition */}
              <Label className="text-sm font-medium mb-1">Condition</Label>
              <CustomField
                name="condition"
                controlName="select"
                options={conditionList}
                valueKey="id"
                labelKey="conditionName"
                control={methods.control}
              />

              {/* Column */}
              <Label className="text-sm font-medium mt-2 mb-1">Column</Label>
              <CustomField
                name="column"
                controlName="select"
                options={columnList}
                valueKey="id"
                labelKey="columnName"
                control={methods.control}
              />

              {/* Value */}
              <Label className="text-sm font-medium mt-2 mb-1">Value</Label>
              <CustomField name="value" control={methods.control} />

              {/* "ADD FILTER" section */}
              <div className="flex items-center gap-2 mt-4 mb-2 text-sm font-semibold text-green-500 cursor-pointer">
                <IoAddCircle size={18} />
                <span>ADD FILTER</span>
              </div>

              {/* Footer buttons */}
              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={handleFilterClose}>
                  Close
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  Apply
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      )}
    </>
  );
}
