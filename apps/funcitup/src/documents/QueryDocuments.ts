import DocumentRetriever from './DocumentRetriever'
import documents from './documents.json'

const documentRetriever = DocumentRetriever.fromObject(documents)

export const queryDocument = (query: string) => {
  return documentRetriever.retrieve(query, 5)
}
