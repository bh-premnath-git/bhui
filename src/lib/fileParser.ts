// fileParser.ts

import { parseString as parseXml } from 'xml2js';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';

export type FileData = string[][];

export interface ParseOptions {
  layoutType?: 'delimiter' | 'json' | 'xml' | 'xlsx';
  delimiter?: string;
  quoteChar?: string;
  encoding?: string;
  sheet?: string;
  rootElement?: string;
  headerRow?: number;
  repeatingElement?: string;
  repeatingElementPath?: string;
}

export async function parseFile(file: File, options: ParseOptions = {}): Promise<FileData> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  let { layoutType, delimiter = ',', quoteChar = '"', encoding = 'UTF-8', sheet, rootElement, headerRow, repeatingElement, repeatingElementPath } = options;

  // Infer layoutType if not explicitly provided
  if (!layoutType) {
    switch (ext) {
      case 'xml':
        layoutType = 'xml';
        break;
      case 'json':
        layoutType = 'json';
        break;
      case 'csv':
      case 'tsv':
      case 'txt':
        layoutType = 'delimiter';
        break;
      case 'xls':
      case 'xlsx':
        layoutType = 'xlsx';
        break;
      default:
        throw new Error(`Cannot infer layout type from file extension ".${ext}". Please specify "layoutType" in options.`);
    }
  }

  switch (layoutType) {
    case 'xml':
      const path = repeatingElementPath || repeatingElement;
      if (!path) {
        throw new Error('For XML layout, "repeatingElement" or "repeatingElementPath" option must be specified.');
      }
      const xmlContent = await readFileAsText(file, encoding);
      return parseXmlContent(xmlContent, path);

    case 'json':
      const jsonContent = await readFileAsText(file, encoding);
      return parseJsonContent(jsonContent, rootElement);

    case 'delimiter':
      const textContent = await readFileAsText(file, encoding);
      return parseCsvContent(textContent, delimiter, quoteChar, headerRow);

    case 'xlsx':
      return parseXlsxContent(file, sheet);

    default:
      throw new Error(`Unsupported layoutType "${layoutType}".`);
  }
}

function readFileAsText(file: File, encoding: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Failed to read file "${file.name}" as text.`));
    reader.readAsText(file, encoding);
  });
}

async function parseXmlContent(content: string, repeatingPath: string): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    parseXml(content, { explicitArray: true, mergeAttrs: true }, (err, result) => {
      if (err) {
        return reject(err);
      }
      const records = extractRecords(result, repeatingPath);
      if (!records || records.length === 0) {
        return reject(new Error(`No records found at path "${repeatingPath}".`));
      }
      const flat = records.map(r => flattenObject(r));
      const headers = Array.from(new Set(flat.flatMap(obj => Object.keys(obj))));
      const rows = flat.map(obj => headers.map(h => obj[h] ?? ''));
      resolve([headers, ...rows]);
    });
  });
}

function extractRecords(obj: any, path: string): any[] {
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current[key] !== undefined) {
      current = current[key];
    } else {
      return [];
    }
  }
  return Array.isArray(current) ? current : [current];
}

function flattenObject(obj: any, prefix = ''): Record<string, string> {
  let result: Record<string, string> = {};
  for (const key in obj) {
    const val = obj[key];
    const pref = prefix ? `${prefix}${key}` : key;
    if (Array.isArray(val)) {
      if (val.length === 1) {
        const first = val[0];
        if (typeof first === 'object' && first !== null) {
          Object.assign(result, flattenObject(first, `${pref}.`));
        } else {
          result[pref] = String(first);
        }
      } else {
        result[pref] = val.map(String).join(', ');
      }
    } else if (val !== null && typeof val === 'object') {
      Object.assign(result, flattenObject(val, `${pref}.`));
    } else {
      result[pref] = String(val);
    }
  }
  return result;
}

function parseJsonContent(content: string, rootElement?: string): string[][] {
  let data: any = JSON.parse(content);
  if (rootElement) {
    data = data[rootElement];
  }
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return [];
    }
    if (data.every(item => typeof item === 'object' && !Array.isArray(item))) {
      const headers = Array.from(new Set(data.flatMap(item => Object.keys(item))));
      const rows = data.map(item => headers.map(h => String(item[h] ?? '')));
      return [headers, ...rows];
    } else if (data.every(item => !Array.isArray(item))) {
      return [['Value'], ...data.map(v => [String(v)])];
    }
  }
  const flat = flattenObject(data);
  return [Object.keys(flat), Object.values(flat)];
}

function parseCsvContent(content: string, delimiter: string, quoteChar: string, headerRow: number = 1): string[][] {
  const res = Papa.parse<string[]>(content, {
    delimiter,
    quoteChar,
    header: false,
    skipEmptyLines: true,
    transformHeader: h => h.trim(),
    transform: v => v.trim(),
  });
  if (res.errors.length) {
    throw new Error(res.errors.map(e => e.message).join('; '));
  }
  const data = res.data as string[][];
  if (headerRow < 1 || headerRow > data.length) {
    throw new Error(`headerRow ${headerRow} is out of range (1-${data.length}).`);
  }
  const headers = data[headerRow - 1];
  const rows = data.slice(headerRow);
  return [headers.map(h => String(h)), ...rows.map(r => r.map(c => String(c)))];
}

async function parseXlsxContent(file: File, sheetName?: string): Promise<string[][]> {
  const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error(`Failed to read file "${file.name}" as array buffer.`));
    reader.readAsArrayBuffer(file);
  });
  const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
  const sheet = sheetName ?? workbook.SheetNames[0];
  if (!workbook.SheetNames.includes(sheet)) {
    throw new Error(`Sheet "${sheet}" not found. Available sheets: ${workbook.SheetNames.join(', ')}`);
  }
  const worksheet = workbook.Sheets[sheet];
  const jsonData = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1, defval: '' });
  return jsonData.map(row => row.map(cell => String(cell)));
}
