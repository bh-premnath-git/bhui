// fileParser.ts

import { parseString as parseXml } from 'xml2js'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export type FileData = string[][]

export interface ParseOptions {
  layoutType?: 'delimiter' | 'json' | 'xml' | 'xlsx'
  delimiter?: string
  quoteChar?: string
  encoding?: string
  sheet?: string
  rootElement?: string
  headerRow?: number
  repeatingElement?: string
  repeatingElementPath?: string
}

export async function parseFile(file: File, options: ParseOptions = {}): Promise<FileData> {
  const fileType = file.name.split('.').pop()?.toLowerCase()
  const { layoutType, delimiter = ',', quoteChar = '"', encoding = 'UTF-8', sheet, repeatingElement, repeatingElementPath } = options

  switch (layoutType) {
    case 'xml':
      if (!repeatingElement && !repeatingElementPath) {
        throw new Error('Repeating element or path must be specified for XML files.')
      }
      return parseXmlContent(await readFileContent(file, encoding), repeatingElement || repeatingElementPath)
    case 'json':
      return parseJsonContent(await readFileContent(file, encoding), options.rootElement, options.headerRow)
    case 'delimiter':
      return parseCsvContent(await readFileContent(file, encoding), delimiter, quoteChar, options.headerRow)
    case 'xlsx':
      return parseXlsxContent(file, sheet)
    default:
      throw new Error('Unsupported or incorrect layout type.')
  }
}

function readFileContent(file: File, encoding: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => resolve(event.target?.result as string)
    reader.onerror = (error) => reject(error)
    reader.readAsText(file, encoding)
  })
}

async function parseXmlContent(content: string, repeatingElementPath: string): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    parseXml(content, { explicitArray: true, mergeAttrs: true }, (err, result) => {
      if (err) {
        reject(err)
      } else {
        const records = extractRecords(result, repeatingElementPath)
        if (!records || records.length === 0) {
          reject(new Error(`No records found for the repeating element path "${repeatingElementPath}".`))
          return
        }

        const flattenedRecords = records.map(record => flattenObject(record))

        const headers = Array.from(new Set(flattenedRecords.flatMap(record => Object.keys(record))))

        const rows = flattenedRecords.map(record => headers.map(header => record[header] || ""))

        resolve([headers, ...rows])
      }
    })
  })
}

function extractRecords(obj: any, path: string): any[] {
  const keys = path.split('.')
  let current = obj

  for (const key of keys) {
    if (current[key]) {
      current = current[key]
    } else {
      return []
    }
  }

  if (Array.isArray(current)) {
    return current
  } else {
    return [current]
  }
}

function flattenObject(obj: any, prefix = ''): Record<string, string> {
  let acc: Record<string, string> = {}

  for (const key in obj) {
    if (key === '$') {
      // Attributes
      for (const attr in obj[key]) {
        acc[`${prefix}@${attr}`] = String(obj[key][attr])
      }
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      acc = { ...acc, ...flattenObject(obj[key], `${prefix}${key}.`) }
    } else {
      acc[`${prefix}${key}`] = String(obj[key])
    }
  }

  return acc
}

function parseJsonContent(content: string, rootElement?: string, headerRow?: number): string[][] {
  let parsed = JSON.parse(content)
  if (rootElement) {
    parsed = parsed[rootElement]
  }

  if (Array.isArray(parsed)) {
    if (parsed.length > 0 && typeof parsed[0] === 'object') {
      const headers = Object.keys(parsed[0])
      const rows = parsed.map(obj => headers.map(header => String(obj[header] ?? '')))
      return [headers, ...rows]
    }
    return [['Value'], ...parsed.map(value => [String(value)])]
  }

  const flattened = flattenObject(parsed)
  return [Object.keys(flattened), Object.values(flattened).map(String)]
}

function parseCsvContent(content: string, delimiter: string, quoteChar: string, headerRow: number = 1): string[][] {
  debugger
  const result = Papa.parse(content, { 
    delimiter, 
    quoteChar,
    header: false,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
    transform: (value) => value.trim()
  })
  if (result.errors.length) {
    throw new Error(result.errors.map(e => e.message).join(', '))
  }
  const data = result.data as string[][]
  if (headerRow > data.length) {
    throw new Error(`Header row ${headerRow} exceeds total number of rows ${data.length}.`)
  }
  const headers = data[headerRow - 1]
  const rows = data.slice(headerRow)
  return [headers, ...rows]
}

async function parseXlsxContent(file: File, sheet?: string): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        
        const sheetNameToUse = sheet || workbook.SheetNames[0]
        if (!workbook.SheetNames.includes(sheetNameToUse)) {
          throw new Error(`Sheet "${sheetNameToUse}" not found in the workbook`)
        }
        
        const worksheet = workbook.Sheets[sheetNameToUse]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" })
        resolve(jsonData.map((row: any) => row.map(String)))
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = (error) => reject(error)
    reader.readAsArrayBuffer(file)
  })
}
