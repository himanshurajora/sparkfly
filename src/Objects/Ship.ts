import Phaser from "phaser";

export class PlayerShip extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "ship");
        scene.add.existing(this);
        scene.physics.world.enable(this);
        this.setDrag(100);
        this.setMaxVelocity(200);
        this.setRotation(Math.random() * 360);
        return this as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    }
}