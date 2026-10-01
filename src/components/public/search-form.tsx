import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchFormProps {
  action: string;
  label: string;
  defaultValue: string;
  /** Hidden params kept on submit (e.g. the active category). Pagination resets. */
  hidden?: Record<string, string | null | undefined>;
  placeholder?: string;
}

// GET search form: works without JS (design D14).
export function SearchForm({ action, label, defaultValue, hidden = {}, placeholder }: SearchFormProps) {
  return (
    <form method="get" action={action} role="search" className="flex w-full max-w-xl flex-col gap-2 sm:flex-row sm:items-end">
      {Object.entries(hidden).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
      <div className="grid flex-1 gap-1.5">
        <label htmlFor="q" className="text-sm font-medium">
          {label}
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={defaultValue}
          maxLength={100}
          placeholder={placeholder}
          className="h-11 w-full rounded-md border border-input bg-card px-3 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </div>
      <Button type="submit" className="min-h-11 px-5">
        <Search aria-hidden="true" />
        Cari
      </Button>
    </form>
  );
}
