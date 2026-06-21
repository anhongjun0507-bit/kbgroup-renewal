"use client";

import { useEffect, useRef } from "react";
import { recordPostView } from "@/app/notices/actions";

/** 상세 페이지 마운트 시 조회수 +1 (실제 조회만 카운트). */
export function PostViewBump({ id }: { id: string }) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    void recordPostView(id);
  }, [id]);
  return null;
}
