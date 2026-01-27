/**
 * Calcola lo scale ottimale per adattare un PDF al suo contenitore
 * @param basePageWidth - Larghezza originale della pagina PDF
 * @param basePageHeight - Altezza originale della pagina PDF
 * @param containerWidthVw - Larghezza del contenitore in viewport width (0-100)
 * @param containerHeightVh - Altezza del contenitore in viewport height (0-100)
 * @returns Lo scale in percentuale (es. 75 per 75%)
 */
export function calculateFitToContainerScale(
  basePageWidth: number,
  basePageHeight: number,
  containerWidthVw: number,
  containerHeightVh: number
): number {
  if (basePageWidth === 0 || basePageHeight === 0) return 100;
  
  const containerWidth = window.innerWidth * (containerWidthVw / 100);
  const containerHeight = window.innerHeight * (containerHeightVh / 100);
  
  const scaleX = (containerWidth / basePageWidth) * 100;
  const scaleY = (containerHeight / basePageHeight) * 100;
  
  return Math.floor(Math.min(scaleX, scaleY));
}
