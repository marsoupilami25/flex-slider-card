export enum FlexSliderCardEntityType {
  NUMBER = "number",
  TIME = "time",
  COVER = "cover"
}

export type FlexSliderEntityDomain = "number" | "input_number" | "input_datetime" | "cover";

export const FLEX_SLIDER_ENTITY_DOMAINS: FlexSliderEntityDomain[] = [
  "number",
  "input_number",
  "input_datetime",
  "cover",
];

export const FLEX_SLIDER_NUMBER_ENTITY_DOMAINS: FlexSliderEntityDomain[] = [
  "number",
  "input_number",
];

export function isNumericEntityType(entityType: FlexSliderCardEntityType): boolean {
  return entityType === FlexSliderCardEntityType.NUMBER ||
    entityType === FlexSliderCardEntityType.COVER;
}

export function isValidEntityId(entity: unknown): entity is string {
  if (typeof entity !== "string") {
    return false;
  }

  const entityRegex = /^[a-z0-9_]+\.[a-z0-9_]+$/;

  return entityRegex.test(entity);
}

export function getEntityDomain(entityid: string): FlexSliderEntityDomain {
  const domain: string = entityid.split(".")[0];
  return domain as FlexSliderEntityDomain;
}

export function getEntityType(entityid: string): FlexSliderCardEntityType {
  const domain: string = getEntityDomain(entityid);
  switch (domain) {
    case "number":
    case "input_number":
      return FlexSliderCardEntityType.NUMBER;
    case "input_datetime":
      return FlexSliderCardEntityType.TIME;
    case "cover":
      return FlexSliderCardEntityType.COVER;
    default:
      throw new Error(`Unexpected 'entity_${entityid}' domain`);
  }
}
