type Props =
  | number
  | string
  | boolean
  | Record<string, number | string | boolean>
type DynamicObject = {
  [key: string]: (o?: Props) => DynamicObject
}

const createDynamicObject = (): DynamicObject => {
  return new Proxy<DynamicObject>({} as DynamicObject, {
    get(target, prop, receiver) {
      if (prop === 'toJSON') {
        return () => target
      }
      if (prop === 'toString') {
        console.log('TOSTRING ')
        return () => target.toString()
      }
      if (prop in target) {
        return Reflect.get(target, prop, receiver)
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (...args: any[]) => {
        if (args.length) {
          target[String(prop)] = args[0]
          return receiver
        } else {
          return Reflect.get(target, prop, receiver)
        }
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    set(target, prop: string, value: any, receiver) {
      Reflect.set(target, prop, value, receiver)
      return true
    },
    deleteProperty(target, prop) {
      delete target[String(prop)]
      return true
    },
  })
}

const obj = createDynamicObject()
;(function () {
  try {
    const hej = obj
      .headers({
        contentType: 'appa/klacka',
        Etag: 'W/jekjre',
      })
      .status(200)
      .body({
        message: 'hej på dej',
      })
    console.log(JSON.stringify(hej, null, 2))
  } catch (err) {
    console.error(err)
  }
})()
