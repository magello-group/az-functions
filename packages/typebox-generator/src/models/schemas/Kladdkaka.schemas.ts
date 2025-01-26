import { Type, Static } from '@sinclair/typebox'

export const Kaka = Type.Object({
  namn: Type.String(),
})

export const Kladdkaka = Type.Composite([
  Kaka,
  Type.Object({
    kladdig: Type.Boolean(),
  }),
])
