const Koa = require('koa')
const router = require('koa-router')()
const fs = require('fs')

function isJavaScriptFile(fileName) {
    return fileName.indexOf('.js') != -1 || fileName.indexOf('.mjs') != -1
}

const server = new Koa()

router.get('/', async (ctx, next) => {
    ctx.type = 'html'
    ctx.body = fs.readFileSync('index.html')
})

router.get('/:url', async (ctx, next) => {
    if (isJavaScriptFile(ctx.params.url)) {
        ctx.type = 'text/javascript'
    }

    ctx.body = await new Promise((resolve, rejects) => {
        fs.readFile(ctx.params.url, 'utf-8', (err, data) => {
            if (!err) {
                resolve(data)
            }
        })
    })
})

server.use(router.routes())

server.listen(9000)
console.log('http://127.0.0.1:9000')
