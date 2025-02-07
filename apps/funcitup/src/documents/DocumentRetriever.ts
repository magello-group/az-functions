import * as natural from 'natural'
import * as path from 'path'
import gzip from 'zlib'

interface Metadata {
  source: string
  chunk_id: number
}

class DocumentRetriever {
  private chunkSize: number
  private overlap: number
  private documents: string[]
  private metadata: Metadata[]
  private vectorizer: natural.TfIdf

  constructor(chunkSize: number = 300, overlap: number = 50) {
    this.chunkSize = chunkSize
    this.overlap = overlap
    this.documents = []
    this.metadata = []
    this.vectorizer = new natural.TfIdf()
  }

  public addDocument(content: string, source: string): void {
    const chunks = this.splitDocument(content)
    chunks.forEach((chunk, idx) => {
      this.documents.push(chunk)
      this.metadata.push({ source: path.basename(source), chunk_id: idx })
      this.vectorizer.addDocument(this.processText(chunk))
    })
  }

  private splitDocument(content: string): string[] {
    const words = content.split(' ').filter((word) => word.length > 0)
    const chunks: string[] = []
    for (let i = 0; i < words.length; i += this.chunkSize - this.overlap) {
      chunks.push(words.slice(i, i + this.chunkSize).join(' '))
    }
    return chunks
  }

  private processText(content: string): string {
    // const words = content.split(/\s+/)
    const processedWords = natural.PorterStemmerSv.tokenizeAndStem(content)
      // We don't want to stem the word 'magello' as it is a brand name
      .filter((word) => word.toLowerCase() !== 'magello')
    // .filter((word) => !this.isStopWord(word))
    // .map((word) => this.stem(word))
    return processedWords.join(' ')
  }

  public retrieve(
    query: string,
    topK: number = 5
  ): { content: string; source: string; score: number }[] {
    if (this.documents.length === 0) {
      return []
    }

    // const queryVector = new natural.TfIdf();
    // queryVector.addDocument(query);
    const processedQuery = this.processText(query)
    console.log(
      'Processed query:',
      `'${processedQuery}'`,
      'original query:',
      `'${query}'`
    )
    const similarities: number[] = []
    this.documents.forEach((_, idx) => {
      const similarity = this.vectorizer.tfidf(processedQuery, idx)
      similarities.push(similarity)
    })

    const topIndices = similarities
      .map((similarity, idx) => ({ similarity, idx }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .filter((item) => item.similarity > 0.05)
      .map((item) => item.idx)

    const seenSources = new Set<string>()
    const results = topIndices
      .map((idx) => {
        const metadata = this.metadata[idx]
        const source = metadata.source
        if (!seenSources.has(source)) {
          console.log('Adding source:', source)
          seenSources.add(source)
          return {
            content: this.documents[idx],
            source: source,
            score: similarities[idx],
          }
        }
      })
      .filter((result) => result !== undefined) as {
      content: string
      source: string
      score: number
    }[]

    return results
  }

  // Serialize the class instance to a JSON string
  public serialize(): string {
    const jsonString = JSON.stringify({
      chunkSize: this.chunkSize,
      overlap: this.overlap,
      documents: this.documents,
      metadata: this.metadata,
      vectorizer: this.vectorizer.documents,
    })
    const buffer = Buffer.from(jsonString, 'utf-8')
    const gzippedDocuments = gzip.gzipSync(buffer).toString('base64')

    return JSON.stringify({
      data: gzippedDocuments,
    })
  }

  // Deserialize a JSON string to a class instance
  public static deserialize(json: string): DocumentRetriever {
    const jsonData = JSON.parse(json) as { data: string }

    return DocumentRetriever.fromObject(jsonData)
  }

  public static fromObject(jsonData: { data: string }): DocumentRetriever {
    const buffer = Buffer.from(jsonData.data, 'base64')
    const unzipped = gzip.gunzipSync(buffer).toString('utf-8')
    const data = JSON.parse(unzipped)

    const instance = new DocumentRetriever(data.chunkSize, data.overlap)
    instance.documents = data.documents
    instance.metadata = data.metadata
    instance.vectorizer = new natural.TfIdf()
    data.documents.forEach((doc: string) => {
      instance.vectorizer.addDocument(instance.processText(doc))
    })
    return instance
  }
}

export default DocumentRetriever
