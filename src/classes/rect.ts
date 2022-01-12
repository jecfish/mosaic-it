export class Rect {
    private x1;
    private y1;
    private x2;
    private y2;

    rect = {
        x: 0, y: 0, w: 0, h: 0, fill: false
    };

    show = false;

    constructor(rect = {x: 0, y: 0, w: 0, h: 0, fill: false}, show = false) {
        this.rect = rect;
        this.show = show;
    }

    private fix() {
        this.rect.x = Math.min(this.x1, this.x2);
        this.rect.y = Math.min(this.y1, this.y2);
        this.rect.w = Math.max(this.x1, this.x2) - Math.min(this.x1, this.x2);
        this.rect.h = Math.max(this.y1, this.y2) - Math.min(this.y1, this.y2);
    }

    private _draw(ctx, { lineDash }) {
        ctx.setLineDash(lineDash);

        // mosaic it
        if (this.rect.fill) {
            ctx.fillStyle = 'white';
            // ctx.globalAlpha = .2;
            // ctx.filter = 'blur(10px)';
            ctx.fillRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h);
        } else {
            ctx.strokeRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h);
        }
    }

    restart(point: { x: number; y: number; }): void {
        this.x2 = this.x1 = point.x;
        this.y2 = this.y1 = point.y;
        this.fix();
        this.show = true;
    }

    update(point: { x: number; y: number; }): void {
        this.x2 = point.x;
        this.y2 = point.y;
        this.fix();
        this.show = true;
    }

    toRect(): unknown {
        this.show = false;
        return { ...this.rect };
    }

    draw(ctx: CanvasRenderingContext2D, options: { lineDash: number[] }): void {
        if (this.show) {
            this._draw(ctx, options);
        }
    }
}