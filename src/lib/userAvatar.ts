export function getInitials(
  firstName?: string | null,
  lastName?: string | null,
  email?: string | null
): string {
  const fn = (firstName ?? "").trim();
  const ln = (lastName ?? "").trim();
  if (fn && ln) return (fn[0] + ln[0]).toUpperCase();

  const em = (email ?? "").trim();
  if (em) {
    // Use first two alphabetic characters from email as initials
    const letters = (em.match(/[a-zA-Z]/g) || []).join("").slice(0, 2).toUpperCase();
    if (letters.length === 2) return letters;
    if (letters.length === 1) return (letters + letters).slice(0, 2); // duplicate if only one letter
  }
  // Fallback
  return "UU";
}

export function getAvatarColorClasses(key: string): { bgClass: string; textClass: string } {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  const palette = [
    { bgClass: "bg-primary", textClass: "text-primary-foreground" },
    { bgClass: "bg-secondary", textClass: "text-secondary-foreground" },
    { bgClass: "bg-accent", textClass: "text-accent-foreground" },
  ] as const;
  const idx = Math.abs(hash) % palette.length;
  return palette[idx];
}
