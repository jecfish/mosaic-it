type RectObject = {
  x: number;
  y: number;
  w: number;
  h: number;
  text?: string;
  fill?: boolean;
};

export class Rect {
  private x1: number;
  private y1: number;
  private x2: number;
  private y2: number;

  x = 0;
  y = 0;
  w = 0;
  h = 0;

  text = '';
  fill = false;

  show: boolean;

  drawing: boolean;

  orig: RectObject;

  constructor(rect: RectObject = { x: 0, y: 0, w: 0, h: 0, text: '', fill: false }, show = false) {
    for (const [key, value] of Object.entries(rect)) {
      this[key] = value;
    }

    this.orig = Object.assign({}, rect);
    this.show = show;
    this.drawing = false;
  }

  private fix(): void {
    this.x = Math.min(this.x1, this.x2);
    this.y = Math.min(this.y1, this.y2);
    this.w = Math.max(this.x1, this.x2) - Math.min(this.x1, this.x2);
    this.h = Math.max(this.y1, this.y2) - Math.min(this.y1, this.y2);
  }

  restart(point: { x: number; y: number }): void {
    this.x2 = this.x1 = point.x;
    this.y2 = this.y1 = point.y;
    this.fix();
    this.show = true;
    this.drawing = true;
  }

  update(point: { x: number; y: number }): void {
    this.x2 = point.x;
    this.y2 = point.y;
    this.fix();
    this.show = true;
  }

  release(point: { x: number; y: number }): void {
    this.drawing = false;
    this.update(point);
  }

  toggleSensitive(): void {
    this.fill = !this.fill;
  }
}
