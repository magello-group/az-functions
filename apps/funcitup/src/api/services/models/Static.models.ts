import { ServiceRequest } from './Base.models'

export * as schemas from '../../../shcemas/Schemas'

export interface StaticServiceRequest extends ServiceRequest {
  params: {
    /**
     * @description The path to the static resource
     */
    path: string
  }

  headers: {
    /**
     * @description Optional header to specify the expected ETag of the resource.
     */
    'if-none-match'?: string
  }
}
