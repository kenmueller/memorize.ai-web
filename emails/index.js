const {
	mkdirSync: mkdir,
	writeFileSync: writeFile,
	readFileSync: readFile
} = require('fs')
const { join } = require('path')
const compile = require('mjml')

if (require.main === module) {
	const name = process.argv[2]
	
	if (!name)
		throw new Error('You must specify a filename')
	
	try { mkdir(join(__dirname, 'lib')) } catch {}
	
	const sourcePath = join(__dirname, 'src', `${name}.mjml`)
	const outPath = join(__dirname, 'lib', `${name}.html`)
	
	writeFile(
		outPath,
		compile(readFile(sourcePath, 'utf8'), {
			validationLevel: 'strict',
			minify: true,
			filePath: sourcePath
		}).html
	)
	
	console.log(outPath)
}
