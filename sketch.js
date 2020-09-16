var assetStage1, assetStage2, assetStage3, final;
var stage1, stage2, stage3, state;
const SCALE_WIDTH = 4, SCALE_HEIGHT = 3; // set canvas radius to 4:3, could be change for different size
const NOTE_LENGTH = 100; // in ms

function preload() {
  assetStage1 = {
    bg      : null,
    case    : null,
    bean    : null,
    chara   : null,
    charaG  : null,
    charaF  : null,
    arm     : loadImage("./assets/pusher.png"),
    pod2   : loadImage("./assets/pod-2.png"),
    pod2e1 : loadImage("./assets/pod-2-semi.png"),
    pod2ept: loadImage("./assets/pod-2-ept.png"),
    pod4   : loadImage("./assets/pod-4.png"),
    pod4e1 : loadImage("./assets/pod-4-semi1.png"),
    pod4e2 : loadImage("./assets/pod-4-semi2.png"),
    pod4e3 : loadImage("./assets/pod-4-semi3.png"),
    pod4ept: loadImage("./assets/pod-4-ept.png"),
  };
  assetStage2 = {
    bg: null,
    beanGood: [
      loadImage("./assets/bean-good-done.png"),
      loadImage("./assets/bean-good-drop.png"),

      loadImage("./assets/bean-good-a.png"),
      loadImage("./assets/bean-good-b.png"),
      loadImage("./assets/bean-good-c.png"),
      loadImage("./assets/bean-good-d.png")
    ],
    beanBad: [
      loadImage("./assets/bean-bad-done.png"),
      loadImage("./assets/bean-bad-drop.png"),

      loadImage("./assets/bean-bad-a.png"),
      loadImage("./assets/bean-bad-b.png"),
      loadImage("./assets/bean-bad-c.png"),
      loadImage("./assets/bean-bad-d.png")
    ],
  }
  final = {
    welcome: loadImage("./assets/welcome.png"),
    end : null,
  }
}

function setup() {
  // add your setup code here
  state = {
    code: 0, // 0: welcome screen, 1: stage1, 2:stage2, 3:stage3, 4: final
    currentStage: null, // stage object
    currentNote: null,
  },

  initStages();

  let [w, h] = getScaledCanvasSize();
  createCanvas(w, h);

  let c = document.getElementsByTagName("body").item(0).style;
  c.setProperty("display", "flex");
  c.setProperty("justify-content", "center");
}

function windowResized() {
  let [w, h] = getScaledCanvasSize();
  resizeCanvas(w, h);
}

function initStages() {
  // stage 1 
  stage1 = {
    asset: assetStage1,
    elements: new CObject({
      name: "scene1", x:0, y:0,
    }),
    index: 0,
    Bean: (x, y) => new CObject({
      x: x, y: y, align: "center", draw: () => image(assetStage1.bean, 0, 0, 200, 200),
    }),
    pod: (x, y) => new CObject({
      x: x, y: y,
    }),
    seq: [2,2,4,0, 2,2,4,0, 2,4,2,2,4,2,2,2,4,0],
    notes: {
      "d": [0,0,1],
      "f": [0,0,0,0,1],
      "p": [-1],
    }
  };

  // bg
  stage1.elements.addChild(new CObject({
    name: "background",
    x: 0, y: 0,
    draw: () => {
      //image(assetStage1.bg, 0, 0, width, height);
      background("lime");
    }
  }));
  // container bowl & beans
  stage1.elements.addChild(new CObject({
    name: "container_bowl",
    x: 0, y: height, w: width * 0.62, h: height * 0.5, align: "bottomLeft",
  }))
  // container pods
  stage1.elements.addChild(new CObject({
    name: "container_pod",
    x: width, y: 0, w: width * 0.62, h: height * 0.5, align: "topRight",
  }))
  // container beans
  stage1.elements.addChild(new CObject({
    name: "container_flybeans",
    x: width * 0.2, y: height * 0.2, w: width * 0.6, h: height * 0.6,
  }));

}

function getScaledCanvasSize() {
  let h = windowWidth * SCALE_HEIGHT / SCALE_WIDTH;
  return h < windowHeight ? [windowWidth, h] : [windowHeight * SCALE_WIDTH / SCALE_HEIGHT, windowHeight];
}

function draw() {
  // add your draw code here
  background("black");
  stage1.elements.render();
}

/**
 * *A Simple wheel*
 * Create Object like other game engine that has properties in p5js
 * @param props: {
 *   x: x-coord,
 *   y: y-coord,
 *   w: @Nullable width of the object,
 *   h: @Nullable height of the object,
 *   scale: @Nullable size of scale, default 1
 *   align: @Nullable set align type "center", "top", "bottom", "left", "right", "topLeft", "topRight", "bottomLeft", "bottomRight", default topLeft,
 *   rotation: @Nullable angle of rotation,
 * 
 *   parent: @Nullable parent CObject,
 *   draw: @function shape functions
 * }
 * 
 * temple:
 * new CObject({
    x: 0, y: 0, w: width, h: height, 
    draw: () => {
      push();
      pop();
    }
  })
 */
class CObject {
  constructor(props) {
    this.state = {
      name : props.name ? props.name : "",
      x: props.x,
      y: props.y,
      w: props.w ? props.w : 0,
      h: props.h ? props.h : 0,
      scale: props.scale ? scale : 1,
      align: props.align ? "topLeft" : props.align,
      rotation: props.rotation ? props.rotation : 0,
      isHidden: false,
    }
    this.parent = props.parent;
    this.children = [];
    if (props.draw) {
      this.draw = props.draw;
    }
  }

  render() {
    if (this.state.isHidden) {
      return;
    }
    push();
    let [x, y] = this.getOffset(this.state.align);
    translate(this.state.x + x, this.state.y + y);
    rotate(this.state.rotation);
    scale(this.state.scale);
    try {
      this.draw(this.state.w, this.state.h);
      this.children.forEach(c => c.render());
    } catch (error) {
      console.log(error);
    }
    pop();
  }

  hide() {
    this.setState({
      isHidden : true,
    })
  }

  show() {
    this.setState({
      isHidden : false,
    })
  }

  findChildByName(name) {
    for (const c of this.children) {
      if (name === c.state.name) {
        return c;
      }
    }
    return null;
  }

  draw() {
    return;
  }

  addChild(child) {
    if (!(child instanceof CObject)) {
      return;
    }
    if (!this.children.includes(child)) {
      this.children.push(child);
    }
  }

  getOffset(alige) {
    switch (alige) {
      case "topLeft":
        return [0, 0];
      case "top":
        return [this.state.w / 2, 0];
      case "topRight":
        return [this.state.w, 0];
      case "bottomLeft":
        return [0, this.state.h];
      case "bottom":
        return [this.state.w / 2, this.state.h]
      case "bottomRight":
        return [this.state.w, this.state.h];
      case "left":
        return [0, this.state.h / 2];
      case "center":
        return [this.state.w / 2, this.state.h / 2];
      case "right":
        return [this.state.w, this.state.h / 2];
      default:
        return [0, 0];
    }
  }

  setState(state) {
    for (const key in state) {
      if (object.hasOwnProperty(key)) {
        this.state[key] = state[key];
      }
    }
  }
}

class Note {
  constructor(props) {
    this.state = {
      length: props.len,
      life: props.len, // in ms
      parent: props.parent, // pointer to remove note
      key: props.key,
      hit: false,
    }
  }
  update(dt) {
    if (this.state.life <= 0) {
      this.state.parent.currentNote = null;
      let hit = this.state.hit;
      if (hit) {
        // play_sound();
      } else {
        // play_sound();
      }
      return hit;
    }
    life -= dt;
    return null;
  }

  hit() {
    if (this.state.life > 0) {
      this.state.hit = true;
    }
    return this.state.hit;
  }
}

class Animation {
  constructor(props) {
    this.state = {
      life : props.len,
      obj : props.obj,
    }
  }

  update(dt) {
    life --;
    return life <= 0;
  }

  draw() {
    this.state.obj.render();
  }
}

// when you hit the spacebar, what's currently on the canvas will be saved (as a
// "thumbnail.png" file) to your downloads folder
function keyTyped() {
  if (key === " ") {
    saveCanvas("thumbnail.png");
  } else if (key === "z") {
    console.log("z pressed");
    // z event
    hitNote(0);
  } else if (key === "x") {
    console.log("x pressed");
    // x event
    hitNote(1);
  } else if (key === "Enter") {
    console.log("enter pressed")
    // enter event
    hitNote(-1);
  }
}

function hitNote(k) {
  if (!state) return; // avoid initialize error
  if (state.currentStage === 0) {
    console.log("game start")
    state.currentStage = 1;
  } else if (state.currentStage === 4) {
    console.log("return to welcome")
    state.currentStage = 0;
  }
  let n = state.currentNote;
  if (!n) return; // no note to be played
  if (n.key === k) {
    return n.hit();
  }
  return false;
}