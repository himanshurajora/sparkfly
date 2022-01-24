import Phaser from "phaser";

export default class TestScene extends Phaser.Scene {


    private cursors !: Phaser.Types.Input.Keyboard.CursorKeys
    private ship !: Phaser.Types.Physics.Arcade.ImageWithDynamicBody
    private bullet !: Phaser.Types.Physics.Arcade.ImageWithDynamicBody
    private bullets !: Phaser.Physics.Arcade.Group
    private speedText !: Phaser.GameObjects.Text
    constructor() {
        super("test-scene")
    }

    preload() {
        this.load.image("ship", 'assets/ship.png')
    }

    create() {
        this.cursors = this.input.keyboard.createCursorKeys()
        this.ship = this.physics.add.image(400, 300, 'ship')
        this.ship.setDrag(6)
        // velocity text
        this.speedText = this.add.text(16, 16, '', {
            fontSize: '32px',
            fontStyle: 'bold',
        })
    }


    update(time: number, delta: number): void {
        // Ship Movement Control Section
        if (this.cursors.up.isDown) {
            if (this.ship.body.velocity.length() < 300) {
                this.physics.velocityFromRotation(this.ship.rotation, 100, this.ship.body.acceleration)
            } else {
                this.ship.setAcceleration(0, 0)
            }
        }
        else {
            this.ship.setAcceleration(0)
        }

        if (this.cursors.left.isDown) {
            this.ship.setAngularVelocity(-100)
        }
        else if (this.cursors.right.isDown) {
            this.ship.setAngularVelocity(100)
        }
        else {
            this.ship.setAngularVelocity(0)
        }

        this.physics.world.wrap(this.ship, 5)
        // update spped text
        this.speedText.setText(`Speed: ${this.ship.body.velocity.length()}`)



    }

    


}