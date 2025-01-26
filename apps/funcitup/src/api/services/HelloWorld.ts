import { get, path, service } from 'decorators'
import { AzureFunctionService } from '../base/AzureFunctionService'
import { Type as T, Static as S } from '@sinclair/typebox'

const helloSchema = T.Object({
  params: T.Object({
    name: T.String(),
  }),
})

const response = T.Object({
  message: T.String(),
})

type Response = S<typeof response>

@service('helloworld')
export class HelloWorld extends AzureFunctionService {
  @get('sayhello')
  public async helloWorld(): Promise<Response> {
    return {
      message: 'Hello, world!',
    }
  }

  @get('create/{name}', helloSchema)
  @path('name')
  public async hello(name: string): Promise<Response> {
    return {
      message: `Created, ${name}!`,
    }
  }
}
