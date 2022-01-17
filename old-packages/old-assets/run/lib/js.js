import { generate, GENERATOR } from 'astring'
import { importAssertions } from 'acorn-import-assertions'
import { Node, Parser } from 'acorn'
import acornClassFields from 'acorn-class-fields'
import acornLogicalAssignment from 'acorn-logical-assignment'
import acornPrivateMethods from 'acorn-private-methods'

let acornPlugins = [
	acornClassFields,
	acornLogicalAssignment,
	acornPrivateMethods,
	importAssertions
]

let prototype = Node.prototype
let parser = Parser.extend(...acornPlugins)

export let parse = (code) => {
	const onComment = []
	const ast = parser.parse(code, { sourceType: 'module', locations: true, ecmaVersion: 'latest', onComment })

	ast.find('*', node => {
		for (const comment of onComment) {
			if (
				node.loc?.start.line >= comment.loc.start.line &&
				node.loc?.start.column >= comment.loc.start.column
			) {
				node.parentNode.comments = node.parentNode.comments || []
				node.parentNode.comments.push(
					...onComment.splice(onComment.indexOf(comment), 1)
				)
			}
		}
	})

	return ast
}

const customGenerator = Object.assign({}, GENERATOR, {
	ExpressionStatement(node, state) {
		if (node.comments) {
			const precedence = state.expressionsPrecedence[node.expression.type]

			console.log(node.expression)

			if (
				precedence === 17 ||
				(precedence === 3 && node.expression.left.type[0] === 'O')
			) {
				// Should always have parentheses or is an AssignmentExpression to an ObjectPattern
				state.write('(')

				this[node.expression.type](node.expression, state)

				state.write(')')
			} else {
				this[node.expression.type](node.expression, state)
			}

			state.write(';')
		} else {
			GENERATOR.ExpressionStatement(node, state)
		}
	},
})

export let stringify = (ast) => generate(ast, { comments: true, indent: '\t', generator: customGenerator })

let defaultProps = {
	ArrowFunctionExpression: {
		expression: false,
		generator: false,
		async: false,
		params: [],
		body: null,
	},
	AssignmentExpression: {
		operator: '=',
		left: null,
		right: null,
	},
	BlockStatement: {
		body: [],
	},
	CallExpression: {
		callee: null,
		arguments: [],
		optional: false,
	},
	CatchClause: {
		param: null,
		body: { type: 'BlockStatement', body: [] }
	},
	Comment: {
		isBlock: true,
		value: '',
	},
	ExportNamedDeclaration: {
		declaration: null,
		specifiers: []
	},
	ExportSpecifier: {
		local: null,
		exported: null,
	},
	ExpressionStatement: {
		expression: {
			operator: '=',
			left: null,
			right: null,
		},
	},
	Identifier: { name: '_' },
	ImportDefaultSpecifier: {
		local: null
	},
	ImportDeclaration: {
		specifiers: [],
		source: null,
	},
	Literal: {
		value: '_',
		raw: '\'_\'',
		optional: false,
	},
	MemberExpression: {
		object: null,
		property: null,
		computed: false,
		optional: false,
	},
	NewExpression: {
		callee: null,
		arguments: [],
	},
	ObjectExpression: {
		properties: [],
	},
	ObjectPattern: {
		properties: [],
	},
	Program: {
		body: [],
	},
	Property: {
		method: false,
		shorthand: false,
		computed: false,
		key: null,
		value: null,
		kind: 'init',
	},
	RestElement: {
		argument: null,
	},
	ReturnStatement: {
		argument: null,
	},
	TryStatement: {
		block: null,
		handler: null,
		finalizer: null,
	},
	UnaryExpression: {
		operator: '!',
		prefix: true,
		argument: null,
	},
	VariableDeclaration: {
		declarations: [],
		kind: 'var',
	},
	VariableDeclarator: {
		id: null,
		init: {
			type: 'CallExpression',
			callee: null,
			arguments: [],
		}
	},
}


let createNode = (...props) => Object.assign(Object.create(prototype), ...props)

export let create = (type, props) => createNode({ type }, defaultProps[type], props)

export let ArrowFunctionExpression = (props) => create('ArrowFunctionExpression', props)
export let AssignmentExpression = (props) => create('AssignmentExpression', props)
export let BlockStatement = (props) => create('BlockStatement', props)
export let CallExpression = (props) => create('CallExpression', props)
export let CatchClause = (props) => create('CatchClause', props)
export let Comment = (props) => create('Comment', props)
export let ExportNamedDeclaration = (props) => create('ExportNamedDeclaration', props)
export let ExportSpecifier = (props) => create('ExportSpecifierExportSpecifier', props)
export let ExpressionStatement = (props) => create('ExpressionStatement', props)
export let Identifier = (props) => create('Identifier', props)
export let ImportDeclaration = (props) => create('ImportDeclaration', props)
export let ImportDefaultSpecifier = (props) => create('ImportDefaultSpecifier', props)
export let Literal = (props) => create('Literal', props)
export let MemberExpression = (props) => create('MemberExpression', props)
export let NewExpression = (props) => create('NewExpression', props)
export let ObjectExpression = (props) => create('ObjectExpression', props)
export let Program = (props) => create('Program', props)
export let Property = (props) => create('Property', props)
export let ReturnStatement = (props) => create('ReturnStatement', props)
export let TryStatement = (props) => create('TryStatement', props)
export let UnaryExpression = (props) => create('UnaryExpression', props)
export let VariableDeclaration = (props) => create('VariableDeclaration', props)
export let VariableDeclarator = (props) => create('VariableDeclarator', props)

export let parents = new WeakMap()

let createPrototypeOf = (value) => value == null ? value : Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value))

Object.defineProperties(prototype, {
	clone: {
		value: {
			clone(overrides) {
				let process = (object) => {
					let clone = createPrototypeOf(object)

					for (let name of Object.keys(object)) {
						if (object[name] instanceof Object) {
							clone[name] = process(object[name])

							parents.set(clone[name], [name, clone])
						} else {
							clone[name] = object[name]
						}
					}

					return clone
				}

				return Object.assign(process(this), overrides)
			}
		}.clone,
		configurable: true,
		writable: true,
	},
	find: {
		value: {
			find(type, call) {
				let find = (object) => {
					if (type === '*' || object.type === type) call(object)

					for (let [name, data] of Object.entries(object)) {
						if (data instanceof Object) {
							parents.set(data, [name, object])

							find(data)
						}
					}
				}

				find(this)
			}
		}.find,
		configurable: true,
		writable: true,
	},
	parent: {
		get: {
			parent() {
				return (parents.get(this) || [])[1] || null
			},
		}.parent,
		configurable: true,
	},
	parentNode: {
		get: {
			parentNode() {
				let object = this
				while (true) {
					object = parentOf(object)
					if (object == null) return null
					if (object instanceof Array) continue
					return object
				}
			},
		}.parentNode,
		configurable: true,
	},
	keyOfParent: {
		get: {
			keyOfParent() {
				return (parents.get(this) || [])[0] || null
			}
		}.keyOfParent,
		configurable: true,
	},
	keyOfParentNode: {
		get: {
			keyOfParentNode() {
				let object = this, key
				while (true) {
					key = keyOfParent(object)
					object = parentOf(object)
					if (object == null) return null
					if (Array.isArray(object)) continue
					return key
				}
			},
		}.keyOfParentNode,
		configurable: true,
	},
	before: {
		value: {
			before(...nodes) {
				let [name, node] = parents.get(this) || []
				if (!node) return

				if (Array.isArray(node)) {
					const index = node.indexOf(this)

					node.splice(index, 0, ...nodes)
				}

				parents.delete(this)
			}
		}.before,
		configurable: true,
		writable: true,
	},
	remove: {
		value: {
			remove() {
				return this.replaceWith()
			}
		}.remove,
		configurable: true,
		writable: true,
	},
	replaceWith: {
		value: {
			replaceWith(...nodes) {
				let [name, node] = parents.get(this) || []
				if (!node) return

				if (Array.isArray(node)) {
					const index = node.indexOf(this)
					if (index > -1) node.splice(index, 1, ...nodes)
				} else {
					node[name] = Array.isArray(node[name]) || nodes.length > 1 ? nodes : nodes[0] || null
				}

				parents.delete(this)
			}
		}.replaceWith,
		configurable: true,
		writable: true,
	},
	toString: {
		value: {
			toString() {
				return stringify(this)
			},
		}.toString,
		configurable: true,
		writable: true,
	},
})

export let keyOfParent = (object) => (parents.get(object) || [])[0] || null
export let parentOf = (object) => (parents.get(object) || [])[1] || null

export let find = (node, type, next) => {
	if (node.type === type) {
		if (next) next(node)
		else return node
	}
	for (let name in node) {
		if (name === 'type') continue

		let data = node[name]

		if (Array.isArray(data)) {
			parents.set(data, this)

			for (let each of data.slice(0)) {
				if (each instanceof Node) {
					parents.set(each, data)

					let deep = find(each, type, next)

					if (deep && !next) return deep
				}
			}
		} else if (data instanceof Node) {
			parents.set(data, this)

			let deep = find(data, type, next)

			if (deep && !next) return deep
		}
	}
	return null
}
