import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/env";
import { enviarCorreo, listmonkConfigurado } from "@/lib/correo";
import { correoSeguimiento } from "@/lib/correo-plantillas";

/**
 * Cron diario (vercel.json): correo de seguimiento a las cuentas que cumplen
 * 7 días y ya entraron al menos una vez.
 *
 * Seguridad: Vercel invoca la ruta con `Authorization: Bearer $CRON_SECRET`.
 * El mismo secreto (sha256 en cf_config) abre la RPC cf_seguimiento_reclamar,
 * que marca las filas antes de devolverlas: dos ejecuciones simultáneas no
 * duplican correos. Si un envío falla, se libera la fila para mañana.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface Pendiente {
  user_id: string;
  email: string;
  nombre: string | null;
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!listmonkConfigurado()) {
    return NextResponse.json(
      { ok: false, error: "correo no configurado" },
      { status: 503 }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.rpc("cf_seguimiento_reclamar", {
    p_secret: secret,
    p_limite: 40,
  });
  if (error) {
    console.error("[cron seguimiento] reclamar:", error.message);
    return NextResponse.json({ ok: false, error: "db" }, { status: 500 });
  }

  const pendientes = (data ?? []) as Pendiente[];
  const responderA = process.env.LEAD_NOTIFY_EMAIL?.trim() || undefined;
  let enviados = 0;
  let fallidos = 0;

  for (const fila of pendientes) {
    const correo = correoSeguimiento({ email: fila.email, nombre: fila.nombre });
    const r = await enviarCorreo({
      para: fila.email,
      asunto: correo.asunto,
      html: correo.html,
      texto: correo.texto,
      responderA,
    });
    if (r.ok) {
      enviados++;
    } else {
      fallidos++;
      await supabase.rpc("cf_seguimiento_deshacer", {
        p_secret: secret,
        p_user_id: fila.user_id,
      });
    }
    // SES comparte 14 msg/s con las campañas de Expansiel: sin ráfagas.
    await new Promise((res) => setTimeout(res, 150));
  }

  return NextResponse.json({ ok: true, pendientes: pendientes.length, enviados, fallidos });
}
