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
    TableIcon,
    ColumnsIcon,
    DatabaseIcon,
    DownloadIcon,
} from "lucide-react";
import { parseFile, FileData, ParseOptions } from "@/lib/fileParser";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getConnectionConfigList } from "@/store/slices/dataCatalog/datasourceSlice";
import { mapFileTypeToLayoutType } from "@/lib/utils";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogFooter, 
    DialogTitle 
} from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { CATALOG_REMOTE_API_URL } from "@/config/platformenv";
import { getCodesValue } from "@/store/slices/designer/buildPipeLine/BuildPipeLineSlice";
import { apiService } from "@/lib/api/api-service";
import { Histogram } from "@/components/ui/Histogram";
import { useQueryClient } from "@tanstack/react-query";

const ROWS_PER_PAGE = 10;

interface ColumnMetadata {
    dataType: string;
    uniqueValues: number;
    nullCount: number;
    minValue?: number | string;
    maxValue?: number | string;
}

export default function ImportDataSourceStepper(props: { gitProjectList: any; closeImportSection: () => void; onRefetch?: () => void }) {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()
    const [currentStep, setCurrentStep] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string>("");
    const [fileData, setFileData] = useState<FileData | null>(null);
    const [headers, setHeaders] = useState<string[]>([]);
    const [columnMetadata, setColumnMetadata] = useState<ColumnMetadata[]>([]);
    const [loading, setLoading] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [delimiter, setDelimiter] = useState<string>(",");
    const [encoding, setEncoding] = useState<string>("UTF-8");
    const [bhProject, setBhProject] = useState<string>("");
    const [bhConnection, setBhConnection] = useState<string>("");
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
const {connectionConfigList} = useAppSelector((state) => state.datasource);
console.log(props.gitProjectList)
    const { closeImportSection, onRefetch } = props;

    const handleTypeChange = useCallback(async (value: string) => {
        return await dispatch(getCodesValue({ value }));
    }, [dispatch]);

    useEffect(() => {
        dispatch(getConnectionConfigList({offset: 0, limit: 1000,connection_type:'source'}));
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
            return await apiService.post({
                url: '/data_source/',
                data: data,
                usePrefix: true,
                baseUrl: CATALOG_REMOTE_API_URL,
                method: 'POST'
            });
        } catch (error) {
            console.error("Error creating data source:", error);
            return null
        }
    }

    const createDataSourceLayout = async (data: any) => {
        try {
            return await apiService.post({
                url: '/data_source_layout/',
                data: data,
                usePrefix: true,
                baseUrl: CATALOG_REMOTE_API_URL,
                method: 'POST'
            });

        } catch (error) {
            console.error("Error creating data source layout:", error);
            return null
        }
    }

    const createLayoutFields = async (data: any) => {
        try {
            return await apiService.post({
                url: '/layout_fields/bulk/',
                data: data,
                usePrefix: true,
                baseUrl: CATALOG_REMOTE_API_URL,
                method: 'POST'
            });
        } catch (error) {
            console.error("Error creating layout fields:", error);
            return null
        }
    }

    const getDataSourceList = async () => {
        try {
            return await apiService.get({
                url: '/data_source/list',
                usePrefix: true,
                baseUrl: CATALOG_REMOTE_API_URL,
            });
        } catch (error) {
            console.error("Error fetching data source list:", error);
            return null;
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

    const handleBhConnectionChange = (value: string) => {
        setBhConnection(value);
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

    const importSection = async () => {
        setImportLoading(true);
        setError(null);
        try {
            // First API call - Create Data Source 
            console.log(bhConnection)
            const connection_type = connectionConfigList.find((config: any) => config.id?.toString() === bhConnection.toString())?.custom_metadata;

            const dataSourcePayload = {
                data_src_name: fileName,
                data_src_desc: `${fileName}`,
                data_src_tags: {},
                lake_zone_id: 1, // You may want to make this configurable
                data_src_key: fileName.toLowerCase().replace(/\s+/g, '_'),
                connection_config_id: bhConnection, // You may want to make this configurable
                bh_project_id: Number(bhProject),
                data_src_quality: "80",
                data_src_status_cd: 1,
                file_name: fileName,
                connection_type: 'FILE',
                file_path_prefix: connection_type?.file_path_prefix
            };
""
            const dataSourceResponse:any = await createDataSource(dataSourcePayload);
            if (!dataSourceResponse?.data_src_id) {
                throw new Error("Failed to create data source");
            }

            const dataSrcId = dataSourceResponse.data_src_id;

            // Second API call - Create Data Source Layout
            const layoutPayload = {
                data_src_lyt_name: fileName,
                data_src_lyt_fmt_cd: layoutFormatsTypes?.find((type: any) => 
                    type.code_dtl_desc?.toLowerCase() === fileType?.toLowerCase())?.code_dtl_id || 0,
                data_src_lyt_delimiter_cd: delimiterTypes?.find((type: any) => 
                    type.code_dtl_value === delimiter)?.code_dtl_id || 0,
                data_src_lyt_cust_delimiter: delimiter,
                data_src_lyt_header: true,
                data_src_lyt_encoding_cd: encodingTypes?.find((type: any) => 
                    type.code_dtl_value === encoding)?.code_dtl_id || 0,
                data_src_lyt_quote_chars_cd: 1, // Default value, adjust as needed
                data_src_lyt_escape_chars_cd: 1, // Default value, adjust as needed
                data_src_lyt_regex: "",
                data_src_lyt_pk: false,
                data_src_lyt_total_records: fileData ? fileData.length - 1 : 0,
                data_src_lyt_type_cd: 1, // Default value, adjust as needed
                data_src_lyt_is_mandatory: true,
                data_src_n_rows_to_skip: headerRow - 1,
                data_src_file_path: "",
                data_src_file_type: fileType,
                data_src_multi_part_file: false,
                data_src_is_history_required: false,
                data_src_id: dataSrcId,
                data_src_lyt_key: `${fileName?.toLowerCase().replace(/\s+/g, '_')}_layout`
            };

            const layoutResponse:any = await createDataSourceLayout(layoutPayload);
            if (!layoutResponse?.data_src_lyt_id) {
                throw new Error("Failed to create data source layout");
            }

            const layoutId = layoutResponse?.data_src_lyt_id;

            // Third API call - Create Layout Fields
            const layoutFieldsPayload = headers.map((header, index) => ({
                lyt_fld_name: header,
                lyt_fld_desc: `Field for ${header}`,
                lyt_fld_order: index + 1,
                lyt_fld_is_pk: false,
                lyt_fld_start: 0,
                lyt_fld_length: 0,
                lyt_fld_data_type_cd: dataTypes?.find((type: any) => 
                    type.code_dtl_desc?.toLowerCase() === columnMetadata[index]?.dataType)?.code_dtl_id || 0,
                lyt_fld_tags: {},
                lyt_id: layoutId,
                lyt_fld_key: `${header?.toLowerCase().replace(/\s+/g, '_')}_field`
            }));

            const layoutFieldsResponse = await createLayoutFields(layoutFieldsPayload);
            console.log(layoutFieldsResponse);
            if (!layoutFieldsResponse) {
                throw new Error("Failed to create layout fields");
            }

            // After successful completion, fetch the updated data source list
            const dataSourceListResponse = await getDataSourceList();
            console.log("Updated data source list:", dataSourceListResponse);

            // Invalidate React Query cache for data sources
            await queryClient.invalidateQueries({ queryKey: ['data_source'] });
            await queryClient.invalidateQueries({ queryKey: ['data_source', 'list'] });

            // Trigger refetch in parent component to update UI
            if (onRefetch) {
                onRefetch();
            }

            // Success - close the import section
            closeImportSection();
        } catch (error) {
            console.error("Error in import process:", error);
            setError(error instanceof Error ? error.message : "An error occurred during import");
        } finally {
            setImportLoading(false);
        }
    };

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
            return (
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <div className="text-gray-400">
                        <DatabaseIcon className="w-8 h-8 mb-2" />
                    </div>
                    <p className="text-gray-500 text-sm">No data available for preview</p>
                </div>
            );
        }

        const totalRows = fileData.length - 1;
        const totalPages = Math.ceil(totalRows / ROWS_PER_PAGE);
        const startIndex = (currentPage - 1) * ROWS_PER_PAGE + 1;
        const endIndex = Math.min(startIndex + ROWS_PER_PAGE, fileData.length);
        const tableRows = fileData.slice(startIndex, endIndex);

        return (
            <div className="space-y-2">
                {/* Table Header Stats */}
                <div className="flex items-center justify-between px-3 py-1.5 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1.5">
                            <TableIcon className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs text-gray-600">
                                Showing rows {startIndex} - {endIndex} of {totalRows}
                            </span>
                        </div>
                        <div className="h-3.5 w-px bg-gray-200" />
                        <div className="flex items-center space-x-1.5">
                            <ColumnsIcon className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs text-gray-600">
                                {headers.length} columns
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex items-center">
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-gray-600 hover:text-gray-900 h-7 text-xs"
                        >
                            <DownloadIcon className="w-3.5 h-3.5 mr-1.5" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Main Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table className="w-full">
                            <TableHeader>
                                <TableRow className="bg-gray-50 border-b border-gray-200">
                                    {headers.map((header, index) => (
                                        <TableHead 
                                            key={index} 
                                            className="px-3 py-2 first:pl-4 last:pr-4"
                                        >
                                            <div className="flex items-center space-x-1.5">
                                                <div
                                                    role="textbox"
                                                    aria-label={`Edit column header ${header}`}
                                                    contentEditable
                                                    suppressContentEditableWarning
                                                    onBlur={(e) => handleHeaderChange(index, e.currentTarget.textContent || '')}
                                                    className="font-medium text-xs text-gray-900 outline-none border-b-2 border-transparent hover:border-blue-500 focus:border-blue-600 transition-colors cursor-text px-1"
                                                >
                                                    {header}
                                                </div>
                                                
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                className="p-0.5 h-6 hover:bg-gray-100 rounded"
                                                                onClick={() => handleHistogramClick(index)}
                                                            >
                                                                <BarChart2 className="h-3.5 w-3.5 text-gray-500" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent 
                                                            className="bg-white p-2 rounded-lg shadow-lg border border-gray-200"
                                                            side="bottom"
                                                        >
                                                            <div className="space-y-1.5">
                                                                <div className="flex items-center justify-between text-xs">
                                                                    <span className="text-gray-500">Data Type:</span>
                                                                    <span className="font-medium text-gray-900">{columnMetadata[index]?.dataType}</span>
                                                                </div>
                                                                <div className="flex items-center justify-between text-xs">
                                                                    <span className="text-gray-500">Unique Values:</span>
                                                                    <span className="font-medium text-gray-900">{columnMetadata[index]?.uniqueValues}</span>
                                                                </div>
                                                                <div className="flex items-center justify-between text-xs">
                                                                    <span className="text-gray-500">Null Count:</span>
                                                                    <span className="font-medium text-gray-900">{columnMetadata[index]?.nullCount}</span>
                                                                </div>
                                                                <div className="h-px bg-gray-100 my-1.5" />
                                                                <div className="flex items-center justify-between text-xs">
                                                                    <span className="text-gray-500">Range:</span>
                                                                    <span className="font-medium text-gray-900">
                                                                        {columnMetadata[index]?.minValue} - {columnMetadata[index]?.maxValue}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            
                            <TableBody>
                                {tableRows.map((row, rowIndex) => (
                                    <TableRow 
                                        key={rowIndex}
                                        className={`
                                            border-b border-gray-100 last:border-0
                                            ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                                            hover:bg-blue-50/50 transition-colors
                                        `}
                                    >
                                        {row.map((cell, cellIndex) => (
                                            <TableCell 
                                                key={cellIndex} 
                                                className="px-3 py-1.5 text-xs text-gray-700 first:pl-4 last:pr-4"
                                            >
                                                {cell !== undefined ? String(cell) : "—"}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100">
                            <div className="text-xs text-gray-500">
                                Page {currentPage} of {totalPages}
                            </div>
                            
                            <div className="flex items-center space-x-1.5">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="flex items-center h-7 text-xs"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="flex items-center h-7 text-xs"
                                >
                                    Next
                                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
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
                        </div>
                        {file && (
                            <div className="flex flex-col space-y-6">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-grow">
                                        <Label htmlFor="fileName">Source Name</Label>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <Input
                                                id="fileName"
                                                value={fileName}
                                                onChange={handleFileNameChange}
                                                className="w-full"
                                                placeholder="Enter source name"
                                                aria-label="Edit source name"
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
                                                        <SelectItem key={project.ProjectId} value={project?.ProjectId?.toString()}>
                                                            {project.Project_Name}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem value="no-projects-available" disabled>
                                                        No projects available
                                                    </SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="w-1/3">
                                        <Label htmlFor="bhconnection">BH Connection</Label>
                                        <Select value={bhConnection} onValueChange={handleBhConnectionChange} aria-label="Select BH Connection">
                                            <SelectTrigger id="bhconnection">
                                                <SelectValue placeholder="Select a connection" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {connectionConfigList && connectionConfigList.length > 0 ? (
                                                    connectionConfigList.map((connection: any) => (
                                                        <SelectItem 
                                                            key={connection.id} 
                                                            value={connection.id?.toString() || ""}
                                                        >
                                                            {connection.connection_config_name || "Unnamed Connection"}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem value="no-connections-available" disabled>
                                                        No connections available
                                                    </SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="flex justify-end">
                            <Button
                                className="bg-black hover:bg-gray-800 text-white disabled:bg-gray-400"
                                onClick={() => setCurrentStep(2)}
                                disabled={!file || !bhProject || !bhConnection}
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
                                disabled={importLoading}
                                aria-label="Go Back to Preview and Edit"
                                className="text-black border-gray-400 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" /> Back
                            </Button>
                            <Button
                                onClick={() => {
                                    console.log("Data imported successfully");
                                    importSection();
                                }}
                                disabled={importLoading}
                                className="bg-black hover:bg-gray-800 text-white flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Confirm and Import Data"
                            >
                                {importLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Importing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Confirm Import
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    }
    return (
        <Card className="w-full max-w-6xl mx-auto relative">
            <CardHeader className="relative">
                <CardTitle>Import Data Source</CardTitle>
                <CardDescription>
                    Import and preview XML, JSON, CSV, or XLSX files
                </CardDescription>
                <div className="absolute top-4 right-4">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        aria-label="Close"
                        onClick={() => closeImportSection()}
                        disabled={importLoading}
                        className="text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {selectedColumnIndex !== null ? `Histogram for ${headers[selectedColumnIndex]}` : 'Histogram'}
                        </DialogTitle>
                    </DialogHeader>
                    <div>
                        {selectedColumnIndex !== null ? (
                            <Histogram
                                data={generateHistogramData(selectedColumnIndex)}
                                title={headers[selectedColumnIndex]}
                            />
                        ) : (
                            <p>No column selected.</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button className="bg-black hover:bg-gray-800 text-white" onClick={closeModal} aria-label="Close Histogram Modal">
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* Import Loading Overlay */}
            {importLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50 rounded-lg">
                    <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-black" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Importing Data Source
                        </h3>
                        <p className="text-gray-600 max-w-sm">
                            Your datasource is importing, it will take some time. Please wait...
                        </p>
                    </div>
                </div>
            )}
        </Card>
    );
}
