export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Table<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      businesses: Table<
        { id: string; name: string; created_at: string },
        { id?: string; name: string; created_at?: string },
        { name?: string }
      >;
      user_profiles: Table<
        {
          id: string;
          business_id: string;
          full_name: string;
          role: 'business_owner' | 'staff_member';
          created_at: string;
        },
        {
          id: string;
          business_id: string;
          full_name: string;
          role: 'business_owner' | 'staff_member';
          created_at?: string;
        },
        { full_name?: string }
      >;
      suppliers: Table<
        {
          id: string;
          business_id: string;
          name: string;
          contact_person: string | null;
          email: string | null;
          phone: string | null;
          created_at: string;
        },
        {
          id?: string;
          business_id?: string;
          name: string;
          contact_person?: string | null;
          email?: string | null;
          phone?: string | null;
          created_at?: string;
        },
        {
          name?: string;
          contact_person?: string | null;
          email?: string | null;
          phone?: string | null;
        }
      >;
      products: Table<
        {
          id: string;
          business_id: string;
          name: string;
          sku: string;
          category: ProductCategory;
          description: string | null;
          unit_price: number;
          quantity: number;
          low_stock_threshold: number | null;
          supplier_id: string | null;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          business_id?: string;
          name: string;
          sku: string;
          category: ProductCategory;
          description?: string | null;
          unit_price: number;
          low_stock_threshold?: number | null;
          supplier_id?: string | null;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        },
        {
          name?: string;
          sku?: string;
          category?: ProductCategory;
          description?: string | null;
          unit_price?: number;
          low_stock_threshold?: number | null;
          supplier_id?: string | null;
          is_archived?: boolean;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      current_business_id: { Args: Record<string, never>; Returns: string };
      current_user_role: { Args: Record<string, never>; Returns: string };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export const productCategories = [
  'Stationery',
  'Beverages',
  'Electronics',
  'Hardware',
  'Consumables',
  'General',
] as const;

export type ProductCategory = (typeof productCategories)[number];

export type Product = Database['public']['Tables']['products']['Row'] & {
  supplier?: Pick<Database['public']['Tables']['suppliers']['Row'], 'id' | 'name'> | null;
};

export type ProductInput = Pick<
  Database['public']['Tables']['products']['Insert'],
  'name' | 'sku' | 'category' | 'description' | 'unit_price' | 'low_stock_threshold' | 'supplier_id'
>;

export type UserProfile = Database['public']['Tables']['user_profiles']['Row'] & {
  business_name: string;
};
