import { post, service, body, path, BaseService } from 'decorators'
import { AzureFunctionService } from '../base/AzureFunctionService'
import { MessageBody, schemas } from './models/Message.models'

@service('messages')
export class MessageService extends AzureFunctionService {
  @post('{id}/send', schemas.MessageRequest)
  @body<MessageBody>()
  @path('id')
  public async send(
    requestBosdy: MessageBody,
    id: number
  ) {
    return {
      from: id,
      requestBosdy,
      message: 'Message sent successfully',
      schema: schemas.MessageRequest,
    }
  }
}
