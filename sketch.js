var assetStage1, assetStage2, assetStage3, final, se;
var welcome, stage1, stage2, stage3, thanks, state;
const SCALE_WIDTH = 4, SCALE_HEIGHT = 3; // set canvas radius to 4:3, could be change for different size
const NOTE_LENGTH = 100; // in ms

function preload() {
  se = {
    clap  : loadSound("assets/se/Clap.ogg"),
    rim   : loadSound("assets/se/Rim.ogg"),
    snare : loadSound("assets/se/Snare.ogg"),
  }
  assetStage1 = {
    bg      : null,
    bag     : loadImage("assets/bag.png"),
    bean    : loadImage("assets/bean.png"),
    chara   : null,
    charaG  : null,
    charaF  : null,
    arm     : loadImage("assets/pusher.png"),
    pod2    : loadImage("assets/pod-2.png"),
    pod2e1  : loadImage("assets/pod-2-semi.png"),
    pod2ept : loadImage("assets/pod-2-ept.png"),
    pod4    : loadImage("assets/pod-4.png"),
    pod4e1  : loadImage("assets/pod-4-semi1.png"),
    pod4e2  : loadImage("assets/pod-4-semi2.png"),
    pod4e3  : loadImage("assets/pod-4-semi3.png"),
    pod4ept : loadImage("assets/pod-4-ept.png"),
  };
  assetStage2 = {
    bg: null,
    beanGood: [
      loadImage("assets/bean-good-done.png"),
      loadImage("assets/bean-good-drop.png"),

      loadImage("assets/bean-good-a.png"),
      loadImage("assets/bean-good-b.png"),
      loadImage("assets/bean-good-c.png"),
      loadImage("assets/bean-good-d.png")
    ],
    beanBad: [
      loadImage("assets/bean-bad-done.png"),
      loadImage("assets/bean-bad-drop.png"),

      loadImage("assets/bean-bad-a.png"),
      loadImage("assets/bean-bad-b.png"),
      loadImage("assets/bean-bad-c.png"),
      loadImage("assets/bean-bad-d.png")
    ],
  }
  final = {
    welcome: loadImage("assets/welcome.png"),
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
  state.currentStage = stage1;

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
  // welcome screen
  welcome = {
    show: () => {
      image(final.welcome, 0, 0, width, height);
    },
  }
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
      "q": [0,0,0,0,1],
      "p": [-1],
    },
    show: () => {
      stage1.elements.render();
    },
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
  let testDraw = (w, h) => {
    push()
    noFill()
    stroke(0);
    strokeWeight(1);
    rect(0,0,w,h);
    pop()
  };

  { // container bowl & beans 
    let container = new CObject({
      name: "container_bowl",
      x: 0, y: 100, w: 62, h: 50, align: "bottomLeft", 
      draw: testDraw,
    });
    container.addChild(new CObject({
      name: "bag",
      x: 0, y: 0, w: 50, h: 65, align: "bottomLeft", 
      draw: (w, h) => {
        image(assetStage1.bag, vw(5), vh(48), w, h);
      }
    }));
    for (let i = 0; i < 4; i++) {
      let bean = new CObject({
        name: "bean-"+i, align: "center",
        x: 18 + i * 8, y: 16, w: 9, h: 12,
        draw: (w, h) => {
          testDraw(w, h);
          image(assetStage1.bean, 0, 0, w, h);
        } 
      });
      bean.setState({
        isHidden: true,
      });
      container.addChild(bean)
    }
    stage1.elements.addChild(container);
  }

  // container pods
  stage1.elements.addChild(new CObject({
    name: "container_pod",
    x: 100, y: 0, w: 62, h: 50, align: "topRight", draw: testDraw,
  }))

  // container beans
  stage1.elements.addChild(new CObject({
    name: "container_flybeans",
    x: 20, y: 20, w: 60, h: 50,
    draw: testDraw
  }));

}

/**
 * get maximun SCALE_WIDTH : SCALE_HEIGHT size for canvas
 */
function getScaledCanvasSize() {
  let h = windowWidth * SCALE_HEIGHT / SCALE_WIDTH;
  return h < windowHeight ? [windowWidth, h] : [windowHeight * SCALE_WIDTH / SCALE_HEIGHT, windowHeight];
}

function draw() {
  // add your draw code here
  background("black");
  state.currentStage.show();
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
 *   anims: @Nullable animation dictionary
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
      align: props.align ? props.align : "topLeft",
      rotation: props.rotation ? props.rotation : 0,
      isHidden: false,
    }
    this.anims = props.anims ? props.anims : {};
    this.playing = null;
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
    translate(vw(this.state.x - x), vh(this.state.y - y));
    rotate(this.state.rotation);
    scale(this.state.scale);
    try {
      this.draw(vw(this.state.w), vh(this.state.h));
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
      if (state.hasOwnProperty(key)) {
        this.state[key] = state[key];
      }
    }
  }
}

/**
 * Note Object for hit detection
 * @param props: {
   len: length of the note, default 100ms
   parent: should be state
   key: 0/1/-1 correspound to z/x/enter
 }
 */
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
        se.clap.play();
      } else {
        se.rim.play();
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

/**
 * Animation class using for timed moving/transform animation on CObject
 * @param props: {
   len: length of animation in frame
   obj: the object it apply to
   move: function (@param state) the moving function prcess and update obj's stats
 }
 */
class Animation {
  constructor(props) {
    this.state = {
      life : props.len,
      obj : props.obj,
    }
    this.move = props.move
  }

  update(dt) {
    life --;
    return life <= 0;
  }

  move(state) {

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
  } else if (key === "/") {
    console.log("enter pressed")
    // enter event
    hitNote(-1);
  }
}

function hitNote(k) {
  if (!state) return; // avoid initialize error
  if (k === "/") {
    if (state.currentStage === welcome) {
      console.log("game start")
      state.currentStage = stage1;
    } else if (state.currentStage === final) {
      console.log("return to welcome")
      state.currentStage = welcome;
    }
  }
  let n = state.currentNote;
  if (!n) return; // no note to be played
  if (n.key === k) {
    return n.hit();
  }
  return false;
}

function vw(n) {
  return width * n * 0.01;
}

function vh(n) {
  return height * n * 0.01;
}