// Server-only module: PRIVATE safety/emergency data for an individual
// account (birth date, city, blood type, medical conditions, emergency
// contact) — based on the "Ficha de Inscrição" the owner provided. This is
// deliberately its OWN table (not columns on `operators`, which teams can
// read/write via the Ficha da Equipe): only the account owner (via
// src/app/conta/actions.ts) and the site admin (read-only, for a real
// emergency in the field) ever touch this module. Never expose it to a
// team's portal or any public page.

import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "./supabase";

function db(): SupabaseClient {
  return supabase() as SupabaseClient;
}

export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

export type SafetyInfo = {
  userId: string;
  birthDate: string | null; // "AAAA-MM-DD"
  city: string;
  bloodType: string | null;
  medicalConditions: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
};

type SafetyInfoRow = {
  user_id: string;
  birth_date: string | null;
  city: string;
  blood_type: string | null;
  medical_conditions: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
};

function rowToSafetyInfo(row: SafetyInfoRow): SafetyInfo {
  return {
    userId: row.user_id,
    birthDate: row.birth_date,
    city: row.city,
    bloodType: row.blood_type,
    medicalConditions: row.medical_conditions,
    emergencyContactName: row.emergency_contact_name,
    emergencyContactPhone: row.emergency_contact_phone,
  };
}

function defaultSafetyInfo(userId: string): SafetyInfo {
  return {
    userId,
    birthDate: null,
    city: "",
    bloodType: null,
    medicalConditions: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  };
}

/** Returns the account's safety info, or sensible defaults if never saved (no row is force-inserted just from a read). */
export async function getSafetyInfo(userId: string): Promise<SafetyInfo> {
  const { data, error } = await db()
    .from("operator_safety_info")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle<SafetyInfoRow>();

  if (error || !data) return defaultSafetyInfo(userId);
  return rowToSafetyInfo(data);
}

export type UpdateSafetyInfoInput = {
  birthDate: string | null;
  city: string;
  bloodType: string | null;
  medicalConditions: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
};

export async function updateSafetyInfo(userId: string, input: UpdateSafetyInfoInput): Promise<SafetyInfo> {
  const { data, error } = await db()
    .from("operator_safety_info")
    .upsert(
      {
        user_id: userId,
        birth_date: input.birthDate,
        city: input.city,
        blood_type: input.bloodType,
        medical_conditions: input.medicalConditions,
        emergency_contact_name: input.emergencyContactName,
        emergency_contact_phone: input.emergencyContactPhone,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select("*")
    .maybeSingle<SafetyInfoRow>();

  if (error || !data) return { userId, ...input };
  return rowToSafetyInfo(data);
}

/** Every account's safety info, keyed by user id — for the admin's read-only "Dados de segurança" view (emergency use only). */
export async function getAllSafetyInfo(): Promise<Map<string, SafetyInfo>> {
  const { data, error } = await db().from("operator_safety_info").select("*").returns<SafetyInfoRow[]>();

  if (error || !data) return new Map();
  return new Map(data.map((row) => [row.user_id, rowToSafetyInfo(row)]));
}
