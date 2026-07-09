import type { Modul } from "@/db/schema";
import {
  isArchimedesModul,
  isBandulSederhanaModul,
  isCahayaOptikModul,
  isHookeSpringModul,
  isJatuhBebasModul,
  isNewtonModul,
  isRangkaianModul,
  isReaksiKimiaModul,
  isTataSuryaModul,
  isThermalChangeModul,
} from "@/lib/modul-utils";

export type ModuleIllustrationType =
  | "freeFall"
  | "newton"
  | "circuit"
  | "chemistry"
  | "orbit"
  | "archimedes"
  | "optics"
  | "pendulum"
  | "spring"
  | "heat"
  | "default";

export function getModuleIllustrationType(
  modul: Pick<Modul, "judul">,
): ModuleIllustrationType {
  if (isJatuhBebasModul(modul)) return "freeFall";
  if (isNewtonModul(modul)) return "newton";
  if (isRangkaianModul(modul)) return "circuit";
  if (isReaksiKimiaModul(modul)) return "chemistry";
  if (isTataSuryaModul(modul)) return "orbit";
  if (isArchimedesModul(modul)) return "archimedes";
  if (isCahayaOptikModul(modul)) return "optics";
  if (isBandulSederhanaModul(modul)) return "pendulum";
  if (isHookeSpringModul(modul)) return "spring";
  if (isThermalChangeModul(modul)) return "heat";
  return "default";
}
