import Phaser from 'phaser'
import HelloWorldScene from './scenes/HelloWorldScene'
import TestScene from './scenes/TestScene'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	scale: {
		mode: Phaser.Scale.FIT,
		parent: 'phaser-example',
		autoCenter: Phaser.Scale.CENTER_BOTH,
		width: 800,
		height: 600
	},
	physics: {
		default: 'arcade',
		arcade: {
			fps: 60,
			gravity: { y: 0 }
		}
	},
	scene: [TestScene]
}


export default new Phaser.Game(config)
