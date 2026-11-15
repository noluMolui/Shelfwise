/**
 * Placeholder Supabase database types.
 *
 * Replace the empty schema maps with generated Supabase types when the
 * database migrations are introduced. Keeping this shape in place lets the
 * client stay typed without inventing tables before the schema is approved.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type EmptySchema = {
  Tables: Record<string, never>;
  Views: Record<string, never>;
  Functions: Record<string, never>;
  Enums: Record<string, never>;
  CompositeTypes: Record<string, never>;
};

export type Database = {
  public: EmptySchema;
};
