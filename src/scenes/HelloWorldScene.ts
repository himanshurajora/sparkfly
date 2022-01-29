import Phaser from 'phaser'


/**
 * @class HelloWorldScene
 * @extends Phaser.Scene
 * @classdesc The Hello World Scene For This game
 * @description
 * - Contains function like preload, create, update, render
 * - Contains variables like game, player, socket, cursors, bullets, speedText, enemyShips, enemyBullets, rotationSpeed, health, mySocketId
 * - This class helps us create a new scene, Message : This Seems to be a normal JS Docs
 * - Contains should be an open switch like a bulb is flashing but I think it's depression that keep it off
 * - Happines could be my goal but depression is my obstacle
 * - BTW did you check my website ? sharemytext, ofter non as somewebshit
 * 
 * @constructor (?)
 * @param {Phaser.Scene} scene - The scene that this class belongs to - No That's not
 * 
 * // Todo: A room is there for problem - can you solve that problem ?
 * x: number, y: number, rotation: number, health: number
 * // Fix: NothingShip : IShipData
 * 
 * @author Himanshu Jangid
 */
export default class HelloWorldScene extends Phaser.Scene
{
	constructor()
	{
		super('hello-world')
	}

	preload()
    {
        this.load.setBaseURL('http://labs.phaser.io')

        this.load.image('sky', 'assets/skies/space3.png')
        this.load.image('logo', 'assets/sprites/phaser3-logo.png')
        this.load.image('red', 'assets/particles/red.png')
    }

    create()
    {
        this.add.image(400, 300, 'sky')

        const particles = this.add.particles('red')

        const emitter = particles.createEmitter({
            speed: 100,
            scale: { start: 1, end: 0 },
            blendMode: 'ADD'
        })

        const logo = this.physics.add.image(400, 100, 'logo')

        logo.setVelocity(100, 200)
        logo.setBounce(1, 1)
        logo.setCollideWorldBounds(true)

        emitter.startFollow(logo)
    }
}
