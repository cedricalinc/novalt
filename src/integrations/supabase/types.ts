export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admissions_dossier: {
        Row: {
          commentaire_conseiller: string | null
          created_at: string
          cv_url: string | null
          diplomes_prev_url: string | null
          id: string
          parcours_id: string
          piece_identite_url: string | null
          statut_cv: Database["public"]["Enums"]["statut_cv"]
          statut_dossier: Database["public"]["Enums"]["statut_dossier"]
        }
        Insert: {
          commentaire_conseiller?: string | null
          created_at?: string
          cv_url?: string | null
          diplomes_prev_url?: string | null
          id?: string
          parcours_id: string
          piece_identite_url?: string | null
          statut_cv?: Database["public"]["Enums"]["statut_cv"]
          statut_dossier?: Database["public"]["Enums"]["statut_dossier"]
        }
        Update: {
          commentaire_conseiller?: string | null
          created_at?: string
          cv_url?: string | null
          diplomes_prev_url?: string | null
          id?: string
          parcours_id?: string
          piece_identite_url?: string | null
          statut_cv?: Database["public"]["Enums"]["statut_cv"]
          statut_dossier?: Database["public"]["Enums"]["statut_dossier"]
        }
        Relationships: [
          {
            foreignKeyName: "admissions_dossier_parcours_id_fkey"
            columns: ["parcours_id"]
            isOneToOne: false
            referencedRelation: "parcours_cfa"
            referencedColumns: ["id"]
          },
        ]
      }
      candidatures: {
        Row: {
          candidat_id: string
          created_at: string
          date_acceptation: string | null
          id: string
          offre_id: string
          statut: Database["public"]["Enums"]["statut_candidature"]
          valide_par: Database["public"]["Enums"]["valide_par"] | null
        }
        Insert: {
          candidat_id: string
          created_at?: string
          date_acceptation?: string | null
          id?: string
          offre_id: string
          statut?: Database["public"]["Enums"]["statut_candidature"]
          valide_par?: Database["public"]["Enums"]["valide_par"] | null
        }
        Update: {
          candidat_id?: string
          created_at?: string
          date_acceptation?: string | null
          id?: string
          offre_id?: string
          statut?: Database["public"]["Enums"]["statut_candidature"]
          valide_par?: Database["public"]["Enums"]["valide_par"] | null
        }
        Relationships: [
          {
            foreignKeyName: "candidatures_candidat_id_fkey"
            columns: ["candidat_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidatures_offre_id_fkey"
            columns: ["offre_id"]
            isOneToOne: false
            referencedRelation: "offres_et_ateliers"
            referencedColumns: ["id"]
          },
        ]
      }
      etablissements: {
        Row: {
          created_at: string
          id: string
          nom: string
          ville: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          nom: string
          ville?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          nom?: string
          ville?: string | null
        }
        Relationships: []
      }
      fiches_de_mission: {
        Row: {
          candidature_id: string
          created_at: string
          id: string
          intitule_poste: string | null
          missions_description: string | null
          pdf_url: string | null
          statut_fiche: Database["public"]["Enums"]["statut_fiche"]
        }
        Insert: {
          candidature_id: string
          created_at?: string
          id?: string
          intitule_poste?: string | null
          missions_description?: string | null
          pdf_url?: string | null
          statut_fiche?: Database["public"]["Enums"]["statut_fiche"]
        }
        Update: {
          candidature_id?: string
          created_at?: string
          id?: string
          intitule_poste?: string | null
          missions_description?: string | null
          pdf_url?: string | null
          statut_fiche?: Database["public"]["Enums"]["statut_fiche"]
        }
        Relationships: [
          {
            foreignKeyName: "fiches_de_mission_candidature_id_fkey"
            columns: ["candidature_id"]
            isOneToOne: true
            referencedRelation: "candidatures"
            referencedColumns: ["id"]
          },
        ]
      }
      formations: {
        Row: {
          created_at: string
          etablissement_id: string
          id: string
          intitule: string
          niveau: string | null
        }
        Insert: {
          created_at?: string
          etablissement_id: string
          id?: string
          intitule: string
          niveau?: string | null
        }
        Update: {
          created_at?: string
          etablissement_id?: string
          id?: string
          intitule?: string
          niveau?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "formations_etablissement_id_fkey"
            columns: ["etablissement_id"]
            isOneToOne: false
            referencedRelation: "etablissements"
            referencedColumns: ["id"]
          },
        ]
      }
      offres_et_ateliers: {
        Row: {
          created_at: string
          date_evenement: string | null
          description: string | null
          entreprise_nom: string | null
          id: string
          lieu: string | null
          titre: string
          type: Database["public"]["Enums"]["type_offre"]
        }
        Insert: {
          created_at?: string
          date_evenement?: string | null
          description?: string | null
          entreprise_nom?: string | null
          id?: string
          lieu?: string | null
          titre: string
          type: Database["public"]["Enums"]["type_offre"]
        }
        Update: {
          created_at?: string
          date_evenement?: string | null
          description?: string | null
          entreprise_nom?: string | null
          id?: string
          lieu?: string | null
          titre?: string
          type?: Database["public"]["Enums"]["type_offre"]
        }
        Relationships: []
      }
      parcours_cfa: {
        Row: {
          annee_promotion: number | null
          annee_scolaire: string
          created_at: string
          etape_courante: Database["public"]["Enums"]["etape_parcours"]
          id: string
          intitule_formation: string | null
          profile_id: string
          promotion_id: string | null
        }
        Insert: {
          annee_promotion?: number | null
          annee_scolaire: string
          created_at?: string
          etape_courante?: Database["public"]["Enums"]["etape_parcours"]
          id?: string
          intitule_formation?: string | null
          profile_id: string
          promotion_id?: string | null
        }
        Update: {
          annee_promotion?: number | null
          annee_scolaire?: string
          created_at?: string
          etape_courante?: Database["public"]["Enums"]["etape_parcours"]
          id?: string
          intitule_formation?: string | null
          profile_id?: string
          promotion_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parcours_cfa_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parcours_cfa_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          nom: string | null
          prenom: string | null
          role: Database["public"]["Enums"]["app_role"]
          telephone: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          nom?: string | null
          prenom?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          telephone?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nom?: string | null
          prenom?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          telephone?: string | null
        }
        Relationships: []
      }
      promotions: {
        Row: {
          annee_scolaire: string | null
          created_at: string
          duree_annees: number
          formation_id: string
          id: string
          nom: string
        }
        Insert: {
          annee_scolaire?: string | null
          created_at?: string
          duree_annees?: number
          formation_id: string
          id?: string
          nom: string
        }
        Update: {
          annee_scolaire?: string | null
          created_at?: string
          duree_annees?: number
          formation_id?: string
          id?: string
          nom?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotions_formation_id_fkey"
            columns: ["formation_id"]
            isOneToOne: false
            referencedRelation: "formations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          notif_admissions: boolean
          notif_candidatures: boolean
          notif_documents: boolean
          notif_entretiens: boolean
          user_id: string
        }
        Insert: {
          notif_admissions?: boolean
          notif_candidatures?: boolean
          notif_documents?: boolean
          notif_entretiens?: boolean
          user_id: string
        }
        Update: {
          notif_admissions?: boolean
          notif_candidatures?: boolean
          notif_documents?: boolean
          notif_entretiens?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { _uid: string }; Returns: boolean }
    }
    Enums: {
      app_role: "CANDIDAT" | "ENTREPRISE_TUTEUR" | "ADMIN_CFA" | "FORMATEUR"
      etape_parcours:
        | "01_INSCRIPTION"
        | "02_RECHERCHE"
        | "03_CONTRAT"
        | "04_ENTREPRISE"
        | "05_BILAN"
      statut_candidature:
        | "ENVOYE"
        | "ENTRETIEN_PROGRAMME"
        | "ACCEPTE"
        | "REFUSE"
      statut_cv: "EN_ATTENTE_VALIDATION" | "A_CORRIGER" | "VALIDE_CFA"
      statut_dossier: "BROUILLON" | "EN_REVISION" | "VALIDE" | "INCOMPLET"
      statut_fiche: "GENEREE_AUTOMATIQUEMENT" | "SIGNEE_ELEVE" | "VALIDEE_CFA"
      type_offre: "OFFRE_ALTERNANCE" | "ATELIER_CV" | "EVENEMENT_NETWORKING"
      valide_par: "ETUDIANT" | "CFA_SUBSTITUTION"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["CANDIDAT", "ENTREPRISE_TUTEUR", "ADMIN_CFA", "FORMATEUR"],
      etape_parcours: [
        "01_INSCRIPTION",
        "02_RECHERCHE",
        "03_CONTRAT",
        "04_ENTREPRISE",
        "05_BILAN",
      ],
      statut_candidature: [
        "ENVOYE",
        "ENTRETIEN_PROGRAMME",
        "ACCEPTE",
        "REFUSE",
      ],
      statut_cv: ["EN_ATTENTE_VALIDATION", "A_CORRIGER", "VALIDE_CFA"],
      statut_dossier: ["BROUILLON", "EN_REVISION", "VALIDE", "INCOMPLET"],
      statut_fiche: ["GENEREE_AUTOMATIQUEMENT", "SIGNEE_ELEVE", "VALIDEE_CFA"],
      type_offre: ["OFFRE_ALTERNANCE", "ATELIER_CV", "EVENEMENT_NETWORKING"],
      valide_par: ["ETUDIANT", "CFA_SUBSTITUTION"],
    },
  },
} as const
