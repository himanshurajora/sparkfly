import Phaser from "phaser";

export declare interface EnemyBulletData {
    x: number,
    y: number,
    rotation: number

}
export declare interface EnemyShipData {
    id: string
    data: {
        x: number
        y: number
        rotation: number
        health: number
    }
}

// The Drawn Enemy Ship whose current transform is comming from the server
export class EnemyShip extends Phaser.Physics.Arcade.Sprite {
    public health: number = 100
    public id!: string
    constructor(scene: Phaser.Scene, enemyShip: EnemyShipData) {
        super(scene, enemyShip.data.x, enemyShip.data.y, 'ship')
        scene.add.existing(this)
        scene.physics.add.existing(this)
        this.id = enemyShip.id
        this.health = enemyShip.data.health
        this.setRotation(enemyShip.data.rotation)
    }

    public updateShip(enemyShip: EnemyShipData) {
        this.setPosition(enemyShip.data.x, enemyShip.data.y)
        this.setRotation(enemyShip.data.rotation)
        this.health = enemyShip.data.health
    }
}