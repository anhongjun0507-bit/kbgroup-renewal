/**
 * Supabase DB 스키마 타입.
 *
 * 현재는 빈 placeholder.
 * PHASE 2에서 스키마 확정 후 다음 명령으로 자동 생성 예정:
 *   ```bash
 *   npx supabase gen types typescript --project-id <PROJECT_ID> > lib/supabase/database.types.ts
 *   ```
 */
export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
