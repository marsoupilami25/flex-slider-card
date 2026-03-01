import { RangeSliderClass } from "./range-slider-class.js"

class RangeStdSliderCard extends RangeSliderClass {
  
  _renderTemplate(name) {
    this.shadowRoot.innerHTML = `
      <style>
        @import "/local/community/range-slider-card/frontend/nouislider.min.css";
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 8px;
        }
        .slider {
          width: 90%;
          margin: 8px 0;
        }
        .values {
          display: flex;
          justify-content: space-between;
          width: 100%;
          font-size: 0.9rem;
        }
        .title {
          /* font-size: 1rem; */
          /* font-weight: bold; */
          margin-bottom: 8px;
          color: var(--primary-text-color);
        }
        #min-value {
          color: var(--primary-text-color);
        }
        #max-value {
          color: var(--primary-text-color);
        }
      </style>
      <div class="container">
        <div class="title">${name}</div>
        <div class="slider" id="slider"></div>
        <div class="values">
          <span id="min-value"></span>
          <span id="max-value"></span>
        </div>
      </div>
    `;
  }

  getCardSize() {
    return 2;
  }

}

customElements.define('range-slider-card', RangeStdSliderCard);