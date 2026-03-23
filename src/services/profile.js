import { profile } from "../data/mockData";

export async function fetchProfile() {
  return profile;
}

export async function fetchProfileActivity() {
  return { activitySeries: profile.activitySeries };
}
