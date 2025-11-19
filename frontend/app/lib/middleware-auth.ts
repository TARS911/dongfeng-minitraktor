/**
 * Middleware Auth Helper
 * Проверка авторизации для защищённых маршрутов
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "./supabase";

/**
 * Проверка admin доступа в middleware
 * Используется для защиты /admin/* маршрутов
 */
export async function checkAdminAccess(
  request: NextRequest,
): Promise<NextResponse | null> {
  try {
    // Получаем токен из cookies
    const token = request.cookies.get("sb-access-token")?.value;

    if (!token) {
      // Редирект на страницу авторизации
      const url = request.nextUrl.clone();
      url.pathname = "/auth";
      url.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // Проверяем токен
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth";
      url.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // Проверяем роль admin
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roles) {
      // Пользователь не admin - показываем 403
      return new NextResponse("Forbidden. Admin access required.", {
        status: 403,
      });
    }

    // Всё ОК, пользователь - admin
    return null;
  } catch (error) {
    console.error("Middleware auth error:", error);
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }
}
