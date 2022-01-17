import * as fs from 'node:fs/promises'

const binary = await fs.readFile(
	new URL('./jsquash/jSquash-main/packages/jpeg/codec/dec/mozjpeg_dec.wasm', import.meta.url)
).then(
	buffer => new Uint8Array(buffer)
)

console.log(
	JSON.stringify(Buffer.from(binary).toString('base64')).length,
	JSON.stringify(Buffer.from(binary, 'base64').toString('binary')).length
)