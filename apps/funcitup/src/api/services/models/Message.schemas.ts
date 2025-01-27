// generated file, do not edit

import { Type, TSchema, CloneType } from '@sinclair/typebox'

export const Request = Type.Object(
  {
    headers: Type.Record(Type.String(), Type.String(), {
      description: 'The headers of the request.',
    }),
    params: Type.Record(
      Type.String(),
      Type.Union([
        Type.String(),
        Type.Number(),
        Type.Boolean(),
        Type.Null(),
        Type.Undefined(),
      ]),
      { description: 'The route parameters of the request.' }
    ),
    query: Type.Record(
      Type.String(),
      Type.Union([
        Type.String(),
        Type.Number(),
        Type.Boolean(),
        Type.Null(),
        Type.Undefined(),
      ]),
      { description: 'The query parameters of the request.' }
    ),
  },
  { interface: 'Request' }
)

export const PostRequest = <T extends TSchema>(T: T) =>
  Type.Composite(
    [
      Request,
      Type.Object({
        body: CloneType(T, { description: 'The body of the request.' }),
      }),
    ],
    {
      description:
        'Interface representing a POST request with a generic body type.',
      template: 'T',
    }
  )

export const MessageBody = Type.Object(
  {
    to: Type.String({ description: 'The username of the sender' }),
    message: Type.String({
      description: 'This is the actual message tos send',
      maxLength: 140,
      minLength: 1,
    }),
  },
  { description: 'Represents the body of a message.' }
)

export const MessageRequest = Type.Composite(
  [
    PostRequest(MessageBody),
    Type.Object({
      params: Type.Object(
        {
          id: Type.Number({ description: 'The id associated with the user' }),
        },
        { description: 'The id associated with the user' }
      ),
    }),
  ],
  { description: 'Represents a request to post a message.' }
)

export const JoinBody = Type.Object(
  {
    username: Type.String({ description: 'The username of the user joining' }),
  },
  { description: 'Represents the body of a join request.' }
)

export const JoinRequest = Type.Composite(
  [
    PostRequest(JoinBody),
    Type.Object({
      params: Type.Object(
        {
          channel: Type.String({
            description: 'Path parameter containing the channel to join',
          }),
        },
        { description: 'Path parameter containing the channel to join' }
      ),
    }),
  ],
  { description: 'Represents a request to join a channel.' }
)
