import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { Command, CommandInput, CommandItem, CommandList } from "./command";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

interface ComboboxProps {
  options: {
    label: string;
    value: string;
  }[];
  value: string;
  onChange: (value: string) => void;
  defaultValue?: string;
}

export const Combobox = ({
  options,
  value,
  onChange,
  defaultValue,
}: ComboboxProps) => {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between hover:bg-gray-50"
        >
          {value || defaultValue}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-4 pt-2 md:w-[500px] lg:w-[800px]">
        <Command>
          <CommandInput placeholder="Rechercher" />
          <CommandList>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className="data-[selected='true']:bg-gray-200"
              >
                {option.label}
                {option.label === value && (
                  <CheckIcon className="ml-auto h-4 w-4" />
                )}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
