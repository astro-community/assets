// @patch @types/node/http.d.ts
// @see https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/54920

declare module 'http' {
	import * as stream from 'node:stream';

	class IncomingMessage extends stream.Readable {
		url: string
	}
}
