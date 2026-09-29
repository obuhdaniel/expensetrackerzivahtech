"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  error?: string;
};

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateBirthDate(dob: string) {
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return false;
  if (birthDate > new Date()) return false;
  return true;
}

export async function register(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const dateOfBirth = String(formData.get("dateOfBirth") ?? "");

  if (!name) return { error: "Name is required." };
  if (!validateEmail(email)) return { error: "Please enter a valid email." };
  if (password.length < 8)
    return { error: "Password must be at least 8 characters long." };
  if (password !== confirmPassword)
    return { error: "Passwords do not match." };
  if (!validateBirthDate(dateOfBirth))
    return { error: "Please enter a valid date of birth." };

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        date_of_birth: dateOfBirth,
      },
    },
  });

  if (error) return { error: error.message };

  if (data.user) {
    await supabase
      .from("profiles")
      .insert({ id: data.user.id, full_name: name, date_of_birth: dateOfBirth });
  }

  redirect("/dashboard");
}

export async function login(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!validateEmail(email)) return { error: "Please enter a valid email." };
  if (!password) return { error: "Password is required." };

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}