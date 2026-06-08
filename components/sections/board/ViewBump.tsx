"use client";

import { useEffect, useRef } from "react";
import { recordView } from "@/app/notices/board/actions";

/** 상세 페이지 마운트 시 조회수 +1 (프리페치가 아닌 실제 조회만 카운트). */
export function ViewBump({ id }: { id: string }) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    void recordView(id);
  }, [id]);
  return null;
}
