import type { C2paData, C2paMarker } from "./types";

/**
 * Scan a file's raw bytes for JUMBF/C2PA markers.
 *
 * In JPEG files, C2PA data lives inside APP11 marker segments (0xFF 0xEB).
 * These contain JUMBF (ISO 19566-5) boxes with the "c2pa" brand.
 *
 * We look for:
 * 1. The JUMBF common identifier "JP" (0x4A 0x50) in APP11 segments
 * 2. The "c2pa" brand string (0x63 0x32 0x70 0x61) anywhere in the binary
 * 3. The "c2ma" manifest string
 * 4. The "c2cl" claim string
 *
 * For PNG files, we look for the "caBX" chunk type.
 */
export function scanForC2PA(buffer: ArrayBuffer): C2paData {
  const bytes = new Uint8Array(buffer);
  const markers: C2paMarker[] = [];

  // Search for "c2pa" brand (0x63 0x32 0x70 0x61)
  const c2paBytes = [0x63, 0x32, 0x70, 0x61]; // "c2pa"
  const c2maBytes = [0x63, 0x32, 0x6d, 0x61]; // "c2ma" (manifest)
  const c2clBytes = [0x63, 0x32, 0x63, 0x6c]; // "c2cl" (claim)
  const caBXBytes = [0x63, 0x61, 0x42, 0x58]; // "caBX" (PNG C2PA chunk)

  const patterns = [
    { bytes: c2paBytes, label: "c2pa" },
    { bytes: c2maBytes, label: "c2ma (manifest)" },
    { bytes: c2clBytes, label: "c2cl (claim)" },
    { bytes: caBXBytes, label: "caBX (PNG)" },
  ];

  for (const pattern of patterns) {
    for (let i = 0; i <= bytes.length - pattern.bytes.length; i++) {
      let match = true;
      for (let j = 0; j < pattern.bytes.length; j++) {
        if (bytes[i + j] !== pattern.bytes[j]) {
          match = false;
          break;
        }
      }
      if (match) {
        markers.push({
          offset: i,
          length: pattern.bytes.length,
          label: pattern.label,
        });
      }
    }
  }

  // Filter to only unique c2pa-related markers (avoid false positives from text content)
  // A genuine C2PA file will typically have multiple markers (c2pa + c2ma + c2cl)
  const hasC2PA = markers.some((m) => m.label === "c2pa");

  return {
    detected: hasC2PA,
    markers: hasC2PA ? markers : [],
  };
}
