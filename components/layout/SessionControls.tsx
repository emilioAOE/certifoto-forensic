"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogIn, LogOut } from "lucide-react";
import { useSupabaseUser } from "@/lib/supabase/use-user";

/**
 * Tarjeta de usuario del sidebar. Con sesión muestra el email de la cuenta;
 * sin sesión, el perfil local (mock del MVP) e invita a iniciar sesión.
 */
export function CurrentUserCard() {
  const { user, loading } = useSupabaseUser();
  const [localName, setLocalName] = useState("");
  const [localRole, setLocalRole] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Lazy import para evitar SSR del cache de IndexedDB.
    import("@/lib/storage").then(({ getCurrentUser, subscribeToStorageChanges }) => {
      const refresh = () => {
        const u = getCurrentUser();
        setLocalName(u.name);
        setLocalRole(u.role);
      };
      refresh();
      subscribeToStorageChanges(refresh);
    });
  }, []);

  const roleLabel: Record<string, string> = {
    broker: "Corredor",
    landlord: "Arrendador",
    tenant: "Arrendatario",
    property_manager: "Administrador",
    admin: "Administrador",
  };

  const display = user?.email ?? localName;
  if (!display) return null;

  const initials = (user?.email ? user.email : localName)
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <Link
      href="/configuracion"
      className="block px-3 py-2.5 mx-2 mt-2 rounded-md bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors"
      title="Editar perfil en configuración"
    >
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold">
          {initials || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{display}</p>
          <p className="text-[10px] text-gray-500 truncate">
            {user
              ? "Cuenta CertiFoto"
              : loading
                ? roleLabel[localRole] ?? localRole
                : `${roleLabel[localRole] ?? localRole} · sin cuenta`}
          </p>
        </div>
      </div>
    </Link>
  );
}

/** Botón inferior del sidebar: Iniciar sesión / Cerrar sesión. */
export function SessionButton() {
  const { user, loading, signOut } = useSupabaseUser();

  if (loading) return null;

  if (user) {
    return (
      <button
        onClick={() => void signOut()}
        className="flex items-center justify-center gap-2 w-full rounded-md bg-gray-50 border border-gray-200 hover:border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 transition-colors"
      >
        <LogOut className="h-3.5 w-3.5" />
        Cerrar sesión
      </button>
    );
  }

  return (
    <Link
      href="/login"
      className="flex items-center justify-center gap-2 w-full rounded-md bg-accent-softer border border-accent-light hover:border-accent px-3 py-1.5 text-xs font-medium text-accent-dark transition-colors"
      title="Guarda tus créditos y actas en una cuenta"
    >
      <LogIn className="h-3.5 w-3.5" />
      Iniciar sesión
    </Link>
  );
}
