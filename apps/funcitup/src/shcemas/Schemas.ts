// generated file, do not edit

import { Type, Static, TSchema, CloneType } from '@sinclair/typebox'

export type ServiceRequest = Static<typeof ServiceRequest>
export const ServiceRequest = Type.Object(
  {
    headers: Type.Record(Type.String(), Type.String(), {
      description: 'The headers of the request.',
    }),
    params: Type.Record(
      Type.String(),
      Type.Union([
        Type.Array(Type.String()),
        Type.String(),
        Type.Number(),
        Type.Boolean(),
      ]),
      { description: 'The route parameters of the request.' }
    ),
    query: Type.Record(
      Type.String(),
      Type.Union([
        Type.Array(Type.String()),
        Type.String(),
        Type.Number(),
        Type.Boolean(),
      ]),
      { description: 'The query parameters of the request.' }
    ),
  },
  { interface: 'Request' }
)

export type PostRequest<T extends TSchema> = Static<
  ReturnType<typeof PostRequest<T>>
>
export const PostRequest = <T extends TSchema>(T: T) =>
  Type.Composite(
    [
      ServiceRequest,
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

export type MessageBody = Static<typeof MessageBody>
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

export type MessageRequest = Static<typeof MessageRequest>
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

export type JoinBody = Static<typeof JoinBody>
export const JoinBody = Type.Object(
  {
    username: Type.String({ description: 'The username of the user joining' }),
  },
  { description: 'Represents the body of a join request.' }
)

export type JoinRequest = Static<typeof JoinRequest>
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

export type StaticServiceRequest = Static<typeof StaticServiceRequest>
export const StaticServiceRequest = Type.Composite([
  ServiceRequest,
  Type.Object({
    params: Type.Object(
      {
        path: Type.String({ description: 'The path to the static resource' }),
      },
      { description: 'The path to the static resource' }
    ),
    headers: Type.Object(
      {
        'if-none-match': Type.Optional(
          Type.String({
            description:
              'Optional header to specify the expected ETag of the resource.',
          })
        ),
      },
      {
        description:
          'Optional header to specify the expected ETag of the resource.',
      }
    ),
  }),
])
