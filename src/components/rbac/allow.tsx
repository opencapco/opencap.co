"use client";

import { useAllowed, type useAllowedOptions } from "@/hooks/use-allowed";
import { type ReactNode, Suspense } from "react";

interface AllowProps extends useAllowedOptions {
  children: ReactNode;
  not?: ReactNode;
}

export const Allow = ({ children, not, ...rest }: AllowProps) => {
  const { isAllowed } = useAllowed({ ...rest });

  if (isAllowed) {
    return children;
  }
  return not ? not : null;
};
