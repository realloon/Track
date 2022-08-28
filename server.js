const Koa = require('koa')
const router = require('koa-router')()
const fs = require('fs')

const server = new Koa()

router.get('/', async (ctx, next) => {
    ctx.type = 'html'
    ctx.body = fs.readFileSync('index.html')
})

router.get('/:url', async (ctx, next) => {
    if (
        ctx.params.url.indexOf('.js') != -1 ||
        ctx.params.url.indexOf('.mjs') != -1
    ) {
        ctx.type = 'text/javascript'
    }

    ctx.body = fs.readFileSync(ctx.params.url)
})

server.use(router.routes())

server.listen(9000)
console.log('http://127.0.0.1:9000')
