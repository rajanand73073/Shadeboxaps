"use client";

import React from "react";
import { useSearchParams } from "next/navigation";

const Page = () => {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  if (error) {
    return (
      <div className="flex flex-col bg-black text-w">
        <h1>Access Denied</h1>
        {error}
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }
};

export default Page;
