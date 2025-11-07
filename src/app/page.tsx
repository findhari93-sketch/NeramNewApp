"use client";

import React, { Suspense } from "react";
import Home from "./(main)/homepage/page";
import TopNavBar from "./components/shared/TopNavBar";

export default function RootPage() {
  return (
    <Suspense fallback={null}>
      <TopNavBar />
      <Home />
    </Suspense>
  );
}
