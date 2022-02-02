import Phaser from "phaser"
import { Socket } from "socket.io-client"

export declare interface IBulletData {
    x: number
    y: number
    rotation: number
    velocity: Phaser.Math.Vector2
    shipId : string
}

class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'bullet')
    }

    fire(ship: Phaser.Types.Physics.Arcade.ImageWithDynamicBody, socket: Socket, shipId: string) {
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
        // send bullet to server
        socket.emit("bullet", {
            x: this.x,
            y: this.y,
            rotation: this.rotation,
            velocity: this.body.velocity,
            shipId: shipId
        })

        // kill bullet after 1 seconds
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

    fireBullets(ship: Phaser.Physics.Arcade.Sprite, socket: Socket, shipId: string) {
        if (this.scene.time.now > this.bulletTime) {
            const bullet = this.getFirstDead(true)
            if (bullet) {
                bullet.fire(ship, socket, shipId)
            }
            this.bulletTime = this.scene.time.now + 300
        }
    }
}

export class EnemyBulletGroup extends Phaser.Physics.Arcade.Group {
    constructor(scene: Phaser.Scene) {
        super(scene.physics.world, scene)

        this.createMultiple({
            classType: EnemyBullet,
            frameQuantity: 1,
            active: false,
            visible: false,
            key: 'bullet',
            max: 10
        })
    }

    public fireBullet(scene: Phaser.Scene, bulletData: IBulletData) {
        const bullet = this.getFirstDead(true)
        if (bullet) {
            bullet.fire(scene, bulletData)
        }
    }
}

export class EnemyBullet extends Phaser.Physics.Arcade.Sprite {
    public shipId = ""
    constructor(scene: Phaser.Scene, data: IBulletData) {
        super(scene, data.x, data.y, 'bullet')
    }

    public fire(scene: Phaser.Scene, bulletData: IBulletData) {
        // set shipId
        this.shipId = bulletData.shipId
        this.body.reset(bulletData.x, bulletData.y)
        this.rotation = bulletData.rotation
        this.setVelocity(bulletData.velocity.x, bulletData.velocity.y)
        this.setActive(true)
        this.setVisible(true)
        scene.time.delayedCall(1000, () => {
            this.setActive(false)
            this.setVisible(false)
        }, [], this)

    }
}

