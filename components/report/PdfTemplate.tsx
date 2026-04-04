import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import type { PhotoAnalysis, ConsistencyCheck } from "@/lib/types";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  header: {
    borderBottom: "2pt solid #00cc6a",
    paddingBottom: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#0a0e17",
  },
  subtitle: {
    fontSize: 10,
    color: "#666",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#0a0e17",
    backgroundColor: "#f0f0f0",
    padding: "6 8",
    marginTop: 14,
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    borderBottom: "0.5pt solid #e0e0e0",
    paddingVertical: 3,
  },
  label: {
    width: "35%",
    color: "#666",
  },
  value: {
    width: "65%",
    color: "#1a1a1a",
  },
  mono: {
    fontFamily: "Courier",
    fontSize: 7.5,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 6,
    marginBottom: 2,
    borderRadius: 3,
  },
  badgePass: { backgroundColor: "#d1fae5" },
  badgeWarn: { backgroundColor: "#fef3c7" },
  badgeFail: { backgroundColor: "#fecaca" },
  badgeInfo: { backgroundColor: "#dbeafe" },
  badgeUnknown: { backgroundColor: "#f3f4f6" },
  badgeText: { fontSize: 8 },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: "0.5pt solid #ccc",
    paddingTop: 8,
    fontSize: 7,
    color: "#999",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  photoTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#0a0e17",
    marginTop: 10,
    marginBottom: 6,
    paddingBottom: 4,
    borderBottom: "1pt solid #00cc6a",
  },
});

const statusIcon: Record<string, string> = {
  pass: "[OK]",
  warn: "[!]",
  fail: "[X]",
  info: "[i]",
  unknown: "[?]",
};

const badgeStyle: Record<string, Style> = {
  pass: styles.badgePass,
  warn: styles.badgeWarn,
  fail: styles.badgeFail,
  info: styles.badgeInfo,
  unknown: styles.badgeUnknown,
};

function DataRowPdf({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value && value !== "0") return null;
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value ?? "—"}</Text>
    </View>
  );
}

function CheckBadge({ check }: { check: ConsistencyCheck }) {
  return (
    <View style={[styles.badge, badgeStyle[check.status] || styles.badgeUnknown]}>
      <Text style={styles.badgeText}>
        {statusIcon[check.status]} {check.label}: {check.detail}
      </Text>
    </View>
  );
}

function PhotoPage({ photo, index }: { photo: PhotoAnalysis; index: number }) {
  const f = photo.file;
  const d = photo.exifDevice;
  const c = photo.exifCapture;
  const t = photo.exifTemporal;
  const g = photo.gps;

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.photoTitle}>
        Foto {index + 1}: {f.name}
      </Text>

      {/* File Data */}
      <Text style={styles.sectionTitle}>Datos del Archivo</Text>
      <DataRowPdf label="Nombre" value={f.name} />
      <DataRowPdf label="Tamano" value={`${f.sizeHuman} (${f.size.toLocaleString()} bytes)`} />
      <DataRowPdf label="Tipo MIME" value={f.mimeType} />
      <DataRowPdf
        label="Dimensiones"
        value={f.width && f.height ? `${f.width} x ${f.height} px` : null}
      />
      <View style={styles.row}>
        <Text style={styles.label}>SHA-256</Text>
        <Text style={[styles.value, styles.mono]}>{f.sha256}</Text>
      </View>
      {f.phash && (
        <View style={styles.row}>
          <Text style={styles.label}>pHash</Text>
          <Text style={[styles.value, styles.mono]}>{f.phash}</Text>
        </View>
      )}

      {/* Device */}
      <Text style={styles.sectionTitle}>Dispositivo</Text>
      <DataRowPdf label="Fabricante" value={d.make} />
      <DataRowPdf label="Modelo" value={d.model} />
      <DataRowPdf label="Lente" value={d.lensModel} />
      <DataRowPdf label="Software" value={d.software} />
      <DataRowPdf label="N/S" value={d.serialNumber} />

      {/* Capture */}
      <Text style={styles.sectionTitle}>Parametros de Captura</Text>
      <DataRowPdf label="Apertura" value={c.fNumber !== null ? `f/${c.fNumber}` : null} />
      <DataRowPdf label="Exposicion" value={c.exposureTimeFormatted} />
      <DataRowPdf label="ISO" value={c.iso !== null ? String(c.iso) : null} />
      <DataRowPdf label="Focal" value={c.focalLength !== null ? `${c.focalLength} mm` : null} />
      <DataRowPdf label="Flash" value={c.flash} />
      <DataRowPdf label="Balance blancos" value={c.whiteBalance} />

      {/* Dates */}
      <Text style={styles.sectionTitle}>Fechas</Text>
      <DataRowPdf label="Original" value={t.dateTimeOriginal} />
      <DataRowPdf label="Digitalizada" value={t.dateTimeDigitized} />
      <DataRowPdf label="Modificacion" value={t.dateTime} />
      <DataRowPdf label="Offset TZ" value={t.offsetTimeOriginal} />

      {/* GPS */}
      {g.latitude !== null && g.longitude !== null && (
        <>
          <Text style={styles.sectionTitle}>Geolocalizacion</Text>
          <DataRowPdf label="Latitud" value={String(g.latitude)} />
          <DataRowPdf label="Longitud" value={String(g.longitude)} />
          <DataRowPdf label="Altitud" value={g.altitude !== null ? `${g.altitude} m` : null} />
          <DataRowPdf label="Google Maps" value={g.googleMapsUrl} />
        </>
      )}

      {/* Consistency */}
      <Text style={styles.sectionTitle}>Senales de Integridad</Text>
      {photo.consistency.map((check, i) => (
        <CheckBadge key={i} check={check} />
      ))}

      <View style={styles.footer}>
        <Text>CertiFoto Forensic — Informe Pericial</Text>
        <Text>Generado: {new Date().toLocaleString("es-CL")}</Text>
      </View>
    </Page>
  );
}

interface PdfTemplateProps {
  photos: PhotoAnalysis[];
  generatedAt: string;
}

export function PdfTemplate({ photos, generatedAt }: PdfTemplateProps) {
  return (
    <Document>
      {/* Cover page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>CertiFoto Forensic</Text>
          <Text style={styles.subtitle}>
            Informe de Analisis de Metadata de Imagenes
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Fecha del informe</Text>
          <Text style={styles.value}>
            {new Date(generatedAt).toLocaleString("es-CL")}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total de imagenes</Text>
          <Text style={styles.value}>{photos.length}</Text>
        </View>

        <Text style={{ marginTop: 20, fontSize: 8, color: "#999", lineHeight: 1.6 }}>
          Este informe fue generado automaticamente por CertiFoto Forensic.
          Contiene un analisis de la metadata disponible en cada imagen,
          incluyendo datos EXIF, GPS, IPTC/XMP, perfiles de color, hashes
          criptograficos y verificaciones de integridad. Toda la informacion
          fue extraida directamente de los archivos sin modificacion.
        </Text>

        <View style={styles.footer}>
          <Text>CertiFoto Forensic — Informe Pericial</Text>
          <Text>Pagina 1</Text>
        </View>
      </Page>

      {/* One page per photo */}
      {photos.map((photo, i) => (
        <PhotoPage key={i} photo={photo} index={i} />
      ))}
    </Document>
  );
}
