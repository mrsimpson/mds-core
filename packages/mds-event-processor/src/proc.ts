import db from '@mds-core/mds-db'
import cache from '@mds-core/mds-cache'
import http from 'http'

const env = process.env

async function resetAll(type: string) {
  // cache related
  if (type === 'event') {
    await cache.delCache('device:state')
  } else if (type === 'trip') {
    await cache.delCache('trip:state')
    await cache.delMatch('device:*:trips')
  }

  // database related
  await db.initialize()
  if (type === 'event') {
    await db.resetTable('reports_device_states')
  } else if (type === 'trip') {
    await db.resetTable('reports_trips')
  }
}

async function dataHandler(
  type: string,
  callback: { (type: any, data: any): Promise<any>; (arg0: any, arg1: any): void }
) {
  console.log('Creating server...')
  const server = http.createServer((req, res) => {
    const { method } = req
    if (method === 'POST') {
      let body: string = ''
      req.on('data', function(data: string) {
        body += data
      })
      req.on('end', function() {
        const contentType = req.headers['content-type'] ?? ''
        const type = contentType?.indexOf(';') >= 0 ? contentType.substring(0, contentType.indexOf(';')) : contentType

        const parsedBody = JSON.parse(body)

        if (type === 'application/json') {
          // binary
          const ce_data: { [x: string]: any } = {
            type: req.headers['ce-type'],
            specversion: req.headers['ce-specversion'],
            source: req.headers['ce-source'],
            id: req.headers['ce-id'],
            data: parsedBody
          }

          callback(ce_data.type, ce_data.data)
        } else if (type === 'application/cloudevents+json') {
          // structured
          callback(parsedBody.type, parsedBody.data)
        }

        res.statusCode = 200
        res.end()
      })
    } else if (req.method === 'GET') {
      // TODO: MAKE SURE ADMIN PERMISSIONS ARE SETUP
      if (req.url === '/reset') {
        resetAll(type)
        res.statusCode = 200
        res.end()
      }
      res.statusCode = 404
      res.end()
    }
  })
  console.log(`listening on ${env.PORT}...`)
  server.listen(env.PORT || 4000)
}
export { dataHandler }
