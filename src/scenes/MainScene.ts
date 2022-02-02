import Phaser from "phaser";
import { BulletsGroup, EnemyBullet, EnemyBulletGroup, IBulletData } from "~/Objects/BulletsGroup";
import { EnemyBulletData, EnemyShip, EnemyShipData } from "~/Objects/EnemyShip";
import { io, Socket } from "socket.io-client";
import { PlayerShip } from "~/Objects/Ship";

export default class MainScene extends Phaser.Scene {
    private cursors !: Phaser.Types.Input.Keyboard.CursorKeys
    private ship !: Phaser.Physics.Arcade.Sprite
    private bullets !: BulletsGroup
    private speedText !: Phaser.GameObjects.Text
    private healthText !: Phaser.GameObjects.Text
    private scoreText !: Phaser.GameObjects.Text
    private enemyShips: EnemyShip[] = []
    private enemyBullets !: EnemyBulletGroup
    private rotationSpeed = 200
    private socket !: Socket
    private health = 100
    private mySocketId !: string
    private score = 0
    constructor() {
        super("test-scene")
    }

    preload() {
        // Load all assets 
        this.load.image("ship", 'assets/ship.png')
        this.load.image("bullet", 'assets/bullet.png')
        this.load.image("ship-idle", 'assets/ship_idle.png')
        this.load.image("ship-enemy", 'assets/ship_enemy.png')

        let localhost = "http://localhost:5000"
        // let glitch = "https://empty-button-eater.glitch.me/"
        let host = localhost
        // create socket
        this.socket = io(host)
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
                }
            })
        })

        // add collision detection
        // this.physics.add.collider(this.ship, this.enemyShips)

        // on new enemy ship
        this.socket.on("enter", (Ship: EnemyShipData) => {
            this.enemyShips.push(new EnemyShip(this, Ship))
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
            // clear enemy ship where id is equal to id
            this.enemyShips.forEach((ship, index) => {
                if (ship.id === id) {
                    ship.visible = false
                    this.enemyShips.splice(index, 1)
                }
            })
        })


        /**
         * Bullet Management Below
         * - My Bullets
         * - Enemy Bullets
         * - Collision
         * - Hit, etc
         */

        // create bullets group
        this.bullets = new BulletsGroup(this)

        this.enemyBullets = new EnemyBulletGroup(this)

        // set overlap for enemy bullets
        this.physics.add.overlap(this.ship, this.enemyBullets, (ship, bullet) => {
            this.health -= 10
            bullet.destroy()
        })

        // set overlap for my bullets
        this.physics.add.overlap(this.enemyShips, this.bullets, (ship, bullet) => {
            // simple case to remove bullet when it hits enemy ship
            this.score += 10
            bullet.destroy()
        })
        // on new bullet from server on event bullet
        this.socket.on("bullet", (bullet: IBulletData) => {
            // add bullet to enemy bullets group    
            this.enemyBullets.fireBullet(this, bullet)
        })

        // Data to display

        // velocity text
        this.speedText = this.add.text(16, 16, '', {
            fontSize: '32px',
            fontStyle: 'bold',
        })

        this.healthText = this.add.text(this.game.canvas.width - 150, 16, `Health: ${this.health}`, {
            fontSize: '15px',
            fontStyle: 'bold',
        })

        this.scoreText = this.add.text(this.game.canvas.width - 150, 30, `Score: ${this.score}`, {
            fontSize: '15px',
            fontStyle: 'bold',
        })


    }

    fireBullets() {
        this.bullets.fireBullets(this.ship, this.socket, this.mySocketId)
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
        this.speedText.setText(`Speed: ${this.ship.body.velocity.length().toFixed()}`)

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

        // show health and score
        this.healthText.setText(`Health: ${this.health}`)
        this.scoreText.setText(`Score: ${this.score}`)
    }
}