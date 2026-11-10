import { createClient } from "./client";

export async function getCurrentMember() {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      user: null,
      profile: null,
      error: "You must be logged in.",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, member_status")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return {
      user,
      profile: null,
      error: profileError.message,
    };
  }

  return {
    user,
    profile,
    error: null,
  };
}

export function isApprovedMember(
  memberStatus: string | null | undefined
) {
  return memberStatus === "approved";
}