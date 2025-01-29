import { post, service, body, query } from 'decorators'
import { ChatQuestion, schemas } from './models/Message.models'
import { AzureFunctionService } from 'decorators-functions'
import { queryDocument } from '../../documents/QueryDocuments'

@service('messages')
export class MessageService extends AzureFunctionService {
  @post('send', schemas.ChatMessage)
  @body<ChatQuestion>()
  @query('option', null)
  public async send(question: ChatQuestion, option?: 'openai' | 'deepseek') {
    const [model, url, auth] =
      option === 'openai'
        ? [
            'gpt-4o-mini',
            'https://api.openai.com/v1/chat/completions',
            'Bearer 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',
          ]
        : [
            'deepseek-chat',
            'https://api.deepseek.com/chat/completions',
            'Bearer sk-5709e1a059da4c00b05c4815c461bb8c',
          ]
    const lastUserMessage = question.messages.pop()
    if (lastUserMessage?.content) {
      const context = queryDocument(lastUserMessage.content)
      if (context.length > 0) {
        question.messages.push({
          role: 'assistant',
          content:
            'Här är externt hämtade utdrag ur dokument som kontext för att hjälpa till att svara på användarens fråga:\n\n' +
            context
              .map((c, i) => `${i + 1}. (${c.source}) ${c.content}`)
              .join('\n'),
        })
      }
      question.messages.push(lastUserMessage)
    }
    // Send the message
    const request = {
      model: model,
      messages: question.messages,
      temperature: 0.7,
      stream: false, // Request a streamed response
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: auth,
      },
      body: JSON.stringify(request),
    })

    return await response.json()
  }
}
