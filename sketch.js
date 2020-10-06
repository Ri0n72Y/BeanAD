var assetStage1, assetStage2, assetStage3, final, se;
var openscreen, welcome, stage1, stage2, stage3, thanks, state;
const SCALE_WIDTH = 4, SCALE_HEIGHT = 3; // set canvas radius to 4:3, could be change for different size
const NOTE_LENGTH = 100; // in ms

const bpm = 60, fr = 60, beat = 4, offset = 4; 
const rate = (bpm * beat) / (60 * fr); // number of frames each beat

function preload() {
  se = {
    clap   : loadSound("assets/se/Clap.ogg"),
    rim    : loadSound("assets/se/Rim.ogg"),
    snare  : loadSound("assets/se/Snare.ogg"),
    closed : loadSound("assets/se/ClosedHat.ogg"),
    kick   : loadSound("assets/se/Kick.ogg"),
    open   : loadSound("assets/se/OpenHat.ogg"),
  }
  assetStage1 = {
    bg      : loadImage("assets/bg.png"),
    bag     : loadImage("assets/bag.png"),
    bean    : loadImage("assets/bean.png"),
    flybean : loadImage("assets/flybean.png"),
    table   : loadImage("assets/table.png"),
    chara   : null,
    charaG  : null,
    charaF  : null,
    arm     : loadImage("assets/pusher.png"),
    pod2e0  : loadImage("assets/pod-2.png"),
    pod2e1  : loadImage("assets/pod-2-semi.png"),
    pod2ept : loadImage("assets/pod-2-ept.png"),
    pod4e0  : loadImage("assets/pod-4.png"),
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
    theme: loadSound("assets/se/bgm.mp3"),
    open: loadImage("assets/open.png"),
    welcome: loadImage("assets/welcome.png"),
    z: loadImage("assets/z.png"),
    x: loadImage("assets/x.png"),
    end : loadImage("assets/end.png"),
  }
}

function setup() {
  // add your setup code here
  background("white");
  state = {
    code: 0, // 0: welcome screen, 1: stage1, 2:stage2, 3:stage3, 4: final
    currentStage: null, // stage object
    pressed: false,
    isBGMPlaying: false,
    sampleNotes: {
      "d": [0,0,1],
      "q": [0,0,0,0,1],
      "p": [-1],
    },
    createNote: (note, start, parent) => new Note({
      len: NOTE_LENGTH,
      start : start,
      key   : note,
      parent : parent,
    }),
  },

  initStages();
  state.currentStage = openscreen;

  let [w, h] = getScaledCanvasSize();
  createCanvas(w, h);
  frameRate(fr);

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
  openscreen = {
    show: () => {
      let i = sin(frameCount / 10) * vw(10);
      image(final.open, -i, -i, width+i, height+i);
    },
    event: {
      any: ()=> {
        openWelcome();
      }
    }
  }
  welcome = {
    show: () => {
      image(final.welcome, 0, 0, width, height);
    },
    event: {
      any: ()=> {
        startStage1();
      }
    }
  }
  // stage 1 
  stage1 = {
    asset: assetStage1,
    elements: new CObject({
      name: "scene1", x:0, y:0, align: "topLeft",
    }),
    index: 1,
    Bean: null,
    pod: null,
    seq: [2,2,4, 2,2,4, 2,4, 2,2,4, 2,2,2,4,4],
    show: () => {
      if (!state.isBGMPlaying) {
        state.isBGMPlaying = true;
        setTimeout(final.theme.play(), 3000);
      }
      /*
      stage1.notes.play();
      */
      if (stage1.index > stage1.seq.length) {
        setTimeout(
          startStage2(),
          8000);
      }
      stage1.elements.render();
    },
    event: {
      zPress: (e)=> zPressAnimStage1(
        e.findChildByName("arm"), 
        e.findChildByName("flybean"),
        e.findChildByName("container_pod").findChildByName("pod"),
        e.findChildByName("container_bowl")
      ),
      zRelease: (e)=> zReleaseAnimStage1(
        e.findChildByName("arm"), 
        e.findChildByName("flybean"),
        e.findChildByName("container_pod").findChildByName("pod"),
        e.findChildByName("container_bowl")
      ),
      xPress: (e)=> xPressAnimStage1(
        e.findChildByName("container_pod").findChildByName("pod"),
        e.findChildByName("container_bowl")
      ),
      xRelease: (e)=> xReleaseAnimStage1(
        e.findChildByName("container_pod"),
        e.findChildByName("container_bowl")
      ),
    }
  };

  // bg
  stage1.elements.addChild(new CObject({
    name: "background",
    x: 0, y: 0,
    draw: () => {
      image(assetStage1.bg, 0, 0, width, height);
      //background("lime");
    }
  }));

  let testDraw = (x, y, w, h) => {
    /*
    push()
    noFill()
    stroke("black");
    strokeWeight(1);
    rect(x, y, w, h);
    line(x, y, x+w, y+h);
    line(x+w, y, x, y+h);
    pop()
    */
  };

  { // container bowl & beans 
    let bagIn = new Animation({
      len  : 6,
      loop : false,
      move : (state) => {
        let s = state.obj.state;
        s.x += 16;
      } 
    });
    let out = new Animation({
      len  : 6,
      loop : false,
      move : (state) => {
        let s = state.obj.state;
        s.x -= 16;
      } 
    });
    let container = new CObject({
      name: "container_bowl",
      x: 0, y: 100, w: 62, h: 50, align: "bottomLeft", 
      anims: {out: out, bag_in: bagIn},
      draw: (x, y, w, h, state) => {
        handleAnimation(state)
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
        name: "bean-"+(i+1), align: "center",
        x: 18 + i * 7, y: -35, w: 9, h: 12,
        draw: (x, y, w, h) => {
          testDraw(x, y, w, h);
          image(assetStage1.bean, x, y, w, h);
        } 
      });
      bean.setState({
        isHidden: true,
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
          s.rotation += 0.055;
        } 
      });
      let anims = {
        pod_in: podIn,
        pod_out: podOut,
        pod_round: podRound,
      }

      let pod = (k, x, y) => {
        let texture = "pod"+k+"e0";
        let p = new CObject({
          x: x, y: y, w: 45, h: 60, rotation: k === 4 ? -0.6 : -0.3,
          anims: anims, align: "topRight", name: "pod", texture: texture,
          draw: (x, y, w, h, s) => {
            testDraw(x, y, w, h)
            handleAnimation(s);
            image(assetStage1[s.texture], x, y, w, h);
          },
        })
        p.setState({ total: k, emptyNum: 0 });
        return p;
      };
      stage1.pod = pod;
    } // end pod
    let test = stage1.pod(2, -94, -8);
    test.state.playing = test.state.anims.pod_in;
    container.addChild(test);

    stage1.elements.addChild(container)
  }// end container pods

  {// container beans
    let show = new Animation({
      len: 5,
      loop : false,
      move : (state) => {
        state.obj.setState({
          isHidden: false,
        })
      }
    });
    let bean =  new CObject({
      x: 46, y: 48, w: 15, h: 20, 
      align: "center", name : "flybean", anims : {show: show},
      draw: (x, y, w, h, s) => {
        testDraw(x, y, w, h);
        handleAnimation(s);
        image(assetStage1.flybean, x, y, w, h)
      },
    });
    bean.hide()
    stage1.elements.addChild(bean);
  } // end container beans

  { // arm
    let push = new Animation({
      len  : 3,
      loop : false,
      move : (state) => {
        let s = state.obj.state;
        s.x -= 5;
        s.y += 5;
      } 
    });
    let pull = new Animation({
      len  : 3,
      loop : false,
      move : (state) => {
        let s = state.obj.state;
        s.x += 5;
        s.y -= 5;
      } 
    });
    let anims = {
      push: push,
      pull: pull,
    }
    let arm = new CObject({
      x: 110, y: -10, w: 50, h: 65,
      align: "topRight", anims: anims, name: "arm",
      draw: (x, y, w, h, state) => {
        handleAnimation(state);
        image(assetStage1.arm, x, y, w, h);
      }
    });
    stage1.elements.addChild(arm);
  } // end arm

  /*
  { // notes 
    let notes = [];
    stage1.notes = new Player({c: notes});
    let start = offset;
    for (const e of stage1.seq) {
      switch (e) {
        case 2:
          for (const n of state.sampleNotes.d) {
            notes.push(state.createNote(n, start, stage1.notes));
            start += n === 0 ? 2 : beat;
          }
          break;
        case 4:
          for (const n of state.sampleNotes.q) {
            notes.push(state.createNote(n, start, stage1.notes));
            start += n === 0 ? 1 : beat;
          }
          break;
        default:
          break;
      }
    }
  } // end notes
  */

  // stage thanks
  thanks = {
    show: () => {
      image(final.end, 0, 0, width, height);
    },
    event: {
      zPress: ()=>{},
      xPress: ()=>{},
      zRelease: ()=>{},
      xRelease: ()=>{},
    }
  }
}

function openWelcome() {
  final.theme.play();
  state.isBGMPlaying = true;
  state.currentStage = welcome;
  state.notes = null;
}
function startStage1() {
  final.theme.stop();
  state.isBGMPlaying = false;
  state.currentStage = stage1;
  state.notes = stage1.notes;
}
function startStage2() {
  endGame()
}
function endGame() {
  stage1.index = 1;
  state.currentStage = thanks;
  state.notes = null;
}

{  // stage 1 event
function zPressAnimStage1(arm, fly, pod, bagCont) {
  arm.state.playing = arm.state.anims.push; 
  if (pod.state.texture.slice(4, 7) === "ept"){
    return;
  }
  fly.show();
  fly.state.anims.show.addCallback((state) => {
    bagCont.findChildByName("bean-"+pod.state.emptyNum).show();
    state.obj.hide();
  });
  fly.state.playing = fly.state.anims.show;
  let next = pod.state.emptyNum + 1;
  if (pod.state.emptyNum >= pod.state.total - 1 
      && pod.state.texture.slice(5, 8) !== "ept") {
    pod.setState({
      emptyNum : next,
      texture: pod.state.texture.slice(0, 5) + "pt",
    });
  } else {
    pod.setState({
      emptyNum : next,
      texture: pod.state.texture.slice(0, 5) + next,
    });
  }
}
function zReleaseAnimStage1(arm, fly, pod, bagCont) {
  arm.state.playing = arm.state.anims.pull;
  if (pod.state.texture.slice(4, 7) !== "ept"){
    pod.state.playing = pod.state.anims.pod_round;
  }
}

function xPressAnimStage1(pod, bagCont) {
  if (pod.state.texture.slice(4, 7) !== "ept") // if the pod is not empty
    return;
  pod.state.anims.pod_out.addCallback((state) => { // remove current pod after animation
    state.obj.remove();
  })
  pod.state.playing = pod.state.anims.pod_out; 
  bagCont.state.playing = bagCont.state.anims.out;
}
function xReleaseAnimStage1(podCont, bagCont) {
  if (podCont.hasChildren())  {
    return;
  }
  // have a new pod by notes
  let pod = stage1.pod(stage1.seq[stage1.index], -94, -8);
  pod.state.playing = pod.state.anims.pod_in;
  podCont.addChild(pod);
  // move bag back, hide all beans
  for (let i = 0; i < 4; i++) {
    let bean = bagCont.findChildByName("bean-"+(i+1));
    bean.hide();
  }
  bagCont.state.playing = bagCont.state.anims.bag_in;

  //advance bean sequence
  stage1.index ++;
}
}  // end stage 1 event

/**
 * function to handle the process state
 * much like a macro rather than a function
 * @param {*} state 
 */
function handleAnimation(state) {
  if (state.playing) {
    if (state.playing.update() === -1) { // end animation condition
      state.playing.state.life = state.playing.state.len;
      state.playing = null;
    } else {
      if (state.playing.move) state.playing.move(state.playing.state);
    }
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
  background("white");
  state.currentStage.show();

  if (state.currentStage === stage1 && !stage1.elements.findChildByName("container_pod").findChildByName("pod")) {
    state.currentStage.event.xRelease(stage1.elements);
  }
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

      texture: props.texture,
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

  hasChildren(child) {
    if (!child) return this.children.length > 0;
    return this.children.includes(child);
  }

  addChild(child) {
    if (!(child instanceof CObject)) {
      return;
    }
    if (!this.children.includes(child)) {
      child.parent = this;
      this.children.push(child);
    }
  }

  remove() {
    this.parent.children.splice(this.parent.children.indexOf(this),1);
  }

  removeChild(child) {
    this.children.splice(this.children.indexOf(child),1);
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
      start : props.start, // start position
      length: props.len,
      life: props.len, // in ms
      parent: props.parent, // pointer to remove note
      key: props.key,
      succ : null, // sound effect
      fail : null, 
      hit: false,
    }
    switch (props.key) {
      case 0:
        this.state.succ = se.kick;
        this.state.fail = se.closed;
        break;
      case 1:
        this.state.succ = se.clap;
        this.state.fail = se.rim;
    }
  }
  update(dt) {
    if (this.state.life <= 0) {
      this.state.parent.removeChild(this);
      let hit = this.state.hit;
      if (hit) {
        this.state.succ.play();
      } else {
        this.state.succ.play();
      }
      return hit;
    }
    this.state.life -= dt;
    return null;
  }

  hit() {
    if (this.state.life > 0) {
      this.state.hit = true;
    }
    return this.state.hit;
  }
}

class Player {
  constructor(props) {
    this.children = props.c ? props.c : [];
    this.count = 0;
    this.lastUpdate = -1;
  }

  play() { // call each frame
    if (this.lastUpdate === -1) { // initialize
      this.lastUpdate = frameCount;
      console.log("player initialized succeed " + this.lastUpdate);
    }
    if (this.lastUpdate + rate < frameCount) { // add a beat per frame rate
      this.count ++;
      this.lastUpdate = frameCount;
    }
    this.children.forEach(e => {
      if (this.count >= e.state.start) {
        e.update(deltaTime);
      }
    })
  }

  removeChild(note) {
    this.children.splice(this.children.indexOf(note), 1);
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
  constructor(props, callback) {
    this.state = {
      len   : props.len,
      life  : props.len,
      rate  : props.rate,
      obj   : props.obj,
      loop  : props.loop,
    }
    this.move = props.move;
    this.callback = callback;
  }

  update(dt) {
    this.state.life --;
    let index = (this.state.len - this.state.life) % fr * this.state.rate / fr;
    if (this.state.life <= 0 && !this.state.loop) {
      if (this.callback) this.callback(this.state);
      return -1;
    }
    return ~~index;
  }

  draw() {
    this.state.obj.render();
  }

  addCallback(f) {
    this.callback = f;
  }
}

// when you hit the spacebar, what's currently on the canvas will be saved (as a
// "thumbnail.png" file) to your downloads folder
function keyTyped() {
  if (key === " ") {
    saveCanvas("thumbnail.png");
  } else if (key === "z") {
    // z event
    hitNote(0);
  } else if (key === "x") {
    // x event
    hitNote(1);
  } else if (key === "/") {
    console.log("enter pressed")
    // enter event
    hitNote(-1);
  }
}

function mouseClicked() {
  if (state.currentStage.event.any) {
    state.currentStage.event.any();
    return;
  }
}

function keyPressed() {
  if (state.currentStage.event.any) {
    state.currentStage.event.any();
    return;
  }
  if (state.pressed || state.zPress || state.xPress) return;
  if (keyCode === 90) {
    state.zPress = true;
    state.currentStage.event.zPress(state.currentStage.elements);
  } else if (keyCode === 88) {
    state.xPress = true;
    state.currentStage.event.xPress(state.currentStage.elements);
  }
  state.pressed = true;
}

function keyReleased() {
  if (!state.pressed) return;
  if (state.zPress && state.pressed && !state.xPress) {
    state.zPress = false;
    state.currentStage.event.zRelease(state.currentStage.elements);
  } else if (state.xPress && state.pressed && !state.zPress) {
    state.xPress = false;
    state.currentStage.event.xRelease(state.currentStage.elements);
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