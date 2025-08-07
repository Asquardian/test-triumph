import {Polygon} from "./components/svg-polygon";
import {WorkArea} from "./components/workarea";

export function init() {

  const quantityInput = document.querySelector(".js-input");
  if(quantityInput) {
    quantityInput.addEventListener("change", (e) => {
      const value = Number(e.target.value);
      if(isNaN(value)) {
        e.target.value = 10;
        return;
      }
      if(value > 20) {
        e.target.value = 20;
        return
      }
      if(value < 1) {
        e.target.value = 1;
      }
    })
  }

  //кнопка сохранить
  const saveBtn = document.querySelector(".js-save");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const serializeEvent = new CustomEvent('serialize', {
        bubbles: false,
        composed: true,
        cancelable: true,
        detail: {polygons: []}
      })

      document.querySelectorAll("work-area svg-polygon").forEach(
        el => el.dispatchEvent(serializeEvent)
      )

      if (serializeEvent.detail.polygons.length > 0) {
        localStorage.setItem('polygons', JSON.stringify(serializeEvent.detail.polygons));
      }
    })
  }

  //кнопка отчистить
  const clearBtn = document.querySelector(".js-clear");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      localStorage.removeItem('polygons');

      document.querySelectorAll("work-area svg-polygon").forEach(
        el => el.remove()
      )
    })
  }


  //кнопка создать новые элементы
  const createBtn = document.querySelector(".js-create");
  if (createBtn) {
    createBtn.addEventListener("click", () => {
      const container = document.querySelector(".js-buffer-elements");
      if(!container) {
        return;
      }

      const value = quantityInput? quantityInput.value : 4;

      container.innerHTML = '';
      for(let i = 0; i < value; i++) {
        const polygon = new Polygon;
        container.appendChild(polygon);
      }
    })
  }

  customElements.define('svg-polygon', Polygon);
  customElements.define('work-area', WorkArea);
}
