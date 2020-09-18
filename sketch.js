var assetStage1, assetStage2, assetStage3, final, se;
var welcome, stage1, stage2, stage3, thanks, state;
const SCALE_WIDTH = 4, SCALE_HEIGHT = 3; // set canvas radius to 4:3, could be change for different size
const NOTE_LENGTH = 100; // in ms
const bpm = 60, beat = 4; // in frame/s

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
    table   : loadImage("assets/table.png"),
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
    pressed: false,
  },

  initStages();
  state.currentStage = stage1;

  let [w, h] = getScaledCanvasSize();
  createCanvas(w, h);
  frameRate(bpm);

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
      name: "scene1", x:0, y:0, align: "topLeft",
    }),
    index: 0,
    Bean: null,
    pod: null,
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

  let testDraw = (x, y, w, h) => {
    push()
    noFill()
    stroke("black");
    strokeWeight(1);
    rect(x, y, w, h);
    line(x, y, x+w, y+h);
    line(x+w, y, x, y+h);
    pop()
  };

  { // container bowl & beans 
    let container = new CObject({
      name: "container_bowl",
      x: 0, y: 100, w: 62, h: 50, align: "bottomLeft", 
      draw: (x, y, w, h) => {
        testDraw(x, y, w, h);
      },
    });
    let bag = new CObject({
      name: "bag",
      x: 4, y: -3, w: 50, h: 65, align: "bottomLeft", 
      draw: (x, y, w, h) => {
        testDraw(x, y, w, h);
        image(assetStage1.bag, x, y, w, h);
      }
    });
    container.addChild(bag);
    for (let i = 0; i < 4; i++) {
      let bean = new CObject({
        name: "bean-"+i, align: "center",
        x: 18 + i * 7, y: -35, w: 9, h: 12,
        draw: (x, y, w, h) => {
          testDraw(x, y, w, h);
          image(assetStage1.bean, x, y, w, h);
        } 
      });
      bean.setState({
        isHidden: false,
      });
      container.addChild(bean)
    }
    stage1.elements.addChild(container);
  } // end container bowl & beans

  {// container pods
    let container = new CObject({
      name: "container_pod",align: "topRight",
      x: 100, y: 0, w: 62, h: 60,  
      draw: (x, y, w, h) => {
        testDraw(x, y, w, h);
        image(assetStage1.table, x, y-vh(8), w, h + vh(24));
      }
    });

    { // pod
      let podIn = new Animation({
        len  : 6,
        loop : false,
        move : (state) => {
          let s = state.obj.state;
          s.x += 16;
        } 
      });
      let podOut = new Animation({
        len  : 6,
        loop : false,
        move : (state) => {
          let s = state.obj.state;
          s.x += 16;
          s.y += 16;
        } 
      });
      let podRound = new Animation({
        len  : 6,
        loop : false,
        move : (state) => {
          let s = state.obj.state;
          s.rotation += state.name === "pod4" ? 0.01 : 0.02;
        } 
      });
      let anims = {
        pod_in: podIn,
        pod_out: podOut,
        pod_round: podRound,
      }

      let pod = (k, x, y) => new CObject({
        x: x, y: y, w: vw(45), h: vh(60), rotation: k === 4 ? -0.6 : -0.4,
        anims: anims, align: "topRight", name: "pod"+k,
        draw: (x, y, w, h, state) => {
          testDraw(x, y, w, h)
          if (state.playing) {
            if (state.playing.update() === -1) {
              state.playing = null;
              image(assetStage1["pod" + k], x, y, w, h);
              return;
            }
            if (state.playing.move) state.playing.move(state.playing.state);
            image(assetStage1["pod" + k], x, y, w, h);
          } else {
            image(assetStage1["pod" + k], x, y, w, h);
          }
        },
      });
      stage1.pod = pod;
    }
    //let test = stage1.pod(4, -92, -8);
    let test = stage1.pod(4, -12, -8);
    //test.state.playing = test.state.anims.pod_round;
    container.addChild(test);

    let Bean =  (x, y) => new CObject({
      x: x, y: y, align: "center", 
      draw: () => {
        image(assetStage1.bean, 0, 0, 200, 200)
      },
    });
    stage1.Bean = Bean;

    stage1.elements.addChild(container)
  }// end container pods

  // container beans
  {
    let container = new CObject({
      name: "container_flybeans", align: "center",
      x: 50, y: 50, w: 60, h: 50,
      draw: testDraw
    });
    //stage1.elements.addChild(container);
  }

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
 *   frames : @Nullable animation frames for frame anims only
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
      frames: props.frames,
      anims : props.anims ? props.anims : {},
      playing : null,
    }
    if (props.anims) {
      for (const key in props.anims) {
        if (props.anims.hasOwnProperty(key)) {
          const a = props.anims[key];
          a.state.obj = this;
        }
      }
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
    translate(vw(this.state.x), vh(this.state.y));
    rotate(this.state.rotation);
    scale(this.state.scale);
    try {
      this.draw(-vw(x), -vh(y), vw(this.state.w), vh(this.state.h), this.state);
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
   rate: number of key frames
   loop: is Animation loop
   move: function (@param state) the moving function prcess and update obj's stats
 }
 */
class Animation {
  constructor(props) {
    this.state = {
      len   : props.len,
      life  : props.len,
      rate  : props.rate,
      obj   : props.obj,
      loop  : props.loop,
    }
    this.move = props.move
  }

  update(dt) {
    this.state.life --;
    let index = (this.state.len - this.state.life) % bpm * this.state.rate / bpm;
    if (this.state.life <= 0 && !this.state.loop) {
      return -1;
    }
    return ~~index;
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

function keyPressed() {
  if (state.pressed) return;
  if (keyCode === 90) {
    state.zPress = true;
  } else if (keyCode === 88) {
    state.xPress = true;
  }
  state.pressed = true;
}

function keyReleased() {
  if (!state.pressed) return;
  if (state.zPress) {
    state.zPress = false;
  } else if (state.xPress) {
    state.xPress = false;
  }
  state.pressed = false;
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