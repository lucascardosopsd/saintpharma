"use client";

import { ReactElement, cloneElement } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Control } from "react-hook-form";

interface FieldBuilderProps {
  title?: string;
  name: string;
  fieldElement: ReactElement;
  control: Control<any>;
  fieldClassName?: string;
  type?: "default" | "checkbox";
  defaultValue?: string | number | boolean;
  disabled?: boolean;
}

const FieldBuilder = ({
  title,
  name,
  fieldElement,
  control,
  fieldClassName,
  type = "default",
  defaultValue,
  disabled,
}: FieldBuilderProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full">
          {title && <FormLabel className="text-primary">{title}</FormLabel>}
          <FormControl className="flex items-center">
            {type == "checkbox"
              ? cloneElement(fieldElement, {
                  ...field,
                  className: fieldClassName,
                  checked: field.value,
                  onCheckedChange: field.onChange,
                  defaultChecked: defaultValue,
                  disabled,
                })
              : cloneElement(fieldElement, {
                  ...field,
                  className: fieldClassName,
                  disabled,
                })}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FieldBuilder;
