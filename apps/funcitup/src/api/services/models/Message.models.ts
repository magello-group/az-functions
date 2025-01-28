import { PostRequest } from './Base.models'

export * as schemas from '../../../shcemas/Schemas'

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
