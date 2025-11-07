"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

/**
 * SafeSearchParams - A reusable wrapper that handles Suspense boundary for useSearchParams()
 *
 * Usage:
 * ```tsx
 * import SafeSearchParams from "@/components/SafeSearchParams";
 *
 * export default function MyPage() {
 *   return (
 *     <SafeSearchParams>
 *       {(searchParams) => (
 *         <YourComponent token={searchParams.get("token")} />
 *       )}
 *     </SafeSearchParams>
 *   );
 * }
 * ```
 *
 * Or with custom fallback:
 * ```tsx
 * <SafeSearchParams fallback={<MyCustomLoader />}>
 *   {(searchParams) => <YourComponent />}
 * </SafeSearchParams>
 * ```
 */

interface SafeSearchParamsProps {
  children: (
    searchParams: ReturnType<typeof useSearchParams>
  ) => React.ReactNode;
  fallback?: React.ReactNode;
}

function SearchParamsContent({ children }: SafeSearchParamsProps) {
  const searchParams = useSearchParams();
  return <>{children(searchParams)}</>;
}

export default function SafeSearchParams({
  children,
  fallback,
}: SafeSearchParamsProps) {
  const defaultFallback = (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "200px",
      }}
    >
      <CircularProgress />
    </Box>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <SearchParamsContent>{children}</SearchParamsContent>
    </Suspense>
  );
}
