import { get, path, service } from 'decorators'
import { Type as T, Static as S } from '@sinclair/typebox'
import { AzureFunctionService } from 'azure-functions-support'

const helloSchema = T.Object({
  params: T.Object({
    name: T.String(),
  }),
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
