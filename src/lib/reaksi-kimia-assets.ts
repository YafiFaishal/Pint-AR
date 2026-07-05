/**
 * Re-export aset AR Reaksi Kimia (alias Indonesia).
 * Implementasi utama: chemistry-assets.ts
 */

export {
  CHEMISTRY_AR_GLB_URL as REAKSI_KIMIA_AR_GLB_URL,
  CHEMISTRY_AR_USDZ_URL as REAKSI_KIMIA_AR_USDZ_URL,
  CHEMISTRY_AR_GLB_UNAVAILABLE_MESSAGE as REAKSI_KIMIA_AR_GLB_UNAVAILABLE_MESSAGE,
  CHEMISTRY_AR_IOS_UNAVAILABLE_MESSAGE as REAKSI_KIMIA_AR_IOS_UNAVAILABLE_MESSAGE,
  CHEMISTRY_AR_IOS_HINT as REAKSI_KIMIA_AR_IOS_HINT,
  CHEMISTRY_AR_DESKTOP_HINT as REAKSI_KIMIA_AR_DESKTOP_HINT,
  CHEMISTRY_AR_GLB_HINT as REAKSI_KIMIA_AR_GLB_HINT,
  getChemistryArModelUrls as getReaksiKimiaArModelUrls,
  checkChemistryArAssetsAvailable as checkReaksiKimiaArAssetsAvailable,
  getChemistryArButtonState as getReaksiKimiaArButtonState,
  shouldMountChemistryArViewer as shouldMountReaksiKimiaArViewer,
  type ChemistryArAssetStatus as ReaksiKimiaArAssetStatus,
  type ChemistryArButtonState as ReaksiKimiaArButtonState,
  type ChemistryArModelUrls as ReaksiKimiaArModelUrls,
} from "./chemistry-assets";
