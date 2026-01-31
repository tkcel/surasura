"use client";

import * as React from "react";
import { IconSearch } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { SETTINGS_NAV_ITEMS } from "../lib/settings-navigation";

// Detect platform for keyboard shortcuts
const isMac = window.electronAPI.platform === "darwin";

export function CommandSearchButton() {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const navigate = useNavigate();

  // Client-side filtering for settings
  const settingsResults = React.useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) {
      return SETTINGS_NAV_ITEMS;
    }
    return SETTINGS_NAV_ITEMS.filter((page) => {
      const searchText = [page.title, page.description].join(" ").toLowerCase();
      return searchText.includes(query);
    });
  }, [search]);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const shortcutDisplay = isMac ? "⌘ K" : "Ctrl+K";

  const handleSelect = (url: string) => {
    setOpen(false);
    setSearch("");
    navigate({ to: url });
  };

  return (
    <>
      <Button
        variant="outline"
        className="w-full justify-start gap-2 px-2 h-8 text-sm font-normal"
        onClick={() => setOpen(true)}
      >
        <IconSearch className="h-4 w-4" />
        <span className="flex-1 text-left">検索...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-auto">
          {shortcutDisplay}
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="設定を検索..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>結果が見つかりません</CommandEmpty>
          {settingsResults.length > 0 && (
            <CommandGroup heading="設定">
              {settingsResults.map((page) => (
                <CommandItem
                  key={page.url}
                  value={page.title}
                  onSelect={() => handleSelect(page.url)}
                  className="cursor-pointer"
                >
                  {typeof page.icon === "string" ? (
                    <span className="mr-2 text-xl">{page.icon}</span>
                  ) : (
                    <page.icon className="mr-2 h-4 w-4" />
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium">{page.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {page.description}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
