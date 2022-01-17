import * as js from './js.js'

export const exportify = (code, wasm, key, fun) => {
	const ast = js.parse(code)

	ast.find('ExpressionStatement', expressionStatement => {
		switch (expressionStatement.expression?.left?.name) {
			case 'ENVIRONMENT_IS_NODE':
			case 'ENVIRONMENT_IS_SHELL':
			case 'ENVIRONMENT_IS_WEB':
			case 'ENVIRONMENT_IS_WORKER':
			case 'read_':
			case 'readAsync':
			case 'setWindowTitle':
				expressionStatement.remove()
		}
	})

	ast.find('VariableDeclarator', (declaration) => {
		switch (declaration.id.name) {
			case 'ENVIRONMENT_IS_WEB':
				declaration.init = js.Literal({ value: true, raw: 'true' })
				break
			case 'ENVIRONMENT_IS_NODE':
			case 'ENVIRONMENT_IS_SHELL':
			case 'ENVIRONMENT_IS_WORKER':
			case 'dataURIPrefix':
				declaration.parentNode.remove()
				break
			case 'key':
			case 'moduleOverrides':
				declaration.parentNode.kind = 'let'
				break
			case 'readyPromiseResolve':
				declaration.parentNode.kind = 'let'
				break
			case 'asm':
				declaration.parentNode.remove()
				return
			case 'wasmBinary':
				declaration.init = js.parse(`Buffer.from('${wasm}', 'base64')`).body[0]
				return
		}
	})

	ast.find('IfStatement', (ifStatement) => {
		switch (ifStatement.test.name) {
			case '_scriptDir':
			case 'ENVIRONMENT_IS_WORKER':
			case 'readBinary':
				ifStatement.remove()
				return
		}

		switch (ifStatement.test.property?.value) {
			case 'locateFile':
				ifStatement.remove()
				return
		}

		switch (ifStatement.test.left?.name) {
			case 'ENVIRONMENT_IS_WEB':
				ifStatement.test = js.Literal({ value: true, raw: 'true' })
				return
		}

		switch (ifStatement.test.right?.left?.name) {
			case 'ENVIRONMENT_IS_WEB':
				ifStatement.test = js.UnaryExpression({
					argument: js.Identifier({
						name: 'wasmBinary'
					})
				})
				return
		}

		if (ifStatement.test.left?.argument?.name === 'fetch') {
			ifStatement.replaceWith(
				...ifStatement.consequent.body
			)
			return
		}

		if (ifStatement.test.property && ifStatement.test.property.value === 'instantiateWasm') {
			ifStatement.remove()
			return
		}
	})

	ast.find('VariableDeclarator', variableDeclarator => {
		switch (true) {
			case variableDeclarator.id?.name === 'wasmBinaryFile' && variableDeclarator.init?.type === 'CallExpression':
			case variableDeclarator.id?.name === 'read_':
				variableDeclarator.parentNode.remove()
		}
	})

	ast.find('FunctionDeclaration', functionDeclaration => {
		switch (true) {
			case functionDeclaration.id?.name === 'emval_get_global':
			case functionDeclaration.id?.name === 'isDataURI':
			case functionDeclaration.id?.name === 'locateFile':
				functionDeclaration.remove()
		}
	})

	ast.find('MemberExpression', memberExpression => {
		if (
			/^[A-Za-z][A-Za-z_]*$/.test(memberExpression.property?.value || '')
		) {
			memberExpression.computed = false
			memberExpression.property = js.Identifier({ name: memberExpression.property.value })
		}
	})

	ast.find('CallExpression', callExpression => {
		switch (true) {
			case callExpression.callee?.name === 'emval_get_global':
				callExpression.replaceWith(
					js.Identifier({ name: 'globalThis' })
				)
				return
		}
	})

	ast.find('CallExpression', callExpression => {
		switch (true) {
			case callExpression.callee?.name === 'isDataURI':
				callExpression.parentNode.replaceWith(
					js.Literal({ value: true, raw: 'value' })
				)
				return
		}
	})

	ast.find('FunctionDeclaration', functionDeclaration => {
		switch (true) {
			case functionDeclaration.id?.name === 'instantiateArrayBuffer':
			case functionDeclaration.id?.name === 'receiveInstantiationResult':
				functionDeclaration.remove()
				return
			case functionDeclaration.id?.name === 'instantiateAsync':
				functionDeclaration.replaceWith(
					js.parse(
						Function.prototype.toString.call(
							function instantiateAsync() {
								return WebAssembly.instantiate(wasmBinary, info).then((result) => receiveInstance(result.instance))
							}
						)
					).body[0]
				)
		}
		
	})

	ast.body.unshift(
		...js.parse(`export const Module = {}; const wasmBinaryFile = ''`).body
	)

	ast.body.push(
		...js.parse(`export const ${key} = ${fun}`).body
	)

	return js.stringify(ast)
}
