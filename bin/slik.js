#!/usr/bin/env node

if (process.argv.includes('build') || process.argv.includes('watch')) {
	// Use gulpfile from the slik module
	process.argv.push('--gulpfile');
	process.argv.push(require.resolve('./../gulpfile.js'));

	require('gulp-cli')();
} else if (process.argv.includes('config')) {
	const fs = require('fs');
	const destPath = `${process.env.INIT_CWD}/.slikrc`;

	if (fs.existsSync(destPath)) {
		const readline = require('readline');
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		rl.question('.slikrc file already exists, do you want to overrride it? (yes/no) ', answer => {
			if (['y', 'yes'].includes(answer)) {
				fs.copyFile(require.resolve('./../.slikrc'), destPath, err => {
					if (err) {
						throw err;
					}

					console.log('.slikrc file created.');
				});
			}

			rl.close();
		});
	} else {
		fs.copyFile(require.resolve('./../.slikrc'), destPath, err => {
			if (err) {
				throw err;
			}

			console.log('.slikrc file created.');
		});
	}
} else {
	console.log('No build');
}
