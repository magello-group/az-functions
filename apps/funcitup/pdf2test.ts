/* eslint-disable */

import pdf = require('pdf-parse')
import { promises as fs } from 'fs'
import path = require('path')
import DocumentRetriever from './src/documents/DocumentRetriever'
import { htmlToText } from 'html-to-text'
import * as natural from 'natural'

// Custom render_page function to add page breaks
function render_page(pageData: any) {
  let render_options = {
    normalizeWhitespace: false,
    disableCombineTextItems: false,
  }

  return pageData.getTextContent(render_options).then(function (
    textContent: any
  ) {
    let lastY,
      text = ''
    for (let item of textContent.items) {
      if (lastY == item.transform[5] || !lastY) {
        text += item.str
      } else {
        text += '\n' + item.str
      }
      lastY = item.transform[5]
    }
    // Add a page break marker at the end of each page
    text += '\n--- PAGE BREAK ---\n'
    return text
  })
}

let options = {
  pagerender: render_page,
}

function pdf2test(filePath: string): Promise<string> {
  return fs.readFile(filePath).then((buffer: Buffer) => {
    return pdf(buffer, options).then((data: any) => {
      // Process the extracted text to remove double empty lines
      let text = data.text
      text = text.replace(/\n\s*\n\s*\n/g, '\n\n') // Replace multiple empty lines with a single empty line
      return text
    })
  })
}

async function convertAllPdfsInDirectory(directoryPath: string) {
  const files = await fs.readdir(directoryPath)
  const pdfFiles = files.filter(
    (file) => path.extname(file).toLowerCase() === '.pdf'
  )
  // const doc = new DocumentRetriever(200, 50)
  await Promise.all(
    pdfFiles.map(async (pdfFile) => {
      const pdfFilePath = path.join(directoryPath, pdfFile)
      const text = await pdf2test(pdfFilePath)
      // doc.addDocument(text, pdfFilePath)
      return await fs.writeFile(
        path.join(directoryPath, '../', 'txt', path.basename(pdfFilePath)) +
          '.txt',
        text.trim()
      )
    })
  )
}

async function convertAllHtmlFilesInDirectory(directoryPath: string) {
  const urls = [
    'https://magello.se/om-oss/',
    'https://magello.se/ramavtal/',
    'https://magello.se/case/poster/ica/',
    'https://magello.se/insikter/event/',
    'https://jobb.magello.se/people',
    'https://jobb.magello.se/',
    'https://jobb.magello.se/departments/cloud',
    'https://jobb.magello.se/departments/digitala-tjanster',
    'https://jobb.magello.se/departments/integration',
  ]

  const htmlPromises = urls.map(async (url) => {
    console.log('Fetching:', url)
    const response = await fetch(url)
    const html = await response.text()
    let text = htmlToText(html, {
      selectors: [
        { selector: 'nav', format: 'skip' },
        { selector: 'img', format: 'skip' },
        { selector: 'dialog', format: 'skip' },
        { selector: 'footer', format: 'skip' },
        { selector: 'a', options: { ignoreHref: true } },
      ],
    })
    text = text.replace(/\n\s*\n\s*\n/g, '\n\n') // Replace multiple empty lines with a single empty line
    console.log(
      'trying:',
      path.join(directoryPath, path.basename(url)) + '.txt'
    )
    return await fs.writeFile(
      path.join(directoryPath, path.basename(url)) + '.txt',
      text.trim()
    )
  })
  await Promise.all(htmlPromises)
}

async function addAllTxtFiles(directoryPath: string) {
  const files = await fs.readdir(directoryPath)
  const txtFiles = files.filter(
    (file) => path.extname(file).toLowerCase() === '.txt'
  )
  const doc = new DocumentRetriever(200, 50)
  const txtPromises = txtFiles.map(async (txtFile) => {
    const txtFilePath = path.join(directoryPath, txtFile)
    const text = await fs.readFile(txtFilePath, 'utf-8')
    doc.addDocument(text, txtFilePath)
  })
  await Promise.all(txtPromises)

  const jsonFilepath = path.join('src/documents', 'documents.json')
  await fs.writeFile(jsonFilepath, doc.serialize())
  const question = 'Har magello kollektivavtal??'
  console.log(
    '======HELLO=======',
    natural.PorterStemmerSv.tokenizeAndStem(question)
  )
  console.log('Question:', question)
  doc.retrieve(question, 5).forEach((result) => {
    console.log('Source:', result.source)
    console.log('Matched:', result.content)
    console.log('Score:', result.score)
  })
  return doc
}

// convertAllHtmlFilesInDirectory('./files/txt')
//   .then(() => convertAllPdfsInDirectory('./files/pdf'))
//   .then(() => addAllTxtFiles('./files/txt'))
//   .catch(console.error)

addAllTxtFiles('./files/txt').catch(console.error)
