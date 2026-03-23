"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getToken } from "./api";

export function useProtectedPage() {
  const router = useRouter();

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
    }
  }, [router]);
}
