const Engine = Matter.Engine
const Render = Matter.Render
const Bodies = Matter.Bodies
const World = Matter.World
const Runner = Matter.Runner
const MouseConstraint = Matter.MouseConstraint
const Composites = Matter.Composites
const Query = Matter.Query

const sectionTag = document.querySelector("section.shapes")

const w = window.innerWidth
const h = window.innerHeight
const pixelRatio = window.devicePixelRatio

const engine = Matter.Engine.create()
const renderer = Matter.Render.create({
    element: sectionTag,
    engine : engine,
    options: {
        height: h,
        width: w, 
        background: 'transparent',
        wireframes: false,
        pixelRatio: pixelRatio
    }
})

const createShape = function(x, y){
    return Bodies.circle(x, y, 25, {
        render: {
            sprite: {
                texture: "/assets/img/logo_scribble.png",
                xScale: 0.11,
                yScale: 0.11
            }
        },
    })
}

const bigBall = Bodies.circle(w/2, h/2, h/4, {
    render:{
        fillStyle: "black",
    },
    isStatic: true
})

const wallOptions = {
    isStatic: true,
    render: {
        visible: false
    }
}

const ground = Bodies.rectangle(w/2, h + 50, w + 100, 100, wallOptions)
const ceiling = Bodies.rectangle(w/2, -50, w + 100, 100, wallOptions)
const rightWall = Bodies.rectangle(w + 50, h/2, 100, h + 100, wallOptions)
const leftWall = Bodies.rectangle(-50, h/2, 100, h + 100, wallOptions)

const initialShapes = Composites.stack(0, 0, 20, 10, 20, 20, function(x, y){
    return createShape(x, y)
})

const mouseControl = MouseConstraint.create(engine, {
    element: sectionTag,
    constraint:{
        render:{
            visible: false
        }
    }
})

World.add(engine.world, [bigBall, ground, ceiling, leftWall, rightWall, mouseControl, initialShapes])


document.addEventListener("click", function(event){
    const shape = createShape(event.pageX, event.pageY)
    initialShapes.bodies.push(shape)
    World.add(engine.world, shape)
})

document.addEventListener("mousemove", function(event){
    const vector = {x: event.pageX, y: event.pageY}
    const hoveredShapes = Query.point(initialShapes.bodies, vector)

    hoveredShapes.forEach(shape => {
        shape.render.sprite = null
        shape.render.fillStyle = "red"
    });
})

Runner.run(engine)
Render.run(renderer)

//animating gravity with a sin

// let time = 0
// const changeGravity = function(){
//     time = time + 0.001

//     engine.world.gravity.y = 1*Math.sin(time)
//     engine.world.gravity.x = 1*Math.cos(time)

//     requestAnimationFrame(changeGravity)
// }

// changeGravity()


//gravity changing with orientation
window.addEventListener("deviceorientation", function(event){
    engine.world.gravity.y = event.beta / 30
    engine.world.gravity.x = event.gamma / 30
})