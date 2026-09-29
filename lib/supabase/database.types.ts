export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type ProfileRow = {
  id: string;
  full_name: string;
  date_of_birth: string;
  created_at: string;
  updated_at: string;
};

type ExpenseRow = {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  category: string;
  spent_on: string;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Omit<ProfileRow, "created_at" | "updated_at"> &
          Partial<Pick<ProfileRow, "created_at" | "updated_at">>;
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      expenses: {
        Row: ExpenseRow;
        Insert: Omit<ExpenseRow, "id" | "created_at" | "updated_at"> &
          Partial<Pick<ExpenseRow, "id" | "created_at" | "updated_at">>;
        Update: Partial<Omit<ExpenseRow, "id" | "user_id">>;
        Relationships: [
          {
            foreignKeyName: "expenses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
