import { Metadata } from "next";
import TeamInfoCard from "@/components/user-profile/TeamInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";

export const metadata: Metadata = {
  title: "Profile | SportsHub",
  description: "View and manage your user profile and team details on SportsHub.",
};

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <UserMetaCard />
      <TeamInfoCard />
    </div>
  );
}
