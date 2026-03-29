import { fireEvent, HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";
import { html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { FlexSliderCardConfig } from "./flex-slider-card-config-type";
import { HaFormSchema } from "../type/ha";
import { computeSchema } from "./flex-slider-card-config-form";
import { flexSliderCardConfigLabels } from "./flex-slider-card-config-labels";

@customElement("flex-slider-card-config-editor")
export class FlexSliderCardConfigEditor extends LitElement implements LovelaceCardEditor {

  @state()
  private _config?: FlexSliderCardConfig;
  @property({ attribute: false })
  public hass!: HomeAssistant;

  public setConfig(config: FlexSliderCardConfig): void {
    this._config = config;
  }

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    const schema: HaFormSchema[] = computeSchema(
      this._config.valuesbaractive === true,
      this._config.valuesbar?.digits ?? ""
    );

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${schema}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._handleValueChanged}
      ></ha-form>
    `;
  }

  private _computeLabel = (schema: HaFormSchema): string | undefined => {
    if (!("name" in schema)) return undefined;

    return flexSliderCardConfigLabels[schema.name];
  };

  private _handleValueChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    const newConfig = ev.detail.value as FlexSliderCardConfig;
    this._config = newConfig;
    fireEvent(this, "config-changed", { config: this._config });
  }
}