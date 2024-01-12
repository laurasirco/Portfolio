let Engine = null
let World = null
let engine = null
let world = null
let render = null
let wheel;


function initMatter(matterHolder) {
    const Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Bodies = Matter.Bodies,
        World = Matter.World,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        Bounds = Matter.Bounds,
        Composite = Matter.Composite

    const engine = Engine.create()
    world = engine.world

    const heightAdjust = 1
    const width = matterHolder.clientWidth
    const height = matterHolder.clientHeight * heightAdjust
    const scale = window.devicePixelRatio

    render = Render.create({
        element: matterHolder,
        engine,
        options: {
            wireframes: true,
            showAngleIndicator: false,
            background: 'transparent',
            showSleeping: false,
            width,
            height
        }
    })
    Matter.Render.setPixelRatio(render, scale)

    const runner = Runner.create();
    Runner.run(runner, engine);
    const placement = { x: 10, y: 10 };
    const spacing = { x: 30, y: 30 };

    createBoundingBox();
    addObjects()
    addMouse()

    const gravity = 0.0
    engine.world.gravity.y = gravity
    Matter.Runner.run(engine)
    Render.run(render)
    window.requestAnimationFrame(mapHTML);

    function createBoundingBox() {
        World.add(engine.world, [
            Bodies.rectangle(width / 2, height + 250, width, 500, { isStatic: true, label: '_noMap', render: { fillStyle: "red " } }),
            Bodies.rectangle(width / 2, -50, width, 100, { isStatic: true, label: '_noMap' }),
            Bodies.rectangle(-50, height / 2, 100, height, { isStatic: true, label: '_noMap' }),
            Bodies.rectangle(width + 50, height / 2, 100, height, { isStatic: true, label: '_noMap' }),
        ]);
    }

    let parts = [];
    let bodies = [];
    for (let i = 0; i < 90; i++) {
        let a = Bodies.rectangle(
            width / 2 + Math.cos(i * 4 * Math.PI / 180) * 200,
            height / 2 + Math.sin(i * 4 * Math.PI / 180) * 200,
            10,
            20,
            {
                isStatic: true,
                friction: 0.5,
                angle: Math.PI / 180 * i * 4,
                render: {
                    strokeStyle: "#000",
                    lineWidth: 1
                }
            }
        );
        parts.push(a);
        World.add(engine.world, a);
    }

    wheel = Matter.Body.create({ parts, isStatic: true });
    console.log(wheel)

    function addObjects() {
        matterHolder.querySelectorAll('[data-object]').forEach((object) => {
            addObject(object)
        })
    }

    function addObject(object) {
        const objWidth = object.scrollWidth;
        const objHeight = object.scrollHeight;
        const rect = Matter.Bodies.rectangle(
            placement.x * spacing.y,
            placement.y * spacing.x,
            objWidth,
            objHeight,
            {
                chamfer: { radius: [objHeight / 2 - 10] },
                label: object.getAttribute('data-object'),
                density: 0.1,
                frictionAir: 0.05,
                restitution: 1,
                friction: 0.001,
                render: {
                    fillStyle: 'transparent',
                    strokeStyle: 'transparent',
                }
            }, 100)

        World.add(engine.world, rect);
        Matter.Sleeping.update(rect, 50);
        const rotation = (Math.random() < 0.5 ? -1 : 1) * (Math.random() * 1)
        Matter.Body.rotate(rect, rotation)
        checkPlacement()
    }

    function checkPlacement() {
        placement.x++;
        if (placement.x * spacing.x > width - spacing.x) {
            placement.y++;
            placement.x = 1;
        }
    }

    function addMouse() {
        const mouse = Mouse.create(render.canvas);
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    fillStyle: 'transparent',
                    strokeStyle: 'transparent',
                    visible: false,
                },
            },
        });
        World.add(engine.world, mouseConstraint);

        mouse.element.removeEventListener('mousewheel', mouse.mousewheel);
        mouse.element.removeEventListener('DOMMouseScroll', mouse.mousewheel);
        render.mouse = mouse;
    }

    function mapHTML() {
        const allBodies = Matter.Composite.allBodies(engine.world);

        allBodies.forEach((body) => {
            const targetObject = matterHolder.querySelector(`[data-object="${body.label}"]`)
            if (body.label === '_noMap' || !targetObject) { return }
            targetObject.style.setProperty('--move-x', `${body.position.x}px`);
            targetObject.style.setProperty('--move-y', `${body.position.y}px`);
            targetObject.style.setProperty('--rotate', `${body.angle}rad`);
        })

        changeGravity()

        window.requestAnimationFrame(mapHTML);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const matterHolder = document.querySelector('[data-html-matter]')
    if (!matterHolder) { return }
    initMatter(matterHolder)
});

let time = 0
const changeGravity = function(){
    time = time + 0.02

    world.gravity.y = 1*Math.sin(time)
    world.gravity.x = 1*Math.cos(time)
}


