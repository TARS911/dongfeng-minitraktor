/**
 * Authentication и Authorization утилиты
 * Используются для проверки прав доступа в API routes и middleware
 */

import { supabase } from "./supabase";

/**
 * Проверка является ли пользователь администратором
 * @param userId - UUID пользователя из auth.uid()
 * @returns true если пользователь admin, false иначе
 */
export async function isAdmin(userId: string | undefined): Promise<boolean> {
  if (!userId) return false;

  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (error) {
      console.error("Error checking admin role:", error);
      return false;
    }

    return data !== null;
  } catch (error) {
    console.error("Error in isAdmin:", error);
    return false;
  }
}

/**
 * Получить текущего аутентифицированного пользователя
 * @returns user объект или null
 */
export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Error getting current user:", error);
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
}

/**
 * Проверка аутентификации из Request headers
 * Используется в API routes
 */
export async function getUserFromRequest(
  request: Request,
): Promise<string | null> {
  try {
    // Получаем токен из Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.replace("Bearer ", "");

    // Верифицируем токен
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    return user.id;
  } catch (error) {
    console.error("Error in getUserFromRequest:", error);
    return null;
  }
}

/**
 * Middleware helper: проверка admin доступа
 * Возвращает 401/403 если не авторизован или не admin
 */
export async function requireAdmin(
  request: Request,
): Promise<{ userId: string } | Response> {
  const userId = await getUserFromRequest(request);

  if (!userId) {
    return new Response(
      JSON.stringify({ error: "Unauthorized. Please login." }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const adminCheck = await isAdmin(userId);

  if (!adminCheck) {
    return new Response(
      JSON.stringify({ error: "Forbidden. Admin access required." }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  return { userId };
}

/**
 * Проверка роли пользователя
 * @param userId - ID пользователя
 * @param role - роль для проверки ('admin', 'manager', 'customer')
 */
export async function hasRole(
  userId: string | undefined,
  role: string,
): Promise<boolean> {
  if (!userId) return false;

  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", role)
      .maybeSingle();

    if (error) {
      console.error(`Error checking ${role} role:`, error);
      return false;
    }

    return data !== null;
  } catch (error) {
    console.error(`Error in hasRole(${role}):`, error);
    return false;
  }
}

/**
 * Получить все роли пользователя
 */
export async function getUserRoles(
  userId: string | undefined,
): Promise<string[]> {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching user roles:", error);
      return [];
    }

    return data?.map((r) => r.role) || [];
  } catch (error) {
    console.error("Error in getUserRoles:", error);
    return [];
  }
}
