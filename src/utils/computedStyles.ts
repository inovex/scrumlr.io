// get CSS custom property, e.g. "--gray--000" => "#ffffff"
export const getCSSCustomPropertyValue = (property: string) => getComputedStyle(document.documentElement).getPropertyValue(property).trim();
