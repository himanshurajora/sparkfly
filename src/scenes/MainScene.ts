import Phaser from "phaser";
import { BulletsGroup } from "~/Objects/BulletsGroup";
import { EnemyShip, EnemyShipData } from "~/Objects/EnemyShip";
import { io, Socket } from "socket.io-client";

export default class MainScene extends Phaser.Scene {
    private cursors !: Phaser.Types.Input.Keyboard.CursorKeys
    private ship !: Phaser.Types.Physics.Arcade.ImageWithDynamicBody
    private bullets !: BulletsGroup
    private speedText !: Phaser.GameObjects.Text
    private enemyShip: EnemyShip | null = null
    private enemyShipData: EnemyShipData = {
        x: 0,
        y: 0,
        health: 100,
        rotation: 0,
        bullets: []
    }
    private rotationSpeed = 200
    private socket !: Socket
    private health = 100
    private mySocketId !: string
    constructor() {
        super("test-scene")
    }

    preload() {
        // Load all assets 
        this.load.image("ship", 'assets/ship.png')
        this.load.image("bullet", 'assets/bullet.png')
        this.load.image("ship-idle", 'assets/ship_idle.png')
        // create socket
        this.socket = io("http://localhost:5000")
        // send hello message
        this.socket.emit("hello", "Hello from Users")
    }

    create() {
        // put random size circles on the screen
        for (let i = 0; i < 100; i++) {
            let x = Phaser.Math.Between(0, this.game.canvas.width)
            let y = Phaser.Math.Between(0, this.game.canvas.height)
            let radius = Phaser.Math.Between(1, 2)
            this.add.circle(x, y, radius, 0xffffff)
        }

        // create cursor for keyboard input
        this.cursors = this.input.keyboard.createCursorKeys()
        var x = Math.floor(Math.random() * (this.game.canvas.width - 50))
        var y = Math.floor(Math.random() * (this.game.canvas.height - 50))
        
        this.ship = this.physics.add.image(x, y, 'ship')
        // ship drag to reduce speed
        this.ship.setDrag(100)
        // MAX speed
        this.ship.setMaxVelocity(200)

        // Handling Enemy Ship
        // get my socket id
        this.socket.on("id", (data) => {
            this.mySocketId = data.id
            data.users.forEach(user => {
                if (user.id !== this.mySocketId) {
                    this.enemyShip = new EnemyShip(this, { x: 100, y: 100, health: 100, rotation: 0, bullets: [] })
                }
            })

        })

        this.socket.on("newConnection", (data) => {
            if (data.id !== this.mySocketId) {
                this.enemyShip = new EnemyShip(this, { x: 100, y: 100, health: 100, rotation: 0, bullets: [] })
            }
        })

        this.socket.on("move", (data) => {
            if (data.id !== this.mySocketId) {
                this.enemyShipData = data.data
            }
        })

        // velocity text
        this.speedText = this.add.text(16, 16, '', {
            fontSize: '32px',
            fontStyle: 'bold',
        })

        // create bullets group
        this.bullets = new BulletsGroup(this)
        // make ship collide with enemy ship
        // this.physics.add.collider(this.ship, this.enemyShip, () => {
        //     console.log("Collision");
        //     if (this.enemyShip) {
        //         this.enemyShip.health -= 20;
        //         if (this.enemyShip.health <= 0) {
        //             this.enemyShip.destroy();
        //         }
        //     }
        // })

        // this.physics.add.overlap(this.enemyShip, this.bullets, (enemyShip, bullet) => {
        //     console.log("Bullets Passthrough")
        //     bullet.destroy()
        //     console.log(this.enemyShip.health)
        //     if (this.enemyShip) {
        //         this.enemyShip.health -= 20;
        //         if (this.enemyShip.health <= 0) {
        //             this.enemyShip.destroy();
        //         }
        //     }
        // })
    }

    fireBullets() {
        this.bullets.fireBullets(this.ship)
    }

    update(time: number, delta: number): void {

        // Enemy Ship Handling
        if (this.enemyShip && this.enemyShip.body) {
            this.enemyShip.setPosition(this.enemyShipData.x, this.enemyShipData.y)
            this.enemyShip.setRotation(this.enemyShipData.rotation)
        }

        // Ship Movement Control Section
        if (this.cursors.up.isDown) {
            // set ship-idle image to ship
            this.ship.setTexture('ship')
            this.physics.velocityFromRotation(this.ship.rotation, 300, this.ship.body.acceleration)
        }
        else {
            this.ship.setTexture('ship-idle')
            this.ship.setAcceleration(0)
        }

        if (this.cursors.left.isDown) {
            this.ship.setAngularVelocity(-this.rotationSpeed)
        }
        else if (this.cursors.right.isDown) {
            this.ship.setAngularVelocity(this.rotationSpeed)
        }
        else {
            this.ship.setAngularVelocity(0)
        }

        if (this.cursors.space.isDown) {
            // fire bullet
            this.fireBullets()
        }

        this.physics.world.wrap(this.ship, 5)
        // update spped text
        this.speedText.setText(`Speed: ${this.ship.body.velocity.length()}`)

        // send ship data 
        this.socket.emit("move", {
            x: this.ship.x,
            y: this.ship.y,
            rotation: this.ship.rotation,
            health: this.health
        })
    }




}