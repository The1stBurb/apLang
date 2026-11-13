export class Graphics{
    constructor(){
        this.items = [];
        this.color = new Color(0);
        this.bgcolor = new Color(255);
    }
    setFill(r, g, b){ this.color =  new Color(r, g, b); }
    setBackground(r, g, b){ this.bgcolor =  new Color(r, g, b); }

    createRect(x, y, w, h){
        this.items.push(new Rect( x, y, w, h ?? w, this.color ));
    }
    createEllipse(x, y, w, h){
        this.items.push(new Ellipse( x, y, w, h ?? w, this.color ));
    }

    draw(){
        console.log("drawing some stuff");
        while(this.items.length > 0){
            const item = this.items.pop();
            console.log('a',item.type,'colored',item.color.toString());
        }
    }
}

export class Color{
    constructor(r, g, b, a){
        this.r = r ?? 0;this.g = 0;this.b = 0; this.a = 255;
        if(r && (!g || !b)){ this.g = r; this.b = r; }
        if(g && !b){ this.a = g; }
        if(b){ this.g = g; this.b = b; }
        if(a){ this.a = a; }
    }
    toString(){ return `(${this.r.toFixed(2)}, ${this.g.toFixed(2)}, ${this.b.toFixed(2)}, ${this.a.toFixed(2)})`; }
}

export class Shape{
    constructor(type, color){
        this.type = type;
        this.color = color;
    }
}
class Rect extends Shape{
    constructor(x, y, w, h, color){
        super('rect', color);
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}
class Ellipse extends Shape{
    constructor(x, y, w, h, color){
        super('ellipse', color);
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}