/**
 * Represents an HTTP request.
 *
 * @interface Request
 */

export interface ServiceRequest {
  /**
   * @description The headers of the request.
   */
  headers: Record<string, string>
  /**
   * @description The route parameters of the request.
   */
  params: Record<string, string[] | string | number | boolean>
  /**
   * @description The query parameters of the request.
   */
  query: Record<string, string[] | string | number | boolean>
}
/**
 * @description Interface representing a POST request with a generic body type.
 *
 * @template T - The type of the request body.
 */

export interface PostRequest<T> extends ServiceRequest {
  /**
   * @description The body of the request.
   */
  body: T
}
