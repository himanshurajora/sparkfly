import Phaser from "phaser";

export declare interface EnemyBulletData {
    x: number,
    y: number,
    rotation: number

}
export declare interface EnemyShipData {
    x: number
    y: number
    rotation: number
    health: number
    bullets: EnemyBulletData[]
    id : string
}

// The Drawn Enemy Ship whose current transform is comming from the server
export class EnemyShip extends Phaser.Physics.Arcade.Sprite {
    public health : number = 100
    public id!: string
    constructor(scene: Phaser.Scene, enemyShip : EnemyShipData) {
        super(scene, enemyShip.x, enemyShip.y, 'ship')
        scene.add.existing(this)
        scene.physics.add.existing(this)
        this.setRotation(enemyShip.rotation)
    }
}