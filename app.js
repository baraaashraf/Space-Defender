const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d')


canvas.width = innerWidth
canvas.height = innerHeight
const scoreNo = document.querySelector('#scoreNo')
const startGameBtn = document.querySelector('#startGameBtn')
const startMenu = document.querySelector('#startMenu')
const finalScore =  document.querySelector('#finalScore')


class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y

        this.radius = radius
        this.color = color
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Targets {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }

}
const friciton = 0.98
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
        
    }

    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }

    update() {
        this.draw()
        this.velocity.x *= friciton
        this.velocity.y *= friciton
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }

}

xCenter = canvas.width / 2;
yCenter = canvas.height / 2;


let player = new Player(xCenter, yCenter, 15, 'white')
let projectiles = []
let targets = []
let particles = []

function init(){

    player = new Player(xCenter, yCenter, 15, 'white')
    projectiles = []
    targets = []
    particles = []
    score = 0
    scoreNo.innerHTML = score
    finalScore.innerHTML = score

}


const projectile = new Projectile(canvas.width / 2, canvas.height / 2, 5, 'red', {
    x: 1,
    y: 1
})



function spawnTargets() {
    setInterval(() => {
        const radius = Math.random() * (40 - 6) + 6
        let x
        let y

        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
        } else {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }

        const color = `hsl(${Math.random() * 360},80%,50%)`

        const angle = Math.atan2(
            yCenter - y,
            xCenter - x)

        const velocity = {
            x: Math.cos(angle)  * 1.8,
            y: Math.sin(angle)  * 1.8
        }

        targets.push(new Targets(x, y, radius, color, velocity))
    }, 1000)
}

let animationId
let score = 0
function animate() {
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0,0,0,0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.draw()
    particles.forEach((particle, index) => {
        if(particle.alpha <= 0){
            particles.splice(index, 1)
        }else{
            particle.update()
        }
        
    })
    projectiles.forEach((projectile, pIndex) => {
        projectile.update()
        //remove off screen projectiles from array
        if(    projectile.x + projectile.radius < 0
            || projectile.x - projectile.radius > canvas.width
            || projectile.y + projectile.radius < 0
            || projectile.y - projectile.radius > canvas.height){
                setTimeout(() => {
                    projectiles.splice(pIndex, 1)
                },0)
        }
    })

    targets.forEach((target, tIndex) => {
        target.update()
        const dist = Math.hypot(player.x - target.x,
            player.y - target.y)
        // targers hit player
        if (dist - target.radius - player.radius < 1) {
            cancelAnimationFrame(animationId)
            startMenu.style.display = 'flex'
            finalScore.innerHTML = score
        }
        projectiles.forEach((projectile, pIndex) => {
            const dist = Math.hypot(projectile.x - target.x,
                projectile.y - target.y)

            // shot collides with target
            if (dist - target.radius - projectile.radius < 1) {
                
                // Create Particle Effect
                for(let i=0;i< target.radius * 2;i++){
                    particles.push(
                        new Particle(projectile.x, projectile.y, Math.random() * 2, target.color,{
                        x: (Math.random() - 0.5) * (Math.random() * 6), 
                        y: (Math.random() - 0.5) * (Math.random() * 6)
                        })
                    )
                }
                
                if(target.radius - 10 > 5){
                    //increase Score
                    score += 20
                    scoreNo.innerHTML = score

                    gsap.to(target,{
                        radius: target.radius - 15
                    })
                    setTimeout(() => {
                    projectiles.splice(pIndex, 1)
                    },0)
                }else{
                    //increase Score
                    score += 100
                    scoreNo.innerHTML = score

                    setTimeout(() => {
                    targets.splice(tIndex, 1)
                    projectiles.splice(pIndex, 1)
                    },0)
                }   
            }
        });
    });
}

addEventListener('click', (event) => {
    const angle = Math.atan2(event.clientY - yCenter, event.clientX - xCenter)

    const velocity = {
        x: Math.cos(angle) *5,
        y: Math.sin(angle) *5
    }

    projectiles.push(new Projectile(xCenter, yCenter, 5, 'white', velocity))
})

startGameBtn.addEventListener('click', ()=>{
    init()
    animate()
    spawnTargets()
    startMenu.style.display = 'none'
})