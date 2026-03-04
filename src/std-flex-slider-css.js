import nouiCss from "nouislider/dist/nouislider.css?inline";

export const stdFlexSliderCardCss = `
  ${nouiCss}
  
  ha-card {
    height: 100%;
    box-sizing: border-box;
  }
  
  .container {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    background: var(--ha-card-background, var(--card-background-color));
    border-radius: var(--ha-card-border-radius, 12px);
    box-shadow: var(--ha-card-box-shadow, 0px 2px 4px rgba(0, 0, 0, 0.16));
    border-width: var(--ha-card-border-width, 1px);
    border-style: solid;
    border-color: var(--ha-card-border-color, var(--divider-color));
    transition: all 0.3s ease-out;
    box-sizing: border-box;
  }
  
  .slider-container {
    width: 100%;
    height: 100%;
    min-height: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  .slider {
    width: 90%;
    margin: 0px 10px;
  }
  
  .values {
    display: flex;
    justify-content: space-between;
    width: 100%;
    font-size: 0.9rem;
  }
  
  .title {
    justify-content: flex-start;
    font-size: 1.2rem;
    margin-top: 2%;
    margin-bottom: 1%;
    color: var(--primary-text-color);
  }
  
  .values {
    color: var(--primary-text-color);
    font-size: 1rem;
    margin-top: 1%;
    margin-bottom: 1%;
    width: 90%;
  }
  
  .noUi-target {
    height: 16px;
    background: color-mix(in srgb, var(--disabled-color) 30%, transparent);
    border-radius: 10px / 16px;
    border: none;
    box-shadow: none;
  }
  
  .noUi-base {
    height: 16px;
  }
  
  .noUi-connect {
    height: 16px;
    background: color-mix(in srgb, var(--primary-color) 30%, transparent);
  }
  
  .noUi-horizontal .noUi-handle {
    width: 18px;
    height: 18px;
    top: -1px;
    right: -9px;
    background: var(--primary-text-color);
    border-width: 3px;
    border-style: solid;
    border-color: var(--primary-color);
    border-radius: 15px;
    box-shadow: none;
  }
  
  .noUi-handle::before, .noUi-handle::after {
    display: none;
  }
`;
