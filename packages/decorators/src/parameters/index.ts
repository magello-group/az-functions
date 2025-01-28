import { getMethod } from '../methods'
import { Parameter, ParameterType } from '../classes'

/**
 * A type representing a decorator function for method parameters.
 *
 * @param target - The constructor function of the class that contains the method.
 * @param _ - The context of the class method decorator.
 */
export type ParameterDecorator = (
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  target: Function
) => void

/**
 * A decorator function for defining a path parameter in an API endpoint.
 *
 * @template T - The type of the default value, defaults to `string`.
 * @param {string} name - The name of the path parameter.
 * @param {T} [defaultValue] - An optional default value for the path parameter.
 * @returns {Function} - A decorator function that registers the path parameter.
 */
export const path =
  <T = string>(name: string, defaultValue?: T): ParameterDecorator =>
  (target) => {
    getParam(target, name, 'path', defaultValue)
  }

/**
 * Decorator to define a query parameter for an API endpoint.
 *
 * @template T - The type of the query parameter. Defaults to `string`.
 * @param {string} name - The name of the query parameter.
 * @param {T} [defaultValue] - The default value of the query parameter.
 * @returns {Function} - A decorator function that registers the query parameter.
 */
export const query =
  <T = string>(name: string, defaultValue?: T): ParameterDecorator =>
  (target) => {
    getParam(target, name, 'query', defaultValue)
  }

export const head =
  <T = string>(name: string, defaultValue?: T): ParameterDecorator =>
  (target) => {
    getParam(target, name, 'head', defaultValue)
  }

/**
 * Decorator to define a body parameter for an API endpoint.
 *
 * @template T - The type of the body parameter. Defaults to `{}`.
 * @param {T} [defaultValue] - The default value of the body parameter.
 * @returns {Function} - A decorator function that registers the body parameter.
 */
export const body =
  <T extends object>(defaultValue?: T): ParameterDecorator =>
  (target) => {
    getParam(target, 'body', 'body', defaultValue)
  }

/**
 * Adds a parameter to the specified method's parameter list.
 *
 * @template T - The type of the default value.
 * @param target - The target function to which the parameter will be added.
 * @param name - The name of the parameter.
 * @param where - The location of the parameter (e.g., query, path, body).
 * @param defaultValue - An optional default value for the parameter.
 */
const getParam = <T>(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  target: Function,
  name: string,
  where: ParameterType,
  defaultValue?: T
) => {
  const method = getMethod(target)
  method.parameters.unshift(
    Parameter.createParameter(name, where, defaultValue)
  )
}
