/**
 * Helper functions para trabalhar com nomes de usuário
 */

type UserWithName = {
  firstName?: string | null;
  lastName?: string | null;
};

/**
 * Obtém o nome completo do usuário
 */
export function getUserFullName(user: UserWithName | null | undefined): string {
  if (!user) return "Usuário";

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return fullName || "Usuário";
}

/**
 * Obtém apenas o primeiro nome do usuário
 */
export function getUserFirstName(user: UserWithName | null | undefined): string {
  if (!user) return "";
  return user.firstName || "";
}

/**
 * Obtém apenas o sobrenome do usuário
 */
export function getUserLastName(user: UserWithName | null | undefined): string {
  if (!user) return "";
  return user.lastName || "";
}

/**
 * Obtém a primeira letra do nome (para avatares)
 */
export function getUserInitials(user: UserWithName | null | undefined): string {
  if (!user) return "U";

  const firstName = getUserFirstName(user);
  const lastName = getUserLastName(user);

  if (firstName && lastName) {
    return (firstName[0] + lastName[0]).toUpperCase();
  }

  if (firstName) {
    return firstName[0].toUpperCase();
  }

  return "U";
}

