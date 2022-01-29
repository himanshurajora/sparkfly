import Phaser from "phaser"
class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'bullet')
    }

    fire(ship: Phaser.Types.Physics.Arcade.ImageWithDynamicBody) {
        this.body.reset(ship.x, ship.y)
        // set angle of bullet
        this.rotation = ship.rotation
        // set velocity of bullet
        this.setVelocity(
            Math.cos(this.rotation) * 500,
            Math.sin(this.rotation) * 500
        )

        this.setActive(true)
        this.setVisible(true)

        // kill bullet after 2 seconds
        this.scene.time.delayedCall(1000, () => {
            this.setActive(false)
            this.setVisible(false)
        }, [], this)
    }
}

export class BulletsGroup extends Phaser.Physics.Arcade.Group {

    private bulletTime = 0
    constructor(scene: Phaser.Scene) {
        super(scene.physics.world, scene)

        this.createMultiple({
            classType: Bullet,
            frameQuantity: 1,
            active: false,
            visible: false,
            key: 'bullet',
            max: 10
        })
    }

    fireBullets(ship: Phaser.Physics.Arcade.Sprite) {
        if (this.scene.time.now > this.bulletTime) {
            const bullet = this.getFirstDead(true)
            if (bullet) {
                bullet.fire(ship)
            }
            this.bulletTime = this.scene.time.now + 300
        }
    }
}   