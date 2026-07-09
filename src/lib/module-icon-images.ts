import type { Modul } from "@/db/schema";
import {
  getModuleIllustrationType,
  type ModuleIllustrationType,
} from "@/lib/module-illustration-type";

/** PNG final per tipe modul (deteksi via judul — lihat modul-utils). */
export const MODULE_ICON_BY_TYPE: Record<
  Exclude<ModuleIllustrationType, "default">,
  string
> = {
  freeFall: "/module-icons/free-fall.png",
  newton: "/module-icons/newton-force-motion.png",
  circuit: "/module-icons/electric-circuit.png",
  chemistry: "/module-icons/chemical-reaction.png",
  orbit: "/module-icons/solar-system-kepler.png",
  archimedes: "/module-icons/archimedes-principle.png",
  optics: "/module-icons/reflection-refraction.png",
  pendulum: "/module-icons/simple-pendulum.png",
  spring: "/module-icons/hooke-spring.png",
  heat: "/module-icons/heat-temperature.png",
};

/** Pemetaan judul seed → file (dokumentasi & referensi). */
export const MODULE_ICON_BY_JUDUL: Record<string, string> = {
  "Gerak Jatuh Bebas": MODULE_ICON_BY_TYPE.freeFall,
  "Hukum Newton: Gaya & Gerak": MODULE_ICON_BY_TYPE.newton,
  "Rangkaian Listrik Sederhana": MODULE_ICON_BY_TYPE.circuit,
  "Reaksi Kimia": MODULE_ICON_BY_TYPE.chemistry,
  "Tata Surya (Kepler)": MODULE_ICON_BY_TYPE.orbit,
  "Hukum Archimedes": MODULE_ICON_BY_TYPE.archimedes,
  "Pemantulan dan Pembiasan Cahaya": MODULE_ICON_BY_TYPE.optics,
  "Getaran Bandul Sederhana": MODULE_ICON_BY_TYPE.pendulum,
  "Hukum Hooke dan Elastisitas Pegas": MODULE_ICON_BY_TYPE.spring,
  "Kalor dan Perubahan Suhu": MODULE_ICON_BY_TYPE.heat,
};

const ICON_INTRINSIC = 1254;

export function getModuleIconSrc(modul: Pick<Modul, "judul">): string | null {
  const type = getModuleIllustrationType(modul);
  if (type === "default") return null;
  return MODULE_ICON_BY_TYPE[type];
}

export { ICON_INTRINSIC as MODULE_ICON_INTRINSIC_SIZE };
