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

  imageData: ImageData;

  constructor(rect: RectObject = { x: 0, y: 0, w: 0, h: 0, text: '', fill: false }, show = false) {
    for (const [key, value] of Object.entries(rect)) {
      this[key] = value;
    }

    this.show = show;
  }

  private fix(): void {
    this.x = Math.min(this.x1, this.x2);
    this.y = Math.min(this.y1, this.y2);
    this.w = Math.max(this.x1, this.x2) - Math.min(this.x1, this.x2);
    this.h = Math.max(this.y1, this.y2) - Math.min(this.y1, this.y2);
  }

  private _draw(ctx: CanvasRenderingContext2D, { lineDash }): void {
    ctx.setLineDash(lineDash);

    // mosaic it
    if (this.fill) {
      ctx.fillStyle = 'black';
      if (this.imageData != undefined) {
        // do something
        const { data, width, height } = this.imageData;

        // experiment pixelate

        const sample_size = 10;

        for (let y = 0; y < height; y += sample_size) {
          for (let x = 0; x < width; x += sample_size) {
            let p = (x + y * width) * 4; // start index
            const sum = { r: 0, b: 0, g: 0, a: 0 };

            for (let y1 = y; y1 < y + sample_size; y1++) {
              for (let x1 = x; x1 < x + sample_size; x1++) {
                let p1 = (x1 + y1 * width) * 4; // start index
                sum.r += data[p1];
                sum.g += data[p1 + 1];
                sum.b += data[p1 + 2];
                sum.a += data[p1 + 3];
              }
            }

            //average the colours...
            sum.r = Math.floor(sum.r / (sample_size * sample_size));
            sum.g = Math.floor(sum.g / (sample_size * sample_size));
            sum.b = Math.floor(sum.b / (sample_size * sample_size));
            sum.a = 255;

            for (let y1 = y; y1 < y + sample_size; y1++) {
              for (let x1 = x; x1 < x + sample_size; x1++) {
                let p1 = (x1 + y1 * width) * 4; // start index
                this.imageData.data[p1] = sum.r;
                this.imageData.data[p1 + 1] = sum.g;
                this.imageData.data[p1 + 2] = sum.b;
                this.imageData.data[p1 + 3] = sum.a;
              }
            }

            ctx.putImageData(this.imageData, this.x, this.y);
          }
        }
      }
    }
  }

  restart(point: { x: number; y: number }): void {
    this.x2 = this.x1 = point.x;
    this.y2 = this.y1 = point.y;
    this.fix();
    this.show = true;
  }

  update(point: { x: number; y: number }): void {
    this.x2 = point.x;
    this.y2 = point.y;
    this.fix();
    this.show = true;
  }

  draw(ctx: CanvasRenderingContext2D, options: { lineDash: number[] }): void {
    if (this.show) {
      this._draw(ctx, options);
    }
  }

  toggleSensitive(): void {
    this.fill = !this.fill;
  }
}
