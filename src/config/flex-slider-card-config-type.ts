import { LovelaceCardConfig } from "custom-card-helpers";
import { assign, union, literal, number, object, optional, string, boolean, any, array } from "superstruct";
import { lovelaceCardConfigStruct } from "../type/ha";
import type { Condition } from "../conditional/flex-slider-card-validate-condition";

export type FlexSliderCardFormat = "std" | "compact";
export function assertFlexSliderCardFormat(value: any): asserts value is FlexSliderCardFormat {
  if (!["std", "compact"].includes(value)) {
    throw new Error(`Invalid FlexSliderCardFormat: ${value}`);
  }
}
export const flexSliderCardFormatStruct = union([
  literal("std"),
  literal("compact"),
]);

export type FlexSliderCardDigits = "auto" | "manual";
export function assertFlexSliderCardDigits(value: any): asserts value is FlexSliderCardDigits {
  if (!["auto", "manual"].includes(value)) {
    throw new Error(`Invalid FlexSliderCardDigits: ${value}`);
  }
}
export const flexSliderCardDigitsStruct = union([
  literal("auto"),
  literal("manual"),
]);

export type FlexSliderCardDirection = "rtl" | "ltr";
export function assertFlexSliderCardDirection(value: any): asserts value is FlexSliderCardDirection {
  if (!["rtl", "ltr"].includes(value)) {
    throw new Error(`Invalid FlexSliderCardDirection: ${value}`);
  }
}
export const flexSliderCardDirectionStruct = union([
  literal("rtl"),
  literal("ltr"),
]);

export type FlexSliderCardOrientation = "horizontal" | "vertical";
export function assertFlexSliderCardOrientation(value: any): asserts value is FlexSliderCardOrientation {
  if (!["horizontal", "vertical"].includes(value)) {
    throw new Error(`Invalid FlexSliderCardOrientation: ${value}`);
  }
}
export const flexSliderCardOrientationStruct = union([
  literal("horizontal"),
  literal("vertical"),
]);

export type FlexSliderCardVerticalLayout = "standard" | "mirrored";
export function assertFlexSliderCardVerticalLayout(value: any): asserts value is FlexSliderCardVerticalLayout {
  if (!["standard", "mirrored"].includes(value)) {
    throw new Error(`Invalid FlexSliderCardVerticalLayout: ${value}`);
  }
}
export const flexSliderCardVerticalLayoutStruct = union([
  literal("standard"),
  literal("mirrored"),
]);

export type FlexSliderCardHandlesBehavior = "unconstrained" | "flexible" | "fixed";
export function assertFlexSliderCardHandlesBehavior(value: any): asserts value is FlexSliderCardHandlesBehavior {
  if (!["unconstrained", "flexible", "fixed"].includes(value)) {
    throw new Error(`Invalid FlexSliderCardHandlesBehavior: ${value}`);
  }
}
export const flexSliderCardHandlesBehaviorStruct = union([
  literal("unconstrained"),
  literal("flexible"),
  literal("fixed"),
]);

export type FlexSliderCardValuesBarConfig = {
  // Legacy config kept for backward compatibility. Migrated to entities[0].text.
  mintext?: string;
  // Legacy config kept for backward compatibility. Migrated to entities[1].text.
  maxtext?: string;
  showtext?: boolean;
  digits?: FlexSliderCardDigits;
  nbdigits?: number;
  unit?: string;
};
export const flexSliderCardValuesBarConfigStruct = object({
  mintext: optional(string()),
  maxtext: optional(string()),
  showtext: optional(boolean()),
  digits: optional(flexSliderCardDigitsStruct),
  nbdigits: optional(number()),
  unit: optional(string()),
});

export type FlexSliderCardBubblesConfig = {
  // Legacy config kept for backward compatibility. Migrated to entities[0].text.
  mintext?: string;
  // Legacy config kept for backward compatibility. Migrated to entities[1].text.
  maxtext?: string;
  showtext?: boolean;
  digits?: FlexSliderCardDigits;
  nbdigits?: number;
  unit?: string;
  dragonly?: boolean;
};
export const flexSliderCardBubblesConfigStruct = object({
  mintext: optional(string()),
  maxtext: optional(string()),
  showtext: optional(boolean()),
  digits: optional(flexSliderCardDigitsStruct),
  nbdigits: optional(number()),
  unit: optional(string()),
  dragonly: optional(boolean()),
});

export type FlexSliderCardTicksConfig = {
  digits?: FlexSliderCardDigits;
  nbdigits?: number;
  majorticks?: number;
  minorticks?: number;
};
export const flexSliderCardTicksConfigStruct = object({
  digits: optional(flexSliderCardDigitsStruct),
  nbdigits: optional(number()),
  majorticks: optional(number()),
  minorticks: optional(number()),
});

export type FlexSliderCardReferenceConfig = {
  entity?: string;
  text?: string;
  bubble?: boolean;
  valuesbar?: boolean;
  valuesbartextlarge?: boolean;
  unit?: string;
};
export const flexSliderCardReferenceConfigStruct = object({
  entity: optional(string()),
  text: optional(string()),
  bubble: optional(boolean()),
  valuesbar: optional(boolean()),
  valuesbartextlarge: optional(boolean()),
  unit: optional(string()),
});

export type FlexSliderCardAdaptiveStateConfig = {
  conditions?: Condition[];
  editablewhenlinkedinactive?: boolean;
};
export const flexSliderCardAdaptiveStateConfigStruct = object({
  conditions: optional(array(any())),
  editablewhenlinkedinactive: optional(boolean()),
});

export type FlexSliderCardHandleConfig = {
  entity: string;
  text?: string;
  connectprevious?: boolean;
};
export const flexSliderCardHandleConfigStruct = object({
  entity: string(),
  text: optional(string()),
  connectprevious: optional(boolean()),
});

export type FlexSliderCardConfig = LovelaceCardConfig &
{
  /* display options */
  name?: string;
  format?: FlexSliderCardFormat;
  orientation?: FlexSliderCardOrientation;
  horizontalwidth?: number;
  verticalheight?: number;
  valuesbaractive?: boolean;
  bubblesactive?: boolean;
  ticksactive?: boolean;
  referenceactive?: boolean;
  adaptivestateactive?: boolean;
  verticallayout?: FlexSliderCardVerticalLayout;

  /* behavioral */
  min?: number;
  max?: number;
  step?: number;
  direction?: FlexSliderCardDirection;

  /* values bar */
  valuesbar?: FlexSliderCardValuesBarConfig;

  /* bubbles */
  bubbles?: FlexSliderCardBubblesConfig;

  /* ticks */
  ticks?: FlexSliderCardTicksConfig;

  /* reference */
  reference?: FlexSliderCardReferenceConfig;

  /* adaptive state */
  adaptivestate?: FlexSliderCardAdaptiveStateConfig;

  /* entities */
  handlesbehavior?: FlexSliderCardHandlesBehavior;
  entities?: FlexSliderCardHandleConfig[];
  connectend?: boolean;

  /* legacy entities configuration start */
  entity_min?: string;
  entity_max?: string;
  /* legacy entities configuration end */

  /* card mod */
  card_mod?: Record<string, unknown>;

  /* UIX */
  uix?: Record<string, unknown>;
};
export const flexSliderCardConfigStruct = assign(
  lovelaceCardConfigStruct,
  object({
    /* display options */
    name: optional(string()),
    format: optional(flexSliderCardFormatStruct),
    orientation: optional(flexSliderCardOrientationStruct),
    horizontalwidth: optional(number()),
    verticalheight: optional(number()),
    valuesbaractive: optional(boolean()), 
    bubblesactive: optional(boolean()),
    ticksactive: optional(boolean()),
    referenceactive: optional(boolean()),
    adaptivestateactive: optional(boolean()),
    verticallayout: optional(flexSliderCardVerticalLayoutStruct),

    /* behavioral */
    min: optional(number()),
    max: optional(number()),
    step: optional(number()),
    direction: optional(flexSliderCardDirectionStruct),

    /* values bar */
    valuesbar: optional(flexSliderCardValuesBarConfigStruct),

    /* bubbles */
    bubbles: optional(flexSliderCardBubblesConfigStruct),

    /* ticks */
    ticks: optional(flexSliderCardTicksConfigStruct),

    /* reference */
    reference: optional(flexSliderCardReferenceConfigStruct),

    /* adaptive state */
    adaptivestate: optional(flexSliderCardAdaptiveStateConfigStruct),

    /* entities */
    handlesbehavior: optional(flexSliderCardHandlesBehaviorStruct),
    entities: optional(array(flexSliderCardHandleConfigStruct)),
    connectend: optional(boolean()),

    /* legacy entities configuration start */
    entity_min: optional(string()),
    entity_max: optional(string()),
    /* legacy entities configuration end */

    /* card mod */
    card_mod: optional(any()),
  })
);
