function pointInBox(x, y, pos, size) {
  return (
    x > pos.x - size.x / 2 &&
    x < pos.x + size.x / 2 &&
    y > pos.y - size.y / 2 &&
    y < pos.y + size.y / 2
  );
}

class TouchGamepad {
  constructor(opts) {
    opts = opts || {};
    this.elements = [];

    if (opts.elements) {
      for (let e of opts.elements) {
        if (e.type == "joystick") {
          this.elements.push(new TouchJoystick(e));
        } else {
          this.elements.push(new TouchButton(e));
        }
      }
    }
    
    this.alwaysSend = opts.alwaysSend;
  }
  addGraphics(container) {
    for (let e of this.elements) {
      if (e.graphic) container.addChild(e.graphic);
    }
  }

  touchStart(t) {
    for (let e of this.elements) {
      e.touchStart(t);
    }
  }
  touchMove(t) {
    for (let e of this.elements) {
      e.touchMove(t);
    }
  }
  touchEnd(t) {
    for (let e of this.elements) {
      e.touchEnd(t);
    }
  }
  hasChanged() {
    let changed = false;
    for (let e of this.elements) {
      changed = changed || e.hasChanged();
    }
    return changed;
  }
  getData() {
    let data = [];
    for (let e of this.elements) {
      data.push(e.getData())
    }
    return data;
  }
  
  changeColor(c) {
    for (let e this.elements) {
      e.color = c;
    }
  }
}

class TouchElement {
  constructor(opts) {
    opts = opts || {};
    this.pos = opts.pos || { x: 0, y: 0 };
    this.size = opts.size || { x: 200, y: 200 };

    this.touchId = undefined;

    this.graphic = new PIXI.Graphics();
    this.graphic.transform.position.x = this.pos.x;
    this.graphic.transform.position.y = this.pos.y;
    
    this.color = opts.color || 0x555555;
  }
  hasChanged() {
    return false;
  }
  getData() {
    return {};
  }
  touchStart(t) {}
  touchMove(t) {}
  touchEnd(t) {}
}

class TouchButton extends TouchElement {
  constructor(opts) {
    super(opts);
    this.pressed = false;
    this.draw();
  }
  getData() {
    return {pressed: this.pressed};
  }
  hasChanged() {
    if(this.lastPressed != this.pressed) {
      this.lastPressed = this.pressed;
      return true;
    }
    this.lastPressed = this.pressed;
    return false;
  }
  
  draw() {
    this.graphic.clear();
    if(this.pressed) this.graphic.beginFill(this.color, 0.5);
    this.graphic.lineStyle(20, this.color, 1)
    this.graphic.drawEllipse(0, 0, this.size.x / 2, this.size.y / 2);
    this.graphic.endFill();
  }
  touchStart(t) {
    if (!this.pressed && pointInBox(t.x, t.y, this.pos, this.size)) {
      this.touchId = t.id;
      this.pressed = true;
      this.draw();
    }
  }
  touchMove(t) {}
  touchEnd(t) {
    if (this.pressed && this.touchId == t.id) {
      this.pressed = false;
      this.touchId = undefined;
      this.draw();
    }
  }
}

class TouchJoystick extends TouchElement{
  constructor(opts) {
    super(opts);
    this.stickSize = 130
    this.stick = {x: 0, y: 0};
    this.vec = {x: 0, y: 0};
    this.move = opts.move == undefined ? true : opts.move;
    
    this.draw();
  }
  getData() {
    return {x: this.vec.x / this.stickSize, y: this.vec.y / this.stickSize};
  }
  hasChanged() {
    this.lastVec = this.lastVec || {x: 0, y: 0};
    if(this.lastVec.x != this.vec.x || this.lastVec.y != this.vec.y) {
      this.lastVec.x = this.vec.x;
      this.lastVec.y = this.vec.y;
      return true;
    }
    this.lastVec.x = this.vec.x;
    this.lastVec.y = this.vec.y;
    return false;
  }
  
  draw() {
    this.graphic.clear();
    
    if(this.pressed) this.graphic.beginFill(this.color, 0.5);
    
    this.graphic.lineStyle(10, this.color, 1);
    if(this.touchId != undefined) this.graphic.beginFill(this.color, 0.1);
    this.graphic.drawRect(-this.size.x / 2,-this.size.y / 2, this.size.x, this.size.y);
    
    this.graphic.drawCircle(this.stick.x, this.stick.y, this.stickSize);
    
    
    this.graphic.beginFill(this.color, 0.5)
    this.graphic.drawCircle(this.stick.x + this.vec.x, this.stick.y + this.vec.y, this.stickSize / 2.5);
    this.graphic.endFill();
  }
  
  touchStart(t) {
    if(this.touchId == undefined && pointInBox(t.x, t.y, this.pos, this.size)) {
      this.touchId = t.id;
      if(this.move) {
        this.stick.x = t.x - this.pos.x;
        this.stick.y = t.y - this.pos.y;
      } else {
        this.touchMove(t);
      }
      this.draw();
    }
  }
  touchMove(t) {
    if(this.touchId == t.id) {
      let dx = (t.x - this.pos.x) - this.stick.x;
      let dy = (t.y - this.pos.y) - this.stick.y;
      let l = Math.sqrt(dx * dx + dy * dy);
      if(l > this.stickSize) {
        dx *= this.stickSize / l;
        dy *= this.stickSize / l;
      }
      this.vec.x = dx;
      this.vec.y = dy;
      this.draw();
    }
  }
  touchEnd(t) {
    if(this.touchId == t.id) {
      this.touchId = undefined;
      this.vec.x = 0;
      this.vec.y = 0;
      this.draw();
    }
  }
}
