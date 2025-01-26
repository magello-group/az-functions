import * as pathJoin from 'path'
import { HTTP_METHOD, Service, Method, BaseService } from '../classes'

// Private variables
const methods: Map<Function, Method> = new Map()
const services: Set<Service> = new Set()
const undefinedService = new Service()
let currentService: Service = undefinedService
const createService = () => {
  const service = new Service()
  services.add(service)
  return service
}

/**
 * Retrieves all services.
 *
 * @returns {Service[]} An array of all services.
 */
export const getAllServices = (): Service[] => {
  return [...services.values()]
}

export const getService = (
  s: typeof BaseService<any, any, any>
): Service | undefined => {
  return getAllServices().find((service) => service.impl === s)
}

/**
 * Indicates that a class is a service that can be registered for service discovery.
 * @param service - The service to be tagged or annotated.
 */
export type ServiceDecorator<T> = (
  service: T
) => T

/**
 * A type representing a method  decoration.
 *
 * @param target - The target function to which the  decoration is applied.
 * @param context - The context of the class method decorator.
 */
export type MethodDecorator = (
  target: Function,
  context: ClassMethodDecoratorContext
) => void

type Constructor<T> = new () => T;

/**
 * Holdd the values of the class method decorator.
 * 
 */
export const service =
  <T extends Constructor<BaseService<any, any, any>>>(path?: string, cors?: string): ServiceDecorator<T> =>
  (target: T) => {
    const localService = currentService
    currentService = undefinedService
    localService.path = path || target.name.toLowerCase()
    localService.cors = cors
    localService.name = target.name
    localService.impl = target
    return target
  }

/**
 * A method decoration for HTTP GET requests.
 *
 * @param path - An optional path for the GET request. If not provided, the target method's name will be used as the path.
 * @returns A Method decoration function that registers the method as a GET endpoint.
 */
export const get =
  (path?: string, schema?: any): MethodDecorator =>
  (target, context) => {
    createMethod(path || target.name, 'get', target, context, schema)
  }

/**
 * A method decoration for HTTP POST requests.
 *
 * @param path - An optional path for the POST request. If not provided, the target's name will be used as the path.
 * @returns A Method decoration function that registers the method as a POST endpoint.
 */
export const post =
  (path?: string, schema?: any): MethodDecorator =>
  (target, context) => {
    createMethod(path || target.name, 'post', target, context, schema)
  }

/**
 * A method decorator that registers a method as an HTTP PUT endpoint.
 *
 * @param path - The optional path for the endpoint. If not provided, the method name will be used as the path.
 * @returns A method decoration function that registers the method with the specified path and HTTP method.
 */
export const put =
  (path?: string, schema?: any): MethodDecorator =>
  (target, context) => {
    createMethod(path || target.name, 'put', target, context, schema)
  }

const createMethod = (
  path: string,
  httpMethod: HTTP_METHOD,
  target: Function,
  context: ClassMethodDecoratorContext,
  requestSchema?: any
) => {
  if (context.kind === 'method') {
    if (currentService === undefinedService) {
      currentService = createService()
    }
    let method = getMethod(target)
    method.schema = { ...method?.schema, request: requestSchema }
    method.httpMethod = httpMethod
    method.path = pathJoin.join('/', path)
    currentService.methods.push(method)
  }
}

export const getMethod = (target: Function) => {
  let method = methods.get(target)
  if (!method) {
    method = new Method(target.name, target)
    methods.set(target, method)
  }
  return method
}
