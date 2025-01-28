import { AzureFunctionService } from 'decorators-functions'
import { get, head, path, service } from 'decorators'
import { promises as fs } from 'fs'
import { join } from 'path'
import { schemas } from './models/Static.models'
import { createHash } from 'crypto'

type Response = {
  status: number
  body?: string | Buffer | ReadableStream
  headers?: Record<string, string>
}

@service('public')
export class StaticService extends AzureFunctionService {
  @get('{*path}', schemas.StaticServiceRequest)
  @path('path')
  @head('if-none-match')
  async getStaticFile(path: string, etag?: string): Promise<Response> {
    const filePath = join(process.cwd(), 'public', path)
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8')
      const hash = createHash('md5').update(fileContent).digest('hex')
      if (etag === `W/${hash}`) {
        return {
          status: 304,
          headers: {
            'Cache-Control': 'public, max-age=3600',
            ETag: `W/${hash}`,
          },
        }
      }
      return {
        status: 200,
        body: fileContent,
        headers: {
          'Content-Type': this.getContentType(filePath),
          'Cache-Control': 'public, max-age=3600',
          ETag: `W/${hash}`,
        },
      }
    } catch (error) {
      this.log?.error(error)
      return {
        status: 404,
        body: `File not found: ${path}`,
      }
    }
  }

  private getContentType(filePath: string): string {
    const ext = filePath.split('.').pop() ?? ''
    switch (ext.toLocaleLowerCase()) {
      case 'html':
        return 'text/html'
      case 'css':
        return 'text/css'
      case 'js':
        return 'application/javascript'
      case 'json':
        return 'application/json'
      case 'png':
        return 'image/png'
      case 'jpg':
        return 'image/jpeg'
      case 'gif':
        return 'image/gif'
      default:
        return 'application/octet-stream'
    }
  }
}
