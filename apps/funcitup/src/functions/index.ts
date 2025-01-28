import { app } from '@azure/functions'
import { ChannelService } from '../api/services/ChannelService'
import { MessageService } from '../api/services/MessageService'
import { addHttpFunction } from 'decorators-functions'
import { StaticService } from '../api/services/StaticService'

app.setup({ enableHttpStream: true })

addHttpFunction(ChannelService)
addHttpFunction(MessageService)
addHttpFunction(StaticService)
