import {
  app,
  HttpMethod,
  HttpRequest,
  HttpResponse,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions'
import { ValidateFunction } from 'ajv'

import * as path from 'path'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import {
  BaseService,
  getService,
  Method,
  Parameter,
  RequestParameters,
  util,
} from 'decorators'

// const myOutput = output.storageBlob({
//   path: 'outputBlob',
//   connection: 'AzureWebJobsStorage',
// })
// export function azureFunction<T extends new () => T>(path?: string, cors?: string) {
//   return (target: T) => {
//     const n = {
//         [`${target.name}Function`]: class extends AzureFunctionService {
//           constructor() {
//             super();
//             Object.assign(this, new target());
//           }
//         }}[`${target.name}Function`] as new () => AzureFunctionService;
//     return service(path, cors)(n) as typeof AzureFunctionService;
//   }
// }

/**
 * AzureFunctionService class extends the BaseService to handle HTTP requests in an Azure Function context.
 *
 * @template ContextLogger - The type of the context logger.
 * @template HttpRequest - The type of the HTTP request.
 * @template HttpResponseInit - The type of the initial HTTP response.
 */
export class AzureFunctionService extends BaseService<
  InvocationContext,
  HttpRequest,
  HttpResponseInit
> {
  /**
   * Handles an HTTP request by validating parameters, executing the specified method, and returning an appropriate response.
   *
   * @param request - The HTTP request object.
   * @param context - The invocation context, which includes logging and other context-specific information.
   * @param method - The method to be executed, which includes the function and its parameters.
   * @param validate - A function to validate the request parameters.
   * @returns A promise that resolves to an HTTP response, which can be either an `HttpResponseInit` or an `HttpResponse`.
   *
   * @throws Will catch and log any errors that occur during the execution and return an internal server error response.
   */
  async handleRequest(
    request: HttpRequest,
    context: InvocationContext,
    method: Method,
    validate: ValidateFunction<RequestParameters>
  ): Promise<HttpResponseInit | HttpResponse> {
    try {
      const parameters = await this.getRequestParameters(
        method.parameters,
        request
      )
      const valid = validate(parameters)
      if (!valid) {
        return this.createValidationError({
          error: 'Invalid parameters',
          details: validate.errors,
        })
      }
      const args = await Promise.all(
        method.parameters.map((p) => p.parse(parameters))
      )
      this.log = context
      this.request = request
      this.reply = {
        status: 200,
        headers: {},
        cookies: [],
      }
      const response = await method.func.apply(this, args)
      if (typeof response.status === 'number') {
        return response
      }
      if (response instanceof HttpResponse) {
        return response
      }
      if (typeof response === 'string' || response instanceof ReadableStream) {
        this.reply.body = response
        return this.reply
      }
      this.reply.jsonBody = response
      return this.reply
    } catch (e) {
      context.error(e)
      return this.internalServerError()
    }
  }

  /**
   * Creates an HTTP response representing a validation error.
   *
   * @param body - The body of the error response, typically containing details about the validation error.
   * @returns An HttpResponseInit object with a 400 status code and the provided error body.
   */
  createValidationError(body: unknown): HttpResponseInit {
    return this.createError(400, body)
  }

  /**
   * Generates an HTTP response with a 500 Internal Server Error status.
   *
   * @returns {HttpResponseInit} The HTTP response with a 500 status code and an error message.
   */
  internalServerError(): HttpResponseInit {
    return this.createError(500, { error: 'Internal Server Error' })
  }

  /**
   * Creates an HTTP response with the specified status code and body.
   *
   * @param status - The status code of the response.
   * @param body - The body of the response, typically containing error details.
   * @returns An HttpResponseInit object with the provided status code and body.
   */
  createError(status: number, body?: unknown): HttpResponseInit {
    return {
      status: status,
      jsonBody: body ?? { error: 'An error occurred' },
    }
  }

  /**
   * Retrieves and populates request parameters from an HTTP request.
   *
   * @param parameters - An array of `Parameter` objects that define how to extract and populate the request parameters.
   * @param req - The `HttpRequest` object containing the incoming request data.
   * @returns A promise that resolves to a `RequestParameters` object containing the extracted request parameters.
   */
  async getRequestParameters(parameters: Parameter[], req: HttpRequest) {
    const requestParameters: RequestParameters = {
      body: {},
      headers: {},
      params: {},
      query: {},
    }
    const getter = {
      body: async () => req.json(),
      headers: async (name: string) => req.headers.get(name),
      params: async <T>(name: string) => req.params[name] as T,
      query: async <T>(name: string) => req.query.get(name) as T,
    }
    await Promise.all(
      parameters.map((p) => p.populate(getter, requestParameters))
    )
    return requestParameters
  }
}

/**
 * Adds an Azure Function to the application.
 *
 * This function takes a service class, retrieves its methods, and sets up
 * HTTP triggers for each method. It uses AJV for request validation and
 * configures the function with the appropriate HTTP method, authentication
 * level, and route.
 *
 * @param serviceClass - The service class to add as an Azure Function.
 *
 * @throws Will throw an error if the service is not found or if there is an issue
 *         adding the Azure Function.
 */
export const addHttpFunction = (serviceClass: typeof AzureFunctionService) => {
  try {
    const service = getService(serviceClass)
    if (!service) {
      throw new Error(`Service not found: ${serviceClass.name}`)
    }
    const ajv = addFormats(new Ajv({ coerceTypes: true }))
    const methods = service?.methods
    methods?.forEach((method) => {
      const validate = ajv.compile<RequestParameters>(
        method.schema?.request || {}
      )
      const trigger = `${util.capitalize(service.name, '_', method.name)}`
      app.http(trigger, {
        methods: [method.httpMethod.toUpperCase() as HttpMethod],
        // extraOutputs: [myOutput],
        authLevel: 'anonymous',
        handler: async (req, context) => {
          // context.extraOutputs.get(myOutput)
          return new serviceClass().handleRequest(
            req,
            context,
            method,
            validate
          )
        },
        route: `${path.join(service?.path || '', method.path)}`,
      })
    })
  } catch (e) {
    console.error('Failed to add Azure Function:', serviceClass, e)
    throw e
  }
}
