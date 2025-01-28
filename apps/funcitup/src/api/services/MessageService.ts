import { post, service, body, path } from 'decorators'
import { MessageBody, schemas } from './models/Message.models'
import { AzureFunctionService } from 'decorators-functions'

@service('messages')
export class MessageService extends AzureFunctionService {
  @post('{id}/send', schemas.MessageRequest)
  @body<MessageBody>()
  @path('id')
  public async send(requestBody: MessageBody, id: number) {
    return {
      from: id,
      requestBosdy: requestBody,
      message: 'Message sent successfully',
      schema: schemas.MessageRequest,
    }
  }
}
