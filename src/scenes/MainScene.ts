import Phaser from "phaser";
import { BulletsGroup } from "~/Objects/BulletsGroup";
import { EnemyShip, EnemyShipData } from "~/Objects/EnemyShip";
import { io, Socket } from "socket.io-client";

export default class MainScene extends Phaser.Scene {
    private cursors !: Phaser.Types.Input.Keyboard.CursorKeys
    private ship !: Phaser.Types.Physics.Arcade.ImageWithDynamicBody
    private bullets !: BulletsGroup
    private speedText !: Phaser.GameObjects.Text
    private enemyShip !: EnemyShip
    private rotationSpeed = 200
    private socket !: Socket
    private health = 100
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
        this.ship = this.physics.add.image(400, 300, 'ship')
        // ship drag to reduce speed
        this.ship.setDrag(100)
        // MAX speed
        this.ship.setMaxVelocity(200)

        // velocity text
        this.speedText = this.add.text(16, 16, '', {
            fontSize: '32px',
            fontStyle: 'bold',
        })

        // create bullets group
        this.bullets = new BulletsGroup(this)
        this.enemyShip = new EnemyShip(this, { x: 100, y: 100, rotation: 100 } as EnemyShipData)

        // make ship collide with enemy ship
        this.physics.add.collider(this.ship, this.enemyShip, () => {
            console.log("Collision");
            if (this.enemyShip) {
                this.enemyShip.health -= 20;
                if (this.enemyShip.health <= 0) {
                    this.enemyShip.destroy();
                }
            }
        })

        this.physics.add.overlap(this.enemyShip, this.bullets, (enemyShip, bullet) => {
            console.log("Bullets Passthrough")
            bullet.destroy()
            console.log(this.enemyShip.health)
            if (this.enemyShip) {
                this.enemyShip.health -= 20;
                if (this.enemyShip.health <= 0) {
                    this.enemyShip.destroy();
                }
            }
        })
    }

    fireBullets() {
        this.bullets.fireBullets(this.ship)
    }

    update(time: number, delta: number): void {
        // move the enemy ship slowly
        if (this.enemyShip && this.enemyShip.body) {
            this.enemyShip.setVelocity(10, 10)
            this.enemyShip.setRotation(this.enemyShip.rotation + 0.01)
        }
        // Ship Movement Control Section
        if (this.cursors.up.isDown) {
            // set ship-idle image to ship
            this.ship.setTexture('ship')
            this.physics.velocityFromRotation(this.ship.rotation, 300, this.ship.body.acceleration)
            // send ship movement data to server
            this.socket.emit("move", {
                x: this.ship.x,
                y: this.ship.y,
                rotation: this.ship.rotation,
                health: this.health
                // bullets: this.bullets
            })
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

        // send ship data 20 times per second

    }




}