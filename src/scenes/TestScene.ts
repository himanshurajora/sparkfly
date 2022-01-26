import Phaser from "phaser";
import { BulletsGroup } from "./BulletsGroup";

export default class TestScene extends Phaser.Scene {
    private cursors !: Phaser.Types.Input.Keyboard.CursorKeys
    private ship !: Phaser.Types.Physics.Arcade.ImageWithDynamicBody
    private bullets !: BulletsGroup
    private speedText !: Phaser.GameObjects.Text
    private rotationSpeed = 200
    constructor() {
        super("test-scene")
    }

    preload() {
        // Load all assets
        this.load.image("ship", 'assets/ship.png')
        this.load.image("bullet", 'assets/bullet.png')
        this.load.image("ship-idle", 'assets/ship_idle.png')
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
    }

    fireBullets() {
        this.bullets.fireBullets(this.ship)
    }

    update(time: number, delta: number): void {
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

    }




}