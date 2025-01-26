import { app } from '@azure/functions'
import { addAzureFunction } from '../api/base/AzureFunctionService'
import { ChannelService } from '../api/services/ChannelService'
import { HelloWorld } from '../api/services/HelloWorld'
import { MessageService } from '../api/services/MessageService'

app.setup({ enableHttpStream: true })

addAzureFunction(ChannelService)
addAzureFunction(MessageService)
addAzureFunction(HelloWorld)
