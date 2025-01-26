import { app } from '@azure/functions'
import { ChannelService } from '../api/services/ChannelService'
import { HelloWorld } from '../api/services/HelloWorld'
import { MessageService } from '../api/services/MessageService'
import { addHttpFunction } from 'azure-functions-support'

app.setup({ enableHttpStream: true })

addHttpFunction(ChannelService)
addHttpFunction(MessageService)
addHttpFunction(HelloWorld)
