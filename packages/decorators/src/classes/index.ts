/* eslint-disable @typescript-eslint/no-explicit-any */

export type ParameterType = 'body' | 'query' | 'path' | 'head'
export type HTTP_METHOD = 'get' | 'post' | 'put' | 'delete' | 'options'

/**
 * Represents a set of functions to retrieve various types of parameters from a request.
 */
export interface ParameterGetter {
  body: () => Promise<any>
  headers: (name: string) => Promise<string | null | undefined>
  params: <T>(name: string) => Promise<T | null | undefined>
  query: <T>(name: string) => Promise<T | null | undefined>
}

/**
 * Represents the parameters of an HTTP request.
 *
 * @interface RequestParameters
 *
 * @property {Record<string, any>} params - The route parameters of the request.
 * @property {Record<string, any>} query - The query string parameters of the request.
 * @property {Record<string, any>} headers - The headers of the request.
 * @property {any} body - The body of the request.
 */
export interface RequestParameters {
  params: Record<string, any>
  query: Record<string, any>
  headers: Record<string, any>
  body: any
}

/**
 * Abstract class representing a parameter.
 * @template T - The type of the parameter value.
 */
export abstract class Parameter<T = any> {
  /**
   * The name of the parameter.
   */
  name: string

  /**
   * The type of the parameter.
   */
  type: string

  /**
   * The default value of the parameter.
   */
  defaultValue?: T

  /**
   * Creates an instance of Parameter.
   * @param name - The name of the parameter.
   * @param type - The type of the parameter.
   * @param defaultValue - The default value of the parameter.
   */
  constructor(name: string, type: string, defaultValue?: T) {
    this.name = name
    this.type = type
    this.defaultValue = defaultValue
  }

  /**
   * Abstract method to parse the parameter from the request.
   * @param request - The Fastify request object.
   * @param response - The Fastify reply object.
   * @returns The parsed parameter value.
   */
  abstract parse(parameters: RequestParameters): Promise<T>

  abstract populate(
    parameterGetter: ParameterGetter,
    parameters: RequestParameters
  ): Promise<void>

  /**
   * Static method to create a parameter instance based on the type.
   * @template T - The type of the parameter value.
   * @param name - The name of the parameter.
   * @param type - The type of the parameter.
   * @param defaultValue - The default value of the parameter.
   * @returns A new instance of a specific parameter type.
   * @throws Will throw an error if the parameter type is unsupported.
   */
  static createParameter<T>(
    name: string,
    type: ParameterType,
    defaultValue?: T
  ) {
    switch (type) {
      case 'body':
        return new BodyParameter<T>(name, type, defaultValue)
      case 'path':
        return new PathParameter(name, type, defaultValue)
      case 'query':
        return new QueryParameter(name, type, defaultValue)
      case 'head':
        return new HeaderParameter(name, type, defaultValue)
      default:
        throw new Error('Unsupported type')
    }
  }
}

/**
 * Represents a body parameter in an API request.
 *
 * @template T - The type of the body parameter.
 * @extends Parameter<T>
 */
export class BodyParameter<T> extends Parameter<T> {
  /**
   * Creates an instance of BodyParameter.
   *
   * @param name - The name of the parameter.
   * @param type - The type of the parameter.
   * @param defaultValue - The default value of the parameter.
   */
  constructor(name: string, type: string, defaultValue?: T) {
    super(name, type, defaultValue)
  }

  /**
   * Parses the body of the request to extract the parameter value.
   *
   * @param request - The Fastify request object containing the body.
   * @returns The parsed body parameter value.
   */
  async parse(parameters: RequestParameters): Promise<T> {
    return (parameters.body || this.defaultValue) as T
  }

  async populate(
    request: ParameterGetter,
    parameters: RequestParameters
  ): Promise<void> {
    parameters.body = await request.body()
  }
}

/**
 * Represents a path parameter in an API request.
 *
 * @template T - The type of the parameter value.
 * @extends Parameter<T>
 */
export class PathParameter<T> extends Parameter<T> {
  constructor(name: string, type: string, defaultValue?: T) {
    super(name, type, defaultValue)
  }

  /**
   * Parses the request parameters to extract the value associated with the given name.
   * If the parameter is not found, it returns the default value.
   *
   * @param request - The Fastify request object containing the parameters.
   * @returns The value of the parameter or the default value if the parameter is not found.
   */
  async parse(parameters: RequestParameters): Promise<T> {
    return parameters.params[this.name] as T
  }

  async populate(
    request: ParameterGetter,
    parameters: RequestParameters
  ): Promise<void> {
    parameters.params[this.name] = await request.params<T>(this.name)
  }
}

/**
 * Represents a header parameter in an API request.
 *
 * @template T - The type of the header parameter value.
 * @extends Parameter<T>
 */
export class HeaderParameter<T> extends Parameter<T> {
  /**
   * Creates an instance of HeaderParameter.
   *
   * @param name - The name of the header parameter.
   * @param type - The type of the header parameter.
   * @param defaultValue - The default value of the header parameter (optional).
   */
  constructor(name: string, type: string, defaultValue?: T) {
    super(name, type, defaultValue)
  }

  /**
   * Parses the header parameter from the request.
   *
   * @param parameters - The request parameters containing the headers.
   * @returns The value of the header parameter, or the default value if the parameter is not present in the request.
   */
  async parse(parameters: RequestParameters): Promise<T> {
    return parameters.headers[this.name] as T
  }

  async populate(
    request: ParameterGetter,
    parameters: RequestParameters
  ): Promise<void> {
    parameters.headers[this.name] =
      (await request.headers(this.name)) || this.defaultValue
  }
}

/**
 * Represents a query parameter in an API request.
 *
 * @template T - The type of the query parameter value.
 * @extends Parameter<T>
 */
export class QueryParameter<T> extends Parameter<T> {
  /**
   * Creates an instance of QueryParameter.
   *
   * @param name - The name of the query parameter.
   * @param type - The type of the query parameter.
   * @param defeaultValue - The default value of the query parameter (optional).
   */
  constructor(name: string, type: string, defeaultValue?: T) {
    super(name, type, defeaultValue)
  }

  /**
   * Parses the query parameter from the request.
   *
   * @param request - The Fastify request object containing the query parameters.
   * @returns The value of the query parameter, or the default value if the parameter is not present in the request.
   */
  async parse(parameters: RequestParameters): Promise<Awaited<T>> {
    return parameters.query[this.name]
  }

  async populate(
    request: ParameterGetter,
    parameters: RequestParameters
  ): Promise<void> {
    parameters.query[this.name] =
      (await request.query(this.name)) || this.defaultValue
  }
}

/**
 * Represents an HTTP method for a Fastify route.
 */
export class Method {
  /**
   * The name of the method.
   */
  name: string

  /**
   * The parameters of the method.
   */
  parameters: Parameter[]

  /**
   * The path of the route.
   * @default ''
   */
  path: string = ''

  /**
   * The HTTP method.
   * @default 'get'
   */
  httpMethod: HTTP_METHOD = 'get'

  /**
   * The function to be executed for the route.
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  func: Function

  /**
   * Represents the schema for the request.
   */
  schema?: {
    request?: any
    response?: any
  }

  /**
   * Creates an instance of Method.
   * @param name - The name of the method.
   * @param func - The function to be executed for the route.
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  constructor(name: string, func: Function) {
    this.parameters = []
    this.name = name
    this.func = func
  }
}

/**
 * Represents a service with methods that can be registered with a Fastify server.
 */
export class Service {
  path?: string
  name?: string
  methods: Method[]
  cors?: string
  impl?: typeof BaseService<any, any, any> = undefined

  constructor() {
    this.methods = []
  }
}

/**
 * BaseService class provides a base implementation for services with logging, request, and reply handling.
 */
export class BaseService<
  TLog extends object,
  TRequest extends object,
  TReply extends object,
> {
  /**
   * Optional logger instance for logging purposes.
   */
  log?: TLog

  /**
   * Fastify request object.
   */
  request: TRequest = {} as TRequest

  /**
   * Fastify reply object.
   */
  reply: TReply = {} as TReply
}
