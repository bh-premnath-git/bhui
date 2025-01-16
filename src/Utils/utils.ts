// utils.ts

export const mapFileTypeToLayoutType = (fileType: string): 'delimiter' | 'json' | 'xml' | 'xlsx' => {
    switch (fileType) {
        case 'csv':
        case 'txt':
            return 'delimiter'
        case 'json':
            return 'json'
        case 'xml':
            return 'xml'
        case 'xlsx':
            return 'xlsx'
        default:
            throw new Error(`Unsupported file type: ${fileType}`)
    }
}
