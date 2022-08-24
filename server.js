const Koa = require('koa')
const router = require('koa-router')()
const fs = require('fs')

const server = new Koa()

router.get('/', async (ctx, next) => {
    ctx.type = 'html'
    ctx.body = fs.readFileSync('index.html')
})

router.get('/static/:name', async (ctx, next) => {
    ctx.body = fs.readFileSync('./static/' + ctx.params.name)
})

server.use(router.routes())

server.listen(5050)
console.log('http://127.0.0.1:5050')
