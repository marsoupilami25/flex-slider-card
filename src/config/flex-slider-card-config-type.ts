import { LovelaceCardConfig } from "custom-card-helpers";

export type FlexSliderCardFormat = "std" | "compact";
export function assertFlexSliderCardFormat(value: any): asserts value is FlexSliderCardFormat {
  if (!["std", "compact"].includes(value)) {
    throw new Error(`Invalid FlexSliderCardFormat: ${value}`);
  }
}
export type FlexSliderCardDigits = number | "auto";
export function assertFlexSliderCardDigits(value: any): asserts value is FlexSliderCardDigits {
  if (typeof value === "number") {
    if (value < 0) {
      throw new Error(`Invalid FlexSliderCardDigits: ${value}`);
    }
  } else if (value !== "auto") {
    throw new Error(`Invalid FlexSliderCardDigits: ${value}`);
  }
}

export type FlexSliderCardConfig = LovelaceCardConfig &
  {
    /* display options */
    name?: string;
    format?: FlexSliderCardFormat;
    unit?: string;
    valuesbar?: boolean;

    /* values bar options */
    mintext?: string;
    maxtext?: string;
    digits?: FlexSliderCardDigits;

    /* bahvioral */
    entity_min: string;
    entity_max: string;
    min?: number;
    max?: number;
    step?: number;
  };