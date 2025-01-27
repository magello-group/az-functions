export * as schemas from './Message.schemas'

/**
 * Represents an HTTP request.
 *
 * @interface Request
 */
export interface Request {
  /**
   * @description The headers of the request.
   */
  headers: Record<string, string>
  /**
   * @description The route parameters of the request.
   */
  params: Record<string, string | number | boolean | null | undefined>
  /**
   * @description The query parameters of the request.
   */
  query: Record<string, string | number | boolean | null | undefined>
}

/**
 * @description Interface representing a POST request with a generic body type.
 *
 * @template T - The type of the request body.
 */
export interface PostRequest<T> extends Request {
  /**
   * @description The body of the request.
   */
  body: T
}

/**
 * @description Represents the body of a message.
 */
export interface MessageBody {
  /**
   * @description The username of the sender
   */
  to: string
  /**
   * @description This is the actual message tos send
   * @maxLength 140
   * @minLength 1
   */
  message: string
}

/**
 * @description Represents a request to post a message.
 */
export interface MessageRequest extends PostRequest<MessageBody> {
  params: {
    /**
     * @description The id associated with the user
     */
    id: number
  }
}

/**
 * @description Represents the body of a join request.
 */
export interface JoinBody {
  /**
   * @description The username of the user joining
   */
  username: string
}

/**
 * @description Represents a request to join a channel.
 */
export interface JoinRequest extends PostRequest<JoinBody> {
  params: {
    /**
     * @description Path parameter containing the channel to join
     */
    channel: string
  }
}
