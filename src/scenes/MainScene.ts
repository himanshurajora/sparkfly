import Phaser from "phaser";
import { BulletsGroup } from "~/Objects/BulletsGroup";
import { EnemyShip, EnemyShipData } from "~/Objects/EnemyShip";
import { io, Socket } from "socket.io-client";
import { PlayerShip } from "~/Objects/Ship";

export default class MainScene extends Phaser.Scene {
    private cursors !: Phaser.Types.Input.Keyboard.CursorKeys
    private ship !: Phaser.Physics.Arcade.Sprite
    private bullets !: BulletsGroup
    private speedText !: Phaser.GameObjects.Text
    private enemyShips: EnemyShip[] = []
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

        this.ship = new PlayerShip(this, x, y)
        // trigger enter event on socket
        this.socket.emit("enter", {
            x: x,
            y: y,
            rotation: 0,
            health: 100
        })

        // get my socket id
        this.socket.on("id", ({ id, ships }) => {
            this.mySocketId = id
            // create enemy ships
            ships.forEach(ship => {
                // add only if it's not my ship
                console.log(ship)
                if (ship.id !== id) {
                    this.enemyShips.push(new EnemyShip(this, ship))
                    // set collision between Ship and EnemyShip
                    this.physics.add.collider(this.ship, this.enemyShips[this.enemyShips.length - 1])
                }
            })
        })

        // on new enemy ship
        this.socket.on("enter", (Ship: EnemyShipData) => {
            this.enemyShips.push(new EnemyShip(this, Ship))
            // set collision between Ship and EnemyShip
            this.physics.add.collider(this.ship, this.enemyShips[this.enemyShips.length - 1])
        })

        // on enemy ship move
        this.socket.on("move", (Ship: EnemyShipData) => {
            // update enemy ship
            this.enemyShips.forEach(ship => {
                if (ship.id === Ship.id) {
                    ship.updateShip(Ship)
                }
            })
        })

        // on enemy ship left the game
        this.socket.on('left', (id) => {
            // clear all enemy ships
            this.enemyShips.forEach(ship => {
                ship.visible = false
            })
            // remove enemy ship from array
            this.enemyShips = this.enemyShips.filter(ship => ship.id !== id)
            console.log(this.enemyShips)
        })

        // velocity text
        this.speedText = this.add.text(16, 16, '', {
            fontSize: '32px',
            fontStyle: 'bold',
        })

        // create bullets group
        this.bullets = new BulletsGroup(this)
    }

    fireBullets() {
        this.bullets.fireBullets(this.ship)
    }

    update(time: number, delta: number): void {

        // Ship Movement Control Section
        if (this.cursors.up.isDown) {
            // set ship-idle image to ship
            this.ship.setTexture('ship')
            // It's phaser's error that this.ship.body.acceleration is not a property so I used any to get around it
            this.physics.velocityFromRotation(this.ship.rotation, 300, (this.ship.body as any).acceleration)
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
            id: this.mySocketId,
            data: {
                x: this.ship.x,
                y: this.ship.y,
                rotation: this.ship.rotation,
                health: this.health
            }
        })

        // show the id of enemy ships just below the ship
        // this.enemyShips.forEach(ship => {
        //     this.add.text(ship.x, ship.y- 20, ship.id)
        // })
    }
}