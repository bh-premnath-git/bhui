import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Loader2, AlertCircle, X, Edit2, FileUp, FileEdit, Settings, CheckCircle } from 'lucide-react'
import { parseFile, FileData, ParseOptions } from "@/Utils/fileParser"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { mapFileTypeToLayoutType } from "@/Utils/utils"
import { ApiService } from "@/services/apiServices"

const ROWS_PER_PAGE = 10

interface ColumnMetadata {
    dataType: string;
    uniqueValues: number;
    nullCount: number;
    minValue?: number | string;
    maxValue?: number | string;
}
export default function ImportDataSourceStepper(props: { closeImportSection: () => void }) {
    const [currentStep, setCurrentStep] = useState(1)
    const [file, setFile] = useState<File | null>(null)
    const [fileName, setFileName] = useState<string>("")
    const [fileData, setFileData] = useState<FileData | null>(null)
    const [headers, setHeaders] = useState<string[]>([])
    const [columnMetadata, setColumnMetadata] = useState<ColumnMetadata[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [delimiter, setDelimiter] = useState<string>(",")
    const [encoding, setEncoding] = useState<string>("UTF-8")
    const [bhProject, setBhProject] = useState<string>("option1")
    const [fileType, setFileType] = useState<string>("")
    const [sheetName, setSheetName] = useState<string>("")
    const [rootElement, setRootElement] = useState<string>("")
    const [headerRow, setHeaderRow] = useState<number>(1)
    const [repeatingElement, setRepeatingElement] = useState<string>("")
    const [repeatingElementPath, setRepeatingElementPath] = useState<string>("")

    const { closeImportSection } = props

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            setFileName(selectedFile.name)
            setFileData(null)
            setHeaders([])
            setColumnMetadata([])
            setError(null)
            setCurrentPage(1)
            const extractedFileType = selectedFile.name.split('.').pop()?.toLowerCase() || ""
            setFileType(extractedFileType)
        }
    }

    const handleImport = async () => {
        if (!file) return

        setLoading(true)
        setError(null)

        try {
            const layoutType = mapFileTypeToLayoutType(fileType)

            const options: ParseOptions = { delimiter, encoding, sheet: sheetName, layoutType, headerRow }

            if (fileType === 'xml') {
                if (repeatingElementPath) {
                    options.repeatingElementPath = repeatingElementPath
                } else {
                    options.repeatingElement = repeatingElement
                }
            }

            const data = await parseFile(file, options)
            setFileData(data)
            if (data.length > 0) {
                setHeaders(data[0])
                const metadata = buildColumnMetadata(data[0], data.slice(1))
                setColumnMetadata(metadata)
            }
            setCurrentStep(3)
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "An error occurred while parsing the file."
            )
        } finally {
            setLoading(false)
        }
    }

    const handleFileNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFileName(event.target.value)
    }

    const handleHeaderChange = (index: number, newValue: string) => {
        const newHeaders = [...headers]
        newHeaders[index] = newValue
        setHeaders(newHeaders)
    }

    const handleDelimiterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDelimiter(event.target.value)
    }

    const handleEncodingChange = (value: string) => {
        setEncoding(value)
    }

    const handleBhProjectChange = (value: string) => {
        setBhProject(value)
    }

    const handleSheetNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSheetName(event.target.value)
    }

    const handleRootElementChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRootElement(event.target.value)
    }

    const handleHeaderRowChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setHeaderRow(Number(event.target.value))
    }

    const handleRepeatingElementChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRepeatingElement(event.target.value)
    }

    const handleRepeatingElementPathChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRepeatingElementPath(event.target.value)
    }

    const buildColumnMetadata = (headers: string[], data: string[][]): ColumnMetadata[] => {
        return headers.map((header, index) => {
            const columnData = data.map(row => row[index])
            const uniqueValues = new Set(columnData).size
            const nullCount = columnData.filter(value => value === null || value === undefined || value === '').length
            const numericData = columnData.filter(value => !isNaN(Number(value)))
            const dataType = numericData.length === columnData.length ? 'number' : 'string'

            let minValue, maxValue
            if (dataType === 'number') {
                minValue = Math.min(...numericData.map(Number))
                maxValue = Math.max(...numericData.map(Number))
            } else {
                minValue = columnData.reduce((min, curr) => curr < min ? curr : min, columnData[0])
                maxValue = columnData.reduce((max, curr) => curr > max ? curr : max, columnData[0])
            }

            return {
                dataType,
                uniqueValues,
                nullCount,
                minValue,
                maxValue
            }
        })
    }

    const renderTablePreview = () => {
        if (!fileData || fileData.length === 0) {
            return <p className="text-sm text-gray-500">No data available</p>
        }

        const totalRows = fileData.length - 1
        const totalPages = Math.ceil(totalRows / ROWS_PER_PAGE)
        const startIndex = (currentPage - 1) * ROWS_PER_PAGE + 1
        const endIndex = Math.min(startIndex + ROWS_PER_PAGE, fileData.length)
        const tableRows = fileData.slice(startIndex, endIndex)

        return (
            <>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {headers.map((header, index) => (
                                <TableHead key={index}>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div
                                                    role="textbox"
                                                    aria-label={`Edit column header ${header}`}
                                                    contentEditable
                                                    suppressContentEditableWarning
                                                    onBlur={(e) => handleHeaderChange(index, e.currentTarget.textContent || '')}
                                                    className="outline-none border-b border-transparent hover:border-gray-300 focus:border-black transition-colors cursor-pointer"
                                                >
                                                    {header}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-black text-white p-2 rounded-md shadow-lg">
                                                <p className="text-sm">Data Type: {columnMetadata[index]?.dataType}</p>
                                                <p className="text-sm">Unique Values: {columnMetadata[index]?.uniqueValues}</p>
                                                <p className="text-sm">Null Count: {columnMetadata[index]?.nullCount}</p>
                                                <p className="text-sm">Min Value: {columnMetadata[index]?.minValue}</p>
                                                <p className="text-sm">Max Value: {columnMetadata[index]?.maxValue}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tableRows.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                    <TableCell key={cellIndex}>
                                        {cell !== undefined ? String(cell) : ""}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-center space-x-4">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="flex items-center"
                            aria-label="Previous Page"
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="flex items-center"
                            aria-label="Next Page"
                        >
                            Next
                        </Button>
                    </div>
                )}
            </>
        )
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900">Select File</h2>
                        <div className="space-y-4 max-w-md">
                            <div className="flex items-center space-x-2">
                                <div className="flex-grow">
                                    <Input
                                        id="file"
                                        type="file"
                                        accept=".xml,.json,.csv,.xlsx"
                                        onChange={handleFileChange}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                            {file && (
                                <div className="flex flex-col space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="flex-grow">
                                            <Label htmlFor="fileName">File Name</Label>
                                            <div className="flex items-center space-x-2">
                                                <Input
                                                    id="fileName"
                                                    value={fileName}
                                                    onChange={handleFileNameChange}
                                                    className="w-full"
                                                />
                                                <Edit2 className="h-4 w-4 text-gray-500" />
                                            </div>
                                        </div>
                                        <div className="w-1/3">
                                            <Label htmlFor="bhProject">BH Project</Label>
                                            <Select value={bhProject} onValueChange={handleBhProjectChange}>
                                                <SelectTrigger id="bhProject">
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="option1">Project 1</SelectItem>
                                                    <SelectItem value="option2">Project 2</SelectItem>
                                                    <SelectItem value="option3">Project 3</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="mt-4">
                                <Button
                                    className="bg-black hover:bg-gray-800 text-white disabled:bg-gray-300"
                                    onClick={() => setCurrentStep(2)}
                                    disabled={!file}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            case 2:
                return (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900">Setup Import Options</h2>
                        <div className="grid grid-cols-2 gap-4 max-w-md">
                            {(fileType === 'csv' || fileType === 'txt') && (
                                <div>
                                    <Label htmlFor="delimiter">Delimiter</Label>
                                    <Input
                                        id="delimiter"
                                        value={delimiter}
                                        onChange={handleDelimiterChange}
                                        className="w-full mt-1"
                                        placeholder="e.g., ','"
                                    />
                                </div>
                            )}
                            {fileType === 'xml' && (
                                <>
                                    <div>
                                        <Label htmlFor="encoding">XML Encoding</Label>
                                        <Select value={encoding} onValueChange={handleEncodingChange}>
                                            <SelectTrigger id="encoding">
                                                <SelectValue placeholder="Select encoding" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="UTF-8">UTF-8</SelectItem>
                                                <SelectItem value="ISO-8859-1">ISO-8859-1</SelectItem>
                                                <SelectItem value="UTF-16">UTF-16</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="repeatingElement">Repeating Element</Label>
                                        <Input
                                            id="repeatingElement"
                                            value={repeatingElement}
                                            onChange={handleRepeatingElementChange}
                                            placeholder="e.g., product"
                                            className="w-full mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="repeatingElementPath">Repeating Element Path (Optional)</Label>
                                        <Input
                                            id="repeatingElementPath"
                                            value={repeatingElementPath}
                                            onChange={handleRepeatingElementPathChange}
                                            placeholder="e.g., catalog.products.product"
                                            className="w-full mt-1"
                                        />
                                        <p className="text-xs text-gray-500">Specify the full path to the repeating element for nested structures.</p>
                                    </div>
                                </>
                            )}
                            {fileType === 'xlsx' && (
                                <div>
                                    <Label htmlFor="sheet">Sheet Name</Label>
                                    <Input
                                        id="sheet"
                                        value={sheetName}
                                        onChange={handleSheetNameChange}
                                        placeholder="e.g., Sheet1"
                                        className="w-full mt-1"
                                    />
                                </div>
                            )}
                            {fileType === 'json' && (
                                <>
                                    <div>
                                        <Label htmlFor="rootElement">Root Element</Label>
                                        <Input
                                            id="rootElement"
                                            value={rootElement}
                                            onChange={handleRootElementChange}
                                            placeholder="e.g., data"
                                            className="w-full mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="headerRow">Header Row</Label>
                                        <Input
                                            id="headerRow"
                                            type="number"
                                            min="1"
                                            value={headerRow}
                                            onChange={handleHeaderRowChange}
                                            placeholder="e.g., 1"
                                            className="w-full mt-1"
                                        />
                                    </div>
                                </>
                            )}
                            {fileType !== 'xml' && fileType !== 'json' && (
                                <div>
                                    <Label htmlFor="headerRow">Header Row</Label>
                                    <Input
                                        id="headerRow"
                                        type="number"
                                        min="1"
                                        value={headerRow}
                                        onChange={handleHeaderRowChange}
                                        placeholder="e.g., 1"
                                        className="w-full mt-1"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex space-x-2 mt-6">
                            <Button variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
                            <Button
                                className="bg-black hover:bg-gray-800 text-white"
                                onClick={handleImport}
                                disabled={loading}
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {loading ? "Importing..." : "Import and Preview"}
                            </Button>
                        </div>
                    </div>
                )
            case 3:
                return (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900">Preview and Edit</h2>
                        <div className="overflow-x-auto">
                            {renderTablePreview()}
                        </div>
                        <div className="flex space-x-2">
                            <Button variant="outline" onClick={() => setCurrentStep(2)}>Back</Button>
                            <Button onClick={() => setCurrentStep(4)} className="bg-black hover:bg-gray-800 text-white">Next</Button>
                        </div>
                    </div>
                )
            case 4:
                return (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900">Confirm and Import</h2>
                        <div>
                            <p><strong>File Name:</strong> {fileName}</p>
                            {(fileType === 'csv' || fileType === 'txt') && (
                                <p><strong>Delimiter:</strong> {delimiter}</p>
                            )}
                            {fileType === 'xml' && (
                                <>
                                    <p><strong>Encoding:</strong> {encoding}</p>
                                    <p><strong>Repeating Element:</strong> {repeatingElement || repeatingElementPath}</p>
                                </>
                            )}
                            {fileType === 'xlsx' && (
                                <p><strong>Sheet Name:</strong> {sheetName}</p>
                            )}
                            {fileType === 'json' && (
                                <p><strong>Root Element:</strong> {rootElement}</p>
                            )}
                            {fileType !== 'xml' && fileType !== 'json' && (
                                <p><strong>Header Row:</strong> {headerRow}</p>
                            )}
                            <p><strong>Number of Columns:</strong> {headers.length}</p>
                            <p><strong>Number of Rows:</strong> {fileData ? fileData.length - 1 : 0}</p>
                        </div>
                        <div className="flex space-x-2">
                            <Button variant="outline" onClick={() => setCurrentStep(3)}>Back</Button>
                            <Button onClick={() => {
                                console.log("Data imported successfully")
                                closeImportSection()
                            }} className="bg-black hover:bg-gray-800 text-white">
                                Confirm Import
                            </Button>
                        </div>
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <Card className="w-full max-w-6xl mx-auto">
            <CardHeader className="relative">
                <CardTitle>Import Data Source</CardTitle>
                <CardDescription>
                    Import and preview XML, JSON, CSV, or XLSX files
                </CardDescription>
                <div className="absolute top-4 right-4">
                    <Button variant="ghost" size="icon" aria-label="Close"
                        onClick={() => closeImportSection()}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-8">
                    <ol className="flex items-center w-full space-x-2 sm:space-x-4">
                        {[
                            { step: 1, title: "Select File", icon: FileUp },
                            { step: 2, title: "Setup Import Options", icon: Settings },
                            { step: 3, title: "Preview and Edit", icon: FileEdit },
                            { step: 4, title: "Confirm", icon: CheckCircle },
                        ].map(({ step, title, icon: Icon }) => (
                            <li key={step} className={`flex items-center ${currentStep > step ? 'text-green-600' : 'text-gray-500'
                                } space-x-2 sm:space-x-3`}>
                                <span className={`flex items-center justify-center w-8 h-8 border-2 rounded-full ${currentStep > step ? 'border-green-600 bg-green-50' :
                                    currentStep === step ? 'border-black bg-black text-white' : 'border-gray-500'
                                    }`}>
                                    <Icon className="w-4 h-4" />
                                </span>
                                <span className="hidden sm:inline-block text-sm font-medium">{title}</span>
                                {step < 4 && (
                                    <span className="hidden sm:inline-block flex-grow h-px bg-gray-200" />
                                )}
                            </li>
                        ))}
                    </ol>
                </div>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {renderStepContent()}
            </CardContent>
        </Card>
    )
}
