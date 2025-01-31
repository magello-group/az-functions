import { post, service, body, path } from 'decorators'
import { ChatQuestion, Message, schemas } from './models/Message.models'
import { AzureFunctionService } from 'decorators-functions'
import { queryDocument } from '../../documents/QueryDocuments'

@service('messages')
export class MessageService extends AzureFunctionService {
  @post('{option}/send', schemas.ChatMessage)
  @body<ChatQuestion>()
  @path('option', 'deepseek')
  public async send(question: ChatQuestion, option: 'openai' | 'deepseek') {
    const [model, url, auth] = this.getOptions(option)
    this.populateQuestion(question)
    // Send the message
    const request = {
      model: model,
      messages: question.messages,
      temperature: 0.4,
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

  @post('{option}/stream', schemas.ChatMessage)
  @body<ChatQuestion>()
  @path('option', 'deepseek')
  public async stream(question: ChatQuestion, option: 'openai' | 'deepseek') {
    const [model, url, auth] = this.getOptions(option)
    this.populateQuestion(question)
    // Send the message
    const request = {
      model: model,
      messages: question.messages,
      temperature: 0.4,
      stream: true, // Request a streamed response
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: auth,
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      this.log?.error(await response.json())
      return this.internalServerError()
    }

    this.reply.headers = {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      connection: 'keep-alive',
      'access-control-allow-origin': '*',
    }
    this.reply.status = 200

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    const log = this.log
    return new ReadableStream({
      async start(controller) {
        const keepAliveInterval = setInterval(() => {
          controller.enqueue(': keep-alive\n\n')
        }, 10000) // Send keep-alive message every 10 seconds
        try {
          let buffer = ''
          while (true) {
            const { done, value } = (await reader?.read()) || {}
            if (done) {
              clearInterval(keepAliveInterval)
              controller.close()
              break
            }
            const chunk = decoder.decode(value, { stream: true })
            buffer += chunk
            const lines = buffer.split('\n\n')
            buffer = lines.pop() || ''
            for (const l of lines) {
              const line = l.trim()
              if (line) {
                if (line === 'data: [DONE]') {
                  controller.enqueue(`${line}\n\n`)
                  controller.close()
                  return
                }
                if (line.startsWith('data: ')) {
                  const data = JSON.parse(line.replace(/^data: /, '')) as {
                    choices: [{ delta: { content: string } }]
                  }
                  if (data.choices[0].delta.content)
                    controller.enqueue(
                      `data: ${JSON.stringify({ delta: { content: data.choices[0].delta.content } })}\n\n`
                    )
                } else {
                  console.info(line)
                }
              }
            }
          }
        } catch (e) {
          log?.error(e)
          controller.error(e)
        } finally {
          if (keepAliveInterval) {
            clearInterval(keepAliveInterval)
          }
        }
      },
    })
  }

  // Private methods
  private populateQuestion(question: ChatQuestion) {
    const lastUserMessage = question.messages.pop()
    // Add the last user message to the question
    if (lastUserMessage?.content) {
      // Query the documents for context
      const context = queryDocument(lastUserMessage.content)
      // Add RAG context to the question
      if (context.length > 0) {
        const msg: Message = {
          role: 'assistant',
          content:
            'Här är externt hämtade utdrag ur dokument som kontext för att hjälpa ' +
            'till att svara på användarens fråga:\n\n' +
            context
              .map((c, i) => `${i + 1}. (${c.source}) ${c.content}`)
              .join('\n'),
        }
        question.messages.push(msg)
      }
      question.messages.push(lastUserMessage)
    }
  }

  private getOptions(option: string | undefined): [string, string, string] {
    if (!process.env.OPENAI_API_KEY || !process.env.DEEPSEEK_API_KEY) {
      throw new Error('Missing API keys')
    }
    return option === 'openai'
      ? [
          'gpt-4o-mini',
          'https://api.openai.com/v1/chat/completions',
          `Bearer ${process.env.OPENAI_API_KEY}`,
        ]
      : [
          'deepseek-chat',
          'https://api.deepseek.com/chat/completions',
          `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        ]
  }
}
