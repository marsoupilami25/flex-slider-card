export const stdFlexSliderSliderCardCss: string = `

  .slider.std.noUi-target {
    height: 16px;
    background: color-mix(in srgb, var(--disabled-color) 30%, transparent);
    border-radius: 10px / 16px;
    border: none;
    box-shadow: none;
  }
  
  .slider.std .noUi-base {
    height: 16px;
  }
  
  .slider.std .noUi-connect {
    height: 16px;
    background: color-mix(in srgb, var(--primary-color) 30%, transparent);
  }
  
  .slider.std.noUi-horizontal .noUi-handle {
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
  
  .slider.std .noUi-handle::before, .slider.std .noUi-handle::after {
    display: none;
  }
`;
