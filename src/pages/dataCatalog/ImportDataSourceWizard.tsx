import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Loader2,
    AlertCircle,
    X,
    Edit2,
    FileUp,
    FileEdit,
    Settings,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    BarChart2,
    ChevronsLeftRightEllipsis,
} from "lucide-react";
import { parseFile, FileData, ParseOptions } from "@/utils/fileParser";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { mapFileTypeToLayoutType } from "@/utils/utils";
import { ApiService } from "@/services/apiServices";
import { Modal } from "@/components/ui/modal";
import { Histogram } from "@/components/ui/Histogram";
import { getCodesValue } from "@/redux/BuildPipeLineSlice";
import { useAppDispatch } from "@/redux/hooks";

const ROWS_PER_PAGE = 10;

interface ColumnMetadata {
    dataType: string;
    uniqueValues: number;
    nullCount: number;
    minValue?: number | string;
    maxValue?: number | string;
}

export default function ImportDataSourceStepper(props: { gitProjectList: any; closeImportSection: () => void }) {
    const dispatch = useAppDispatch()
    const [currentStep, setCurrentStep] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string>("");
    const [fileData, setFileData] = useState<FileData | null>(null);
    const [headers, setHeaders] = useState<string[]>([]);
    const [columnMetadata, setColumnMetadata] = useState<ColumnMetadata[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [delimiter, setDelimiter] = useState<string>(",");
    const [encoding, setEncoding] = useState<string>("UTF-8");
    const [bhProject, setBhProject] = useState<string>("");
    const [fileType, setFileType] = useState<string>("");
    const [sheetName, setSheetName] = useState<string>("");
    const [rootElement, setRootElement] = useState<string>("");
    const [headerRow, setHeaderRow] = useState<number>(1);
    const [repeatingElement, setRepeatingElement] = useState<string>("");
    const [repeatingElementPath, setRepeatingElementPath] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedColumnIndex, setSelectedColumnIndex] = useState<number | null>(null);
    const [dataTypes, setDataTypes] = useState<any>(null);
    const [layoutFormatsTypes, setLayoutFormatsTypes] = useState<any>(null);
    const [delimiterTypes, setDelimiterTypes] = useState<any>(null);
    const [encodingTypes, setEncodingTypes] = useState<any>(null);
    const [quoteTypes, setQuoteTypes] = useState<any>(null);
    const [escapeTypes, setEscapeTypes] = useState<any>(null);


    const { closeImportSection } = props;

    const handleTypeChange = useCallback(async (value: string) => {
        return await dispatch(getCodesValue({ value }));
    }, [dispatch]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const typeCodesAndSetters: { code: string; setter: React.Dispatch<React.SetStateAction<any>> }[] = [
                    { code: "13", setter: setDataTypes },
                    { code: "16", setter: setLayoutFormatsTypes },
                    { code: "17", setter: setDelimiterTypes },
                    { code: "18", setter: setEncodingTypes },
                    { code: "19", setter: setQuoteTypes },
                    { code: "20", setter: setEscapeTypes },
                ];

                const fetchPromises = typeCodesAndSetters.map(({ code }) => handleTypeChange(code));

                const results = await Promise.all(fetchPromises);

                results.forEach((res, index) => {
                    if (res && res.payload && res.payload.codes_dtl) {
                        typeCodesAndSetters[index].setter(res.payload.codes_dtl);
                    } else {
                        console.warn(`Invalid response for code ${typeCodesAndSetters[index].code}`);
                    }
                });
            } catch (error) {
                console.error("Error fetching type data:", error);
                setError("Failed to fetch type data. Please try again later.");
            }
        };

        fetchData();
    }, [handleTypeChange]);

    console.log(dataTypes, layoutFormatsTypes, delimiterTypes, encodingTypes, quoteTypes, escapeTypes);



    const createDataSource = async (data: any) => {
        try {
            return await ApiService('8011', 'post', '/data_source', data);
        } catch (error) {
            console.error("Error creating data source:", error);
            return null
        }
    }

    const createDataSourceLayout = async (data: any) => {
        try {
            return await ApiService('8011', 'post', '/data_source_layout', data);

        } catch (error) {
            console.error("Error creating data source layout:", error);
            return null
        }
    }

    const createLayoutFields = async (data: any) => {
        try {
            return await ApiService('8011', 'post', '/layout_fields/bulk', data);
        } catch (error) {
            console.error("Error creating layout fields:", error);
            return null
        }
    }
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFileName(selectedFile.name);
            setFileData(null);
            setHeaders([]);
            setColumnMetadata([]);
            setError(null);
            setCurrentPage(1);
            const extractedFileType = selectedFile.name.split('.').pop()?.toLowerCase() || "";
            setFileType(extractedFileType);
        }
    };

    const handleImport = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            const layoutType = mapFileTypeToLayoutType(fileType);

            const options: ParseOptions = { delimiter, encoding, sheet: sheetName, layoutType, headerRow };

            if (fileType === 'xml') {
                if (repeatingElementPath) {
                    options.repeatingElementPath = repeatingElementPath;
                } else {
                    options.repeatingElement = repeatingElement;
                }
            }

            const data = await parseFile(file, options);
            setFileData(data);
            if (data.length > 0) {
                setHeaders(data[0]);
                const metadata = buildColumnMetadata(data[0], data.slice(1));
                setColumnMetadata(metadata);
            }
            setCurrentStep(3);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "An error occurred while parsing the file."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleFileNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFileName(event.target.value);
    };

    const handleHeaderChange = (index: number, newValue: string) => {
        const newHeaders = [...headers];
        newHeaders[index] = newValue;
        setHeaders(newHeaders);
    };

    const handleDelimiterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDelimiter(event.target.value);
    };

    const handleEncodingChange = (value: string) => {
        setEncoding(value);
    };

    const handleBhProjectChange = (value: string) => {
        setBhProject(value);
    };

    const handleSheetNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSheetName(event.target.value);
    };

    const handleRootElementChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRootElement(event.target.value);
    };

    const handleHeaderRowChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setHeaderRow(Number(event.target.value));
    };

    const handleRepeatingElementChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRepeatingElement(event.target.value);
    };

    const handleRepeatingElementPathChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRepeatingElementPath(event.target.value);
    };

    const buildColumnMetadata = (headers: string[], data: string[][]): ColumnMetadata[] => {
        return headers.map((header, index) => {
            const columnData = data.map(row => row[index]);
            const uniqueValues = new Set(columnData).size;
            const nullCount = columnData.filter(value => value === null || value === undefined || value === '').length;
            const numericData = columnData.filter(value => !isNaN(Number(value)));
            const dataType = numericData.length === columnData.length ? 'number' : 'string';

            let minValue, maxValue;
            if (dataType === 'number') {
                minValue = Math.min(...numericData.map(Number));
                maxValue = Math.max(...numericData.map(Number));
            } else {
                minValue = columnData.reduce((min, curr) => curr < min ? curr : min, columnData[0]);
                maxValue = columnData.reduce((max, curr) => curr > max ? curr : max, columnData[0]);
            }

            return {
                dataType,
                uniqueValues,
                nullCount,
                minValue,
                maxValue
            };
        });
    };

    const handleHistogramClick = (columnIndex: number) => {
        setSelectedColumnIndex(columnIndex);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedColumnIndex(null);
    };

    const importSection = () => {

    }

    const generateHistogramData = (columnIndex: number): { name: string; value: number }[] => {
        if (!fileData) return [];

        const data = fileData.slice(1).map(row => row[columnIndex]);

        const frequencyMap: { [key: string]: number } = {};

        data.forEach(value => {
            const key = value || 'Null';
            frequencyMap[key] = (frequencyMap[key] || 0) + 1;
        });

        const sortedKeys = Object.keys(frequencyMap).sort();

        return sortedKeys.map(key => ({ name: key, value: frequencyMap[key] }));
    };

    const renderTablePreview = () => {
        if (!fileData || fileData.length === 0) {
            return <p className="text-sm text-gray-500">No data available</p>;
        }

        const totalRows = fileData.length - 1;
        const totalPages = Math.ceil(totalRows / ROWS_PER_PAGE);
        const startIndex = (currentPage - 1) * ROWS_PER_PAGE + 1;
        const endIndex = Math.min(startIndex + ROWS_PER_PAGE, fileData.length);
        const tableRows = fileData.slice(startIndex, endIndex);

        return (
            <>
                <Table className="min-w-full table-auto">
                    <TableHeader>
                        <TableRow>
                            {headers.map((header, index) => (
                                <TableHead key={index} className="px-4 py-2 border-b">
                                    <div className="flex items-center space-x-2">
                                        <div
                                            role="textbox"
                                            aria-label={`Edit column header ${header}`}
                                            contentEditable
                                            suppressContentEditableWarning
                                            onBlur={(e) => handleHeaderChange(index, e.currentTarget.textContent || '')}
                                            className="outline-none border-b border-transparent hover:border-gray-400 focus:border-gray-600 transition-colors cursor-pointer"
                                        >
                                            {header}
                                        </div>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label="Expand column"
                                                        className="p-1"
                                                    >
                                                        <ChevronsLeftRightEllipsis className="h-4 w-4 text-gray-600" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-gray-900 text-white p-2 rounded-md shadow-lg">
                                                    <p className="text-sm">Data Type: {columnMetadata[index]?.dataType}</p>
                                                    <p className="text-sm">Unique Values: {columnMetadata[index]?.uniqueValues}</p>
                                                    <p className="text-sm">Null Count: {columnMetadata[index]?.nullCount}</p>
                                                    <p className="text-sm">Min Value: {columnMetadata[index]?.minValue}</p>
                                                    <p className="text-sm">Max Value: {columnMetadata[index]?.maxValue}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`View histogram for ${header}`}
                                            onClick={() => handleHistogramClick(index)}
                                            className="p-1"
                                        >
                                            <BarChart2 className="h-4 w-4 text-gray-600" />
                                        </Button>
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tableRows.map((row, rowIndex) => (
                            <TableRow key={rowIndex} className={rowIndex % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                                {row.map((cell, cellIndex) => (
                                    <TableCell key={cellIndex} className="px-4 py-2 border-b">
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
                            <ChevronLeft className="h-4 w-4 mr-1" />
                        </Button>
                        <span className="text-sm text-gray-600">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="flex items-center"
                            aria-label="Next Page"
                        >
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                )}
            </>
        );
    };
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
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
                                        aria-label="Select file to import"
                                    />
                                </div>
                            </div>
                            {file && (
                                <div className="flex flex-col space-y-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-grow">
                                            <Label htmlFor="fileName">File Name</Label>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <Input
                                                    id="fileName"
                                                    value={fileName}
                                                    onChange={handleFileNameChange}
                                                    className="w-full"
                                                    placeholder="Enter file name"
                                                    aria-label="Edit file name"
                                                />
                                                <Edit2 className="h-4 w-4 text-gray-500" aria-hidden="true" />
                                            </div>
                                        </div>
                                        <div className="w-1/3">
                                            <Label htmlFor="bhProject">BH Project</Label>
                                            <Select value={bhProject} onValueChange={handleBhProjectChange} aria-label="Select BH Project">
                                                <SelectTrigger id="bhProject">
                                                    <SelectValue placeholder="Select a project" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {props.gitProjectList && props.gitProjectList.length > 0 ? (
                                                        props.gitProjectList.map((project: any) => (
                                                            <SelectItem key={project.ProjectId} value={project.ProjectId.toString()}>
                                                                {project.Project_Name}
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <SelectItem value="" disabled>
                                                            No projects available
                                                        </SelectItem>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <Button
                                className="bg-black hover:bg-gray-800 text-white disabled:bg-gray-400"
                                onClick={() => setCurrentStep(2)}
                                disabled={!file || !bhProject}
                                aria-label="Proceed to Setup Import Options"
                            >
                                Next <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Setup Import Options</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg">
                            {(fileType === 'csv' || fileType === 'txt') && (
                                <div>
                                    <Label htmlFor="delimiter">Delimiter</Label>
                                    <Input
                                        id="delimiter"
                                        value={delimiter}
                                        onChange={handleDelimiterChange}
                                        className="w-full mt-1"
                                        placeholder="e.g., ','"
                                        aria-label="Set delimiter"
                                    />
                                </div>
                            )}
                            {fileType === 'xml' && (
                                <>
                                    <div>
                                        <Label htmlFor="encoding">XML Encoding</Label>
                                        <Select value={encoding} onValueChange={handleEncodingChange} aria-label="Select XML Encoding">
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
                                            aria-label="Set repeating element"
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
                                            aria-label="Set repeating element path"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Specify the full path to the repeating element for nested structures.
                                        </p>
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
                                        aria-label="Set sheet name"
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
                                            aria-label="Set root element"
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
                                            aria-label="Set header row"
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
                                        aria-label="Set header row"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentStep(1)}
                                aria-label="Go Back to Select File"
                                className="text-black border-gray-400 hover:bg-gray-100"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" /> Back
                            </Button>
                            <Button
                                className={`bg-black hover:bg-gray-800 text-white flex items-center ${loading ? "cursor-not-allowed opacity-50" : ""
                                    }`}
                                onClick={handleImport}
                                disabled={loading}
                                aria-label="Import and Preview"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Importing...
                                    </>
                                ) : (
                                    <>
                                        Import <ChevronRight className="h-4 w-4 ml-1" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Preview and Edit</h2>
                        <div className="overflow-x-auto">
                            {renderTablePreview()}
                        </div>
                        <div className="flex justify-between">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentStep(2)}
                                aria-label="Go Back to Setup Import Options"
                                className="text-black border-gray-400 hover:bg-gray-100"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" /> Back
                            </Button>
                            <Button
                                className="bg-black hover:bg-gray-800 text-white"
                                onClick={() => setCurrentStep(4)}
                                aria-label="Proceed to Confirm Import"
                            >
                                Next <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Confirm and Import</h2>
                        <div className="space-y-2">
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
                        <div className="flex justify-between">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentStep(3)}
                                aria-label="Go Back to Preview and Edit"
                                className="text-black border-gray-400 hover:bg-gray-100"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" /> Back
                            </Button>
                            <Button
                                onClick={() => {
                                    console.log("Data imported successfully");
                                    importSection();
                                }}
                                className="bg-black hover:bg-gray-800 text-white flex items-center"
                                aria-label="Confirm and Import Data"
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Confirm Import
                            </Button>
                        </div>
                    </div>
                );
            default:
                return null;
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
                        className="text-black hover:bg-gray-100"
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
                            <li key={step} className={`flex items-center ${currentStep > step ? 'text-gray-700' : currentStep === step ? 'text-gray-900' : 'text-gray-500'
                                } space-x-2 sm:space-x-3`}>
                                <span className={`flex items-center justify-center w-8 h-8 border-2 rounded-full ${currentStep > step ? 'border-gray-700 bg-gray-300' :
                                    currentStep === step ? 'border-black bg-black text-white' : 'border-gray-500'
                                    }`}>
                                    <Icon className="w-4 h-4" />
                                </span>
                                <span className="hidden sm:inline-block text-sm font-medium">{title}</span>
                                {step < 4 && (
                                    <span className="hidden sm:inline-block flex-grow h-px bg-gray-300" />
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
            <Modal isOpen={isModalOpen}>
                <Modal.Header>
                    <h2 className="text-lg font-semibold">
                        {selectedColumnIndex !== null ? `Histogram for ${headers[selectedColumnIndex]}` : 'Histogram'}
                    </h2>
                </Modal.Header>
                <Modal.Body>
                    {selectedColumnIndex !== null ? (
                        <Histogram
                            data={generateHistogramData(selectedColumnIndex)}
                            title={headers[selectedColumnIndex]}
                        />
                    ) : (
                        <p>No column selected.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button className="bg-black hover:bg-gray-800 text-white" onClick={closeModal} aria-label="Close Histogram Modal">
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </Card>
    );
}
