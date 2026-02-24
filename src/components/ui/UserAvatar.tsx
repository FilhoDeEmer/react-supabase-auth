import { useAuth } from "../../auth/AuthProvider";

type Props = {
  size?: number;
};

export default function UserAvatar({ size = 32 }: Props) {
  const { profile } = useAuth();

  const displayName = profile?.display_name || "User";

  const initials = displayName.charAt(0).toUpperCase();

  if (profile?.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt={displayName}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold border border-zinc-700"
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}
