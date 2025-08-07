import {Polygon} from "./svg-polygon";

export class WorkArea extends HTMLElement {
  constructor() {
    super();
    //Значения по умолчанию
    this._zoom = 1;
    this._minZoom = 1;
    this._maxZoom = 2;
    this._isMove = false; //Если можно двигать
    this._startDragPos = { x: 0, y: 0 };
    this._translate = { x: 0, y: 0 }

    //Брейкпойинты
    this.cellOptions = new Map(
      [
        [1, "20px"],
        [1.5, "15px"],
        [2, "10px"],
      ]
    );

    //Устанавливаем начальные CSS свойства
    this.style.setProperty("--cell", this.getBreakpoint(this.zoom));
    this.style.setProperty("--zoom", this.zoom);
    this.style.setProperty("--translateX", this.translate.x);
    this.style.setProperty("--translateY", this.translate.y);

    this.setEvents()

  }

  setEvents() {
    this.addEventListener("wheel",this.scaleGrid)
    this.addEventListener("mousedown",this.startTranslateGrid)
    this.addEventListener("mouseup",this.endTranslateGrid)
    this.addEventListener("mouseleave",this.endTranslateGrid)
    this.addEventListener("mousemove",this.translateGrid)
  }

  startTranslateGrid(event) {
    if (event.target === this && event.button === 0) {
      event.preventDefault();
      this._startDragPos = {
        x: event.clientX - this._translate.x,
        y: event.clientY - this._translate.y
      };
      this.isMove = true;
    }
  }

  restoreSavedValues() {
    const saved = JSON.parse(localStorage.getItem('polygons'));
    if(saved){
      saved.map((el) => {
        const polygonNode = new Polygon;
        polygonNode.style.setProperty("--x", el.position.x + "px");
        polygonNode.style.setProperty("--y", el.position.y + "px");
        polygonNode.setAttribute("points", JSON.stringify(el.points));
        this.appendChild(polygonNode);
      })
    }
  }

  async connectedCallback() {
    try {
      this.restoreSavedValues();
    } catch (error) {
      console.error(`Couldn't read saved work area: ${error.message}`);
    }
    this.render()
  }

  endTranslateGrid(event) {
    if (this.isMove) {
      this.isMove = false;
    }
  }


  translateGrid(event) {
    if(!this.isMove) {
      return;
    }

    this.translate = {
      x: event.clientX - this._startDragPos.x,
      y: event.clientY - this._startDragPos.y
    };
  }

  scaleGrid(event) {
    event.preventDefault();
    if(this.isMove && this.parentElement.classList.contains("work-area__container")) {
      this.parentElement.scrollLeft += event.wheelDelta > 0? 30 : -30;
      console.log(this.parentElement.scrollLeft);
      return;
    }
    const delta = event.deltaY < 0 ? 0.1 : -0.1;
    this.zoom += delta;

    this.createLabels();
  }

  getBreakpoint(zoom) {
    let closest = this.cellOptions[0];
    for (const [key, breakpoint] of this.cellOptions) {
      if (zoom >= key) closest = breakpoint;
      else break;
    }

    return closest;
  }

  createNumbers(el, numbers, breakpoint) {
    for(let i = 1; i < numbers; i++){ //Пропускаем 0 элемент. Без него визуально лучше
      const label = document.createElement("div");
      label.style.setProperty("--offset", `${i * breakpoint}px`);
      label.textContent = (i * breakpoint).toString();
      el.append(label)
    }
  }

  createLabels() {
    //Создание названий для линий
    const breakpoint = Number(this.getBreakpoint(this.zoom).replace("px", ""));

    document.querySelectorAll(".x-labels, .y-labels").forEach(
      el => el.remove()
    )

    if(breakpoint < 0 || isNaN(breakpoint)){
      console.error("Error: breakpoint must be positive number");
      return;
    }

    const x = document.createElement("div");
    x.classList.add("x-labels");
    const xLabels = this.offsetWidth / Number(breakpoint);
    this.createNumbers(x, xLabels, breakpoint);
    this.append(x);


    const y = document.createElement("div")
    y.classList.add("y-labels");
    const yLabels = this.offsetWidth / Number(breakpoint);
    this.createNumbers(y, yLabels, breakpoint);
    this.append(y)
  }

  render() {
    this.createLabels(); //Решил не создавать shadow
  }

  get zoom() {
    return this._zoom;
  }

  set zoom(value) {
    this._zoom = Math.max(this._minZoom, Math.min(this._maxZoom, value));

    const breakpoint = this.getBreakpoint(this._zoom);
    this.style.setProperty("--zoom", this._zoom.toString());
    this.style.setProperty("--cell", breakpoint);
  }

  set translate(value) {
    this._translate = {
      x: value.x,
      y: value.y
    };

    this.style.setProperty("--translateX", `${this._translate.x}px`);
    this.style.setProperty("--translateY", `${this._translate.y}px`);
  }

  get translate() {
    return this._translate;
  }

  get isMove() {
    return this._isMove;
  }

  set isMove(value) {
    this.style.cursor = value? "move" : "";
    this._isMove = value;
  }
}
