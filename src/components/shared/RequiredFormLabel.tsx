import { FormLabel } from "@/components/ui/form";

export const RequiredFormLabel = ({ children }: { children: React.ReactNode }) => (
    <FormLabel>
      {children}
      <span className="text-red-500 ml-1">*</span>
    </FormLabel>
  )