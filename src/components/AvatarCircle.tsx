import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getInitials, getAvatarColorClasses } from "@/lib/userAvatar";
import React from "react";

interface AvatarCircleProps {
  name?: string | null;
  email?: string | null;
  colorKey: string;
  className?: string;
}

const AvatarCircle: React.FC<AvatarCircleProps> = ({ name, email, colorKey, className }) => {
  const [firstName, lastName] = (name ?? "").trim().split(/\s+/, 2);
  const initials = getInitials(firstName, lastName, email ?? undefined);
  const { bgClass, textClass } = getAvatarColorClasses(colorKey);

  return (
    <Avatar className={cn("h-10 w-10", className)}>
      <AvatarFallback className={cn("uppercase text-sm font-medium", bgClass, textClass)}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

export default AvatarCircle;
