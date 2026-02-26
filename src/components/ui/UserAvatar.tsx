import { useAuth } from "../../auth/AuthProvider";
import { useState } from "react";

type Props = {
  size?: number;
};

export default function UserAvatar({ size = 32 }: Props) {
  const { profile } = useAuth();
  const [imgError, setImgError] = useState(false);

  const displayName = profile?.display_name?.trim() || "User";

  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join("");

  if (profile?.avatar_url && !imgError) {
    return (
      <img
        src={profile.avatar_url}
        alt={displayName}
        onError={() => setImgError(true)}
        className="rounded-full object-cover border border-zinc-700"
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