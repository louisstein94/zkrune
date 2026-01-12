// Supabase Database Types
// Generated from schema - update after creating tables

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // Governance Proposals
      proposals: {
        Row: {
          id: string;
          type: 'template' | 'feature' | 'parameter';
          title: string;
          description: string;
          creator: string;
          created_at: string;
          ends_at: string;
          status: 'active' | 'passed' | 'rejected' | 'executed';
          votes_for: number;
          votes_against: number;
          voter_count: number;
          quorum_reached: boolean;
          template_data: Json | null;
          feature_data: Json | null;
        };
        Insert: {
          id?: string;
          type: 'template' | 'feature' | 'parameter';
          title: string;
          description: string;
          creator: string;
          created_at?: string;
          ends_at: string;
          status?: 'active' | 'passed' | 'rejected' | 'executed';
          votes_for?: number;
          votes_against?: number;
          voter_count?: number;
          quorum_reached?: boolean;
          template_data?: Json | null;
          feature_data?: Json | null;
        };
        Update: {
          id?: string;
          type?: 'template' | 'feature' | 'parameter';
          title?: string;
          description?: string;
          creator?: string;
          created_at?: string;
          ends_at?: string;
          status?: 'active' | 'passed' | 'rejected' | 'executed';
          votes_for?: number;
          votes_against?: number;
          voter_count?: number;
          quorum_reached?: boolean;
          template_data?: Json | null;
          feature_data?: Json | null;
        };
      };

      // Governance Votes
      votes: {
        Row: {
          id: string;
          proposal_id: string;
          voter: string;
          support: boolean;
          weight: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          proposal_id: string;
          voter: string;
          support: boolean;
          weight: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          proposal_id?: string;
          voter?: string;
          support?: boolean;
          weight?: number;
          created_at?: string;
        };
      };

      // Marketplace Templates
      marketplace_templates: {
        Row: {
          id: string;
          name: string;
          description: string;
          creator: string;
          creator_address: string;
          price: number;
          category: string;
          circuit_code: string;
          nodes: Json | null;
          edges: Json | null;
          created_at: string;
          updated_at: string;
          downloads: number;
          rating: number;
          rating_count: number;
          featured: boolean;
          verified: boolean;
          tags: string[];
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          creator: string;
          creator_address: string;
          price: number;
          category: string;
          circuit_code: string;
          nodes?: Json | null;
          edges?: Json | null;
          created_at?: string;
          updated_at?: string;
          downloads?: number;
          rating?: number;
          rating_count?: number;
          featured?: boolean;
          verified?: boolean;
          tags?: string[];
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          creator?: string;
          creator_address?: string;
          price?: number;
          category?: string;
          circuit_code?: string;
          nodes?: Json | null;
          edges?: Json | null;
          created_at?: string;
          updated_at?: string;
          downloads?: number;
          rating?: number;
          rating_count?: number;
          featured?: boolean;
          verified?: boolean;
          tags?: string[];
        };
      };

      // Marketplace Purchases
      purchases: {
        Row: {
          id: string;
          template_id: string;
          buyer: string;
          seller: string;
          price: number;
          platform_fee: number;
          creator_revenue: number;
          transaction_signature: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          template_id: string;
          buyer: string;
          seller: string;
          price: number;
          platform_fee: number;
          creator_revenue: number;
          transaction_signature?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          template_id?: string;
          buyer?: string;
          seller?: string;
          price?: number;
          platform_fee?: number;
          creator_revenue?: number;
          transaction_signature?: string | null;
          created_at?: string;
        };
      };

      // Staking Positions
      staking_positions: {
        Row: {
          id: string;
          staker: string;
          amount: number;
          lock_period_days: number;
          multiplier: number;
          staked_at: string;
          unlocks_at: string;
          last_claim_at: string;
          total_claimed: number;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          staker: string;
          amount: number;
          lock_period_days: number;
          multiplier: number;
          staked_at?: string;
          unlocks_at: string;
          last_claim_at?: string;
          total_claimed?: number;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          staker?: string;
          amount?: number;
          lock_period_days?: number;
          multiplier?: number;
          staked_at?: string;
          unlocks_at?: string;
          last_claim_at?: string;
          total_claimed?: number;
          is_active?: boolean;
        };
      };

      // Premium Status
      premium_status: {
        Row: {
          id: string;
          wallet: string;
          tier: 'FREE' | 'BUILDER' | 'PRO' | 'ENTERPRISE';
          total_burned: number;
          unlocked_at: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wallet: string;
          tier?: 'FREE' | 'BUILDER' | 'PRO' | 'ENTERPRISE';
          total_burned?: number;
          unlocked_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wallet?: string;
          tier?: 'FREE' | 'BUILDER' | 'PRO' | 'ENTERPRISE';
          total_burned?: number;
          unlocked_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Burn History
      burn_history: {
        Row: {
          id: string;
          wallet: string;
          amount: number;
          tier: string;
          transaction_signature: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          wallet: string;
          amount: number;
          tier: string;
          transaction_signature: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          wallet?: string;
          amount?: number;
          tier?: string;
          transaction_signature?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
