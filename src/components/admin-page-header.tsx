"use client";

import * as React from "react";

type Props = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function AdminPageHeader({ title, description, action }: Props) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* LEFT */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>

        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {/* RIGHT (ACTION BUTTON) */}
      {action && <div>{action}</div>}
    </div>
  );
}
