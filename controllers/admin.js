const { validationResult } = require('express-validator')

const Product = require('../models/product')
const Category = require('../models/category')

const Pagination = require('../util/helpers')

const { ITEMS_PER_PAGE } = require('../util/config').pagination

exports.getItem = async (req, res, next) => {
	try {
		const id = req.params.id
		const product = await Product.findById(id)
		if (product) {
			res.status(200).render('product', {
				isAdmin: true,
				product: product
			})
		} else next(error)
	} catch (error) {
		next(error)
	}
}

exports.getEditItem = async (req, res, next) => {
	try {
		const categories = await Category.find()
		const id = req.params.id
		const product = await Product.findOne({ _id: id })
		if (product) {
			res.status(200).render('admin/product', {
				isAdmin: true,
				product: product,
				categories: categories,
			})
		} else next(error)
	} catch (error) {
		next(error)
	}
}

exports.postEditItem = async (req, res, next) => {
	try {
		const categories = await Category.find()
		const validation = validationResult(req)
		if (!validation.isEmpty()) {
			const errors = validation.array().reduce((acc, curr) => {
				acc[curr.param] = true
				return acc
			}, {})
			res.status(200).render('admin/product', {
				isAdmin: true,
				add_item: false,
				isError: true,
				categories: categories,
				product: req.body,
				isInvalid: errors
			})
		} else {
			const id = req.params.id
			const { title, imgUrl, price, desc, category } = req.body
			const prod = await Product.findById(id)
			if (!prod) throw new Error(`No product found by id: ${id}`)
			prod.title = title
			prod.imgUrl = imgUrl
			prod.price = price
			prod.desc = desc
			prod.category = category
			prod.save()
			// const itemLimit = 3 //вынести
			// const countDocs = await Product.estimatedDocumentCount() //загрузка
			// const pages = Math.ceil(countDocs / itemLimit)
			res.redirect(`/admin/catalog/1`) //нужная страница
		}
	} catch (error) {
		next(error)
	}
}

exports.adminCatalog = async (req, res, next) => {
	try {
		const categories = await Category.find()
		const currPage = req.params.page || 1
		const countDocs = await Product.estimatedDocumentCount()
		const pages = Math.ceil(countDocs / ITEMS_PER_PAGE)
		if (currPage !== null && currPage > pages) throw new Error('[getCatalog] Requested page is not found!')
		const products = await Product.find()
			.skip(ITEMS_PER_PAGE * (currPage - 1))
			.limit(ITEMS_PER_PAGE)
		const pagination = new Pagination(currPage, pages).prepare()
		res.status(200).render('catalog', {
			itemList: products,
			isAdmin: true,
			admin_catalog: true,
			pagination: pagination,
			categories: categories
		})
	} catch (error) {
		next(error)
	}
}

exports.getAddNewItem = async (req, res, next) => {
	try {
		const categories = await Category.find()
		console.log(categories)
		res.status(200).render('admin/product', {
			isAdmin: true,
			add_item: true,
			categories: categories
		})
	} catch (error) {
		next(error)
	}
}

exports.postAddNewItem = async (req, res, next) => {
	try {
		const categories = await Category.find()
		const validation = validationResult(req)
		if (!validation.isEmpty()) {
			const errors = validation.array().reduce((acc, curr) => {
				acc[curr.param] = true
				return acc
			}, {})
			// errors
			res.status(200).render('admin/product', {
				isAdmin: true,
				add_item: true,
				isError: true,
				product: req.body,
				categories: categories,
				isInvalid: errors
			})
		} else {
			// no errors
			const { title, imgUrl, price, desc, category } = req.body
			const product = new Product({
				title: title,
				imgUrl: imgUrl,
				price: price,
				desc: desc,
				category: category
			})
			await product.save()
			// const itemLimit = 3
			// const countDocs = await Product.estimatedDocumentCount()
			// const pages = Math.ceil(countDocs / itemLimit)
			res.redirect(`/admin/catalog/${pages}`)
		}
	} catch (error) {
		next(error)
	}
}

exports.getCategories = async (req, res, next) => {
	try {
		const categories = await Category.find()
		res.status(200).render('admin/categories', {
			categories_page: true,
			categories: categories
		})
	} catch (error) {
		next(error)
	}
}

exports.getAddCategory = async (req, res, next) => {
	try {
		res.status(200).render('admin/category', {
			categories_page: true,
			add_category: true
		})
	} catch (error) {
		next(error)
	}
}

exports.getEditCategory = async (req, res, next) => {
	try {
		const id = req.params.id
		const category = await Category.findOne({ _id: id })
		if (category) {
			res.status(200).render('admin/category', {
				isAdmin: true,
				categories_page: true,
				category: category
			})
		} else next(error)
	} catch (error) {
		next(error)
	}
}

exports.postAddCategory = async (req, res, next) => {
	try {
		const validation = validationResult(req)
		if (!validation.isEmpty()) {
			const errors = validation.array().reduce((acc, curr) => {
				acc[curr.param] = true
				return acc
			}, {})
			// errors
			res.status(200).render('admin/category', {
				isAdmin: true,
				categories_page: true,
				add_category: true,
				isError: true,
				category: req.body,
				isInvalid: errors
			})
		} else {
			// no errors
			const { title } = req.body
			const category = new Category({
				title: title
			})
			await category.save()
			res.redirect(`/admin/categories`)
		}
	} catch (error) {
		next(error)
	}
}

exports.postEditCategory = async (req, res, next) => {
	try {
		const validation = validationResult(req)
		if (!validation.isEmpty()) {
			const errors = validation.array().reduce((acc, curr) => {
				acc[curr.param] = true
				return acc
			}, {})
			res.status(200).render('admin/product', {
				isAdmin: true,
				categories_page: true,
				isError: true,
				category: req.body,
				isInvalid: errors
			})
		} else {
			const id = req.params.id
			const { title } = req.body
			const category = await Category.findById(id)
			if (!category) throw new Error(`No category found by id: ${id}`)
			category.title = title
			category.save()
			res.redirect(`/admin/categories`) //нужная страница
		}
	} catch (error) {
		next(error)
	}
}

exports.postDeleteItem = async (req, res, next) => {
	try {
		const id = req.params.id
		const product = await Product.findOne({ _id: id })
		if (product) {
			res.status(200).render('admin/delete', {
				isAdmin: true,
				product: product
			})
		} else next(error)
	} catch (error) {
		next(error)
	}
}

exports.deleteConfirmed = async (req, res, next) => {
	try {
		const id = req.params.id
		const response = await Product.deleteOne({ _id: id })
		const itemLimit = 3
		const countDocs = await Product.estimatedDocumentCount()
		const pages = Math.ceil(countDocs / itemLimit)
		res.redirect(`/admin/catalog/1`)
	} catch (error) {
		next(error)
	}
}
