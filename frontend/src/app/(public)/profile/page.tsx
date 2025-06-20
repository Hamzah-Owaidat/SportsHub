import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";


export default function ProfilePage() {
    return (
        <div className="mx-auto max-w-6xl px-2 sm:px-6 lg:px-8">
            <UserMetaCard />
            <br />
            <br />
            <UserInfoCard />
        </div>
    )
}