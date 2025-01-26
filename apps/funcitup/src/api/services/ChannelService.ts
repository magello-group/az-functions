import { body, get, path, post, service } from 'decorators'
import { JoinBody, schemas } from './models/Message.models'
import { AzureFunctionService } from 'azure-functions-support'

@service('channels')
export class ChannelService extends AzureFunctionService {
  @get('list')
  public async list() {
    return [`${process.version} - Hello Wxorld`]
  }

  @post('{channel}/join', schemas.JoinRequest)
  @body<JoinBody>()
  @path('channel')
  public async join(user: JoinBody, channel: string) {
    return {
      user: user.username,
      action: 'join',
      channel,
    }
  }
}
