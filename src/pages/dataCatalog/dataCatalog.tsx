import React, { useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { RootState } from "@/store/store";
import { getGitProject } from "@/redux/ProjectSlice";
import { 
  getDataSourceLayout, 
  getdataSourceList, 
  setSelectedDataSource 
} from "@/redux/CatalogSlice";
import { formatedDate } from "@/Utils/dateFormatter";

// Components
import { FlexibleTable } from "@/components/Tabel";
import { Spinner } from "@/components/ui/spinner";
import { ErrorDisplay } from "@/components/ui/error-display";
import CatalogSchema from "./catalogSchema";

// UI and Icons
import {
  Paper,
  Typography,
  Box,
  LinearProgress,
  Tooltip,
  Drawer,
  IconButton,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Popover
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import {
  Database,
  Users,
  Clock,
  FileQuestion
} from "lucide-react";
import {
  Numbers,
  TextFields,
  CalendarMonth,
  Check,
  Key,
  BarChart
} from "@mui/icons-material";

import Papa from "papaparse";
import xml2js from "xml2js";

/* ----------------------------------------------------------------------
  Interfaces & Types
---------------------------------------------------------------------- */

interface CatalogInter {
  data_src_name: string;
  data_src_desc: string;
  data_src_quality: number;
  data_src_id: number;
  bh_project_id: number;
  data_src_tags: object;
  data_source_metadata: Array<object>[];
  data_src_last_updated: any;
}

interface DataCatalogTableProps {
  catalogList: CatalogInter[];
  loading: boolean;
  error: { message: string } | null;
}

/** FlexibleTable column configuration */
type ColumnConfig = {
  key: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  type?: "text" | "number" | "date" | "badge";
  badgeConfig?: {
    colorMap: Record<string, string>;
  };
  render?: (value: any, rowData: CatalogInter) => React.ReactNode;
};

interface ValueDistribution {
  count: number;
  percentage: number;
}

interface ColumnMetadata {
  name: string;
  dataType: string;
  isPrimaryKey: boolean;
  maxLength: number;
  uniqueValues: number;
  sampleValues: string[];
  valueDistribution: Record<string, ValueDistribution>;
  totalCount: number;
}

interface CreateDataSourceRequest {
  data_src_name: string;
  data_src_desc: string;
  data_src_tags: Record<string, any>;
  lake_zone_id: number;
  data_src_key: string;
  connection_config_id: number;
  bh_project_id: number;
  data_src_quality: string;
  data_src_status_cd: number;
}

interface CreateDataSourceLayoutRequest {
  data_src_lyt_name: string;
  data_src_lyt_fmt_cd: number;
  data_src_lyt_delimiter_cd: number;
  data_src_lyt_cust_delimiter: string;
  data_src_lyt_header: boolean;
  data_src_lyt_encoding_cd: number;
  data_src_lyt_quote_chars_cd: number;
  data_src_lyt_escape_chars_cd: number;
  data_src_lyt_pk: boolean;
  data_src_lyt_type_cd: number;
  data_src_lyt_is_mandatory: boolean;
  data_src_file_type: string;
  data_src_id: number;
  data_src_lyt_key: string;
}

interface LayoutField {
  lyt_fld_name: string;
  lyt_fld_desc: string;
  lyt_fld_order: number;
  lyt_fld_is_pk: boolean;
  lyt_fld_data_type_cd: number;
  lyt_fld_tags: Record<string, any>;
  lyt_id: number;
  lyt_fld_key: string;
}

/* ----------------------------------------------------------------------
  Helpers & Utilities
---------------------------------------------------------------------- */

/** Auth headers for secured endpoints */
const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  if (!token) {
    console.error("No authentication token found");
    throw new Error("Authentication token is missing");
  }
  const cleanToken = token.replace(/^["'](.+)["']$/, "$1");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${cleanToken}`,
  };
};

/** Infer CSV/TXT file delimiter, quote char, encoding. */
const inferDelimiterSettings = (text: string) => {
  const lines = text.split("\n").slice(0, 5).join("\n");
  const counts = {
    ",": (lines.match(/,/g) || []).length,
    ";": (lines.match(/;/g) || []).length,
    "\t": (lines.match(/\t/g) || []).length,
  };
  const inferredDelimiter = Object.entries(counts).reduce((a, b) =>
    a[1] > b[1] ? a : b
  )[0];
  const hasDoubleQuotes = text.includes('"');
  const hasSingleQuotes = text.includes("'");
  const inferredQuoteChar = hasDoubleQuotes ? '"' : hasSingleQuotes ? "'" : '"';
  const inferredEncoding = "UTF-8";

  return {
    delimiter: inferredDelimiter,
    quoteChar: inferredQuoteChar,
    encoding: inferredEncoding,
  };
};

/** Infer data type from sample values */
const inferDataType = (values: any[]): string => {
  const sampleValue = values.find((v) => v !== undefined && v !== null);
  if (!sampleValue) return "string";

  if (values.every((v) => !isNaN(Number(v)))) {
    if (values.every((v) => Number.isInteger(Number(v)))) {
      return "integer";
    }
    return "decimal";
  }

  if (values.every((v) => !isNaN(Date.parse(v)))) {
    return "date";
  }

  if (
    values.every(
      (v) => v === "true" || v === "false" || v === true || v === false
    )
  ) {
    return "boolean";
  }

  return "string";
};

/** Calculate distribution of values (count + percentage) */
const calculateDistribution = (values: any[]): Record<string, ValueDistribution> => {
  const distribution: Record<string, ValueDistribution> = {};
  values.forEach((val) => {
    const key = String(val);
    if (!distribution[key]) {
      distribution[key] = { count: 0, percentage: 0 };
    }
    distribution[key].count++;
  });
  Object.values(distribution).forEach((dist) => {
    dist.percentage = (dist.count / values.length) * 100;
  });
  return distribution;
};

/** Map our data type string to numeric codes in DB */
const getDataTypeCode = (dataType: string): number => {
  switch (dataType) {
    case "integer":
      return 1;
    case "decimal":
      return 2;
    case "string":
      return 3;
    case "date":
      return 4;
    case "boolean":
      return 5;
    default:
      return 3;
  }
};

/* ----------------------------------------------------------------------
  Sub-Components
---------------------------------------------------------------------- */

/** Displays a placeholder when no data sources are available (not currently used in Table) */
const EmptyComponent: React.FC = () => (
  <Paper
    elevation={0}
    sx={{
      height: 400,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "background.default",
      border: "1px dashed",
      borderColor: "divider",
      borderRadius: 2,
      m: 2,
    }}
  >
    <FileQuestion size={64} className="text-gray-400" style={{ marginBottom: "1.5rem" }} />
    <Typography
      variant="h5"
      sx={{
        mb: 1,
        fontWeight: 600,
        color: "text.primary",
      }}
    >
      No Data Sources Available
    </Typography>
    <Typography
      variant="body1"
      sx={{
        color: "text.secondary",
        textAlign: "center",
      }}
    >
      Start by adding your first data source
    </Typography>
  </Paper>
);

/** Renders each column header with metadata popover (for the preview in the import drawer) */
const ColumnHeader: React.FC<{
  header: string;
  meta: ColumnMetadata;
  onChange: (value: string) => void;
}> = ({ header, meta, onChange }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const getDataTypeIcon = (type: string) => {
    switch (type) {
      case "integer":
      case "decimal":
        return <Numbers fontSize="small" />;
      case "date":
        return <CalendarMonth fontSize="small" />;
      case "boolean":
        return <Check fontSize="small" />;
      default:
        return <TextFields fontSize="small" />;
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 1 }}>
        <TextField
          value={header}
          onChange={(e) => onChange(e.target.value)}
          variant="standard"
          size="small"
          fullWidth
          placeholder="Edit column name"
          sx={{
            "& .MuiInput-root": {
              fontSize: "0.875rem",
              fontWeight: 500,
            },
          }}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mt: 1,
          height: 24,
        }}
      >
        <Tooltip title={`Data Type: ${meta.dataType}`}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              color: "primary.main",
            }}
          >
            {getDataTypeIcon(meta.dataType)}
          </Box>
        </Tooltip>

        {meta.isPrimaryKey && (
          <Tooltip title="Primary Key">
            <Key fontSize="small" color="secondary" />
          </Tooltip>
        )}

        <Tooltip
          title={`${meta.uniqueValues} unique values out of ${meta.totalCount} total`}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onMouseEnter={handlePopoverOpen}
            onMouseLeave={handlePopoverClose}
          >
            <BarChart fontSize="small" color="action" />
          </Box>
        </Tooltip>
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        sx={{
          pointerEvents: "none",
        }}
      >
        <Box sx={{ p: 2, maxWidth: 300 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Value Distribution
          </Typography>

          <Box sx={{ mb: 1 }}>
            {Object.entries(meta.valueDistribution)
              .slice(0, 5)
              .map(([value, dist], idx) => (
                <Box
                  key={idx}
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
                >
                  <Typography variant="caption" sx={{ minWidth: 60 }}>
                    {value.length > 10 ? `${value.slice(0, 10)}...` : value}
                  </Typography>
                  <Box
                    sx={{
                      height: 8,
                      bgcolor: "primary.main",
                      borderRadius: 1,
                      width: `${dist.percentage}%`,
                      minWidth: 20,
                    }}
                  />
                  <Typography variant="caption">
                    {`${dist.count} (${dist.percentage.toFixed(1)}%)`}
                  </Typography>
                </Box>
              ))}
          </Box>

          <Typography variant="caption" color="text.secondary">
            Sample values: {meta.sampleValues.join(", ")}
          </Typography>
        </Box>
      </Popover>
    </Box>
  );
};

/* ----------------------------------------------------------------------
  Table Column Configuration
---------------------------------------------------------------------- */
const columns: ColumnConfig[] = [
  {
    key: "data_src_name",
    header: "Data Source",
    sortable: true,
    filterable: true,
    type: "text",
    render: (value: string, rowData: CatalogInter) => (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          minWidth: "250px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "action.hover",
            borderRadius: 1,
            p: 1,
          }}
        >
          <Database color="green" size={20} />
        </Box>
        <Box>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 500,
              color: "text.primary",
              mb: 0.5,
            }}
          >
            {value || "Never"}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              maxWidth: "200px",
            }}
          >
            {rowData.data_src_desc || "No description available"}
          </Typography>
        </Box>
      </Box>
    ),
  },
  {
    key: "bh_project_name",
    header: "Project",
    sortable: true,
    filterable: true,
    type: "text",
  },
  {
    key: "owner",
    header: "Owner",
    sortable: true,
    filterable: true,
    type: "text",
  },
  {
    key: "total_customer",
    header: "Total Consumers",
    sortable: true,
    filterable: true,
    type: "text",
    render: (value: string) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Users size={16} className="text-gray-500" />
        <Typography>{value || "0"}</Typography>
      </Box>
    ),
  },
  {
    key: "total_records",
    header: "Total Records",
    sortable: true,
    filterable: false,
    type: "text",
  },
  {
    key: "data_src_quality",
    header: "Quality",
    sortable: true,
    filterable: true,
    type: "text",
    render: (value: string) => {
      const qualityScore = parseInt(value, 10);
      const getColor = (score: number) => {
        if (score >= 80) return "success.main";
        if (score >= 50) return "warning.main";
        return "error.main";
      };

      return (
        <Tooltip title={`Quality Score: ${qualityScore}%`}>
          <Box sx={{ width: "120px" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {qualityScore}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={qualityScore}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: "action.hover",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 3,
                  backgroundColor: getColor(qualityScore),
                },
              }}
            />
          </Box>
        </Tooltip>
      );
    },
  },
  {
    key: "data_src_last_updated",
    header: "Last Updated",
    sortable: true,
    filterable: false,
    type: "text",
    render: (value: any) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Clock size={16} className="text-gray-500" />
        <Typography>{formatedDate(value)}</Typography>
      </Box>
    ),
  },
];

/* ----------------------------------------------------------------------
  Main Table Component
---------------------------------------------------------------------- */

function DataCatalogTable({ catalogList, loading, error }: DataCatalogTableProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<any>(null);

  // Import UI states
  const [showImportSection, setShowImportSection] = useState(false);
  const [fileData, setFileData] = useState<any>(null);
  const [delimiter, setDelimiter] = useState<string>(",");
  const [quoteChar, setQuoteChar] = useState<string>('"');
  const [encoding, setEncoding] = useState<string>("UTF-8");
  const [layoutType, setLayoutType] = useState<"delimiter" | "json" | "xml">(
    "delimiter"
  );
  const [rawFileContent, setRawFileContent] = useState<string>("");
  const [dataSourceName, setDataSourceName] = useState<string>("");
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [editableHeaders, setEditableHeaders] = useState<string[]>([]);
  const [originalHeaders, setOriginalHeaders] = useState<string[]>([]);
  const [columnMetadata, setColumnMetadata] = useState<ColumnMetadata[]>([]);

  /** Fetch initial data on mount */
  useLayoutEffect(() => {
    dispatch(getGitProject());
    dispatch(getdataSourceList({ offset: 0, limit: 1000 }));
  }, [dispatch]);

  /* Loading & Error states */
  if (loading) {
    return <Spinner />;
  }
  if (error) {
    return <ErrorDisplay message={error.message} />;
  }

  /* Handlers */
  const createNewFn = () => {
    // Example function for table "create new" button
    // navigate("/all-projects/new");
  };

  const playRowFn = async (rowData: any) => {
    await dispatch(getDataSourceLayout({ data_src_id: rowData.data_src_id }));
    dispatch(setSelectedDataSource(rowData));
    setSelectedSource(rowData);
    setIsDrawerOpen(true);
  };

  const handleImportClick = () => {
    setShowImportSection(!showImportSection);
    setPreviewData([]);
    setFileData(null);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setDataSourceName(file.name);

    // Decide layout type by file mime
    if (file.type === "application/json") {
      setLayoutType("json");
    } else if (file.type === "text/xml") {
      setLayoutType("xml");
    } else {
      setLayoutType("delimiter");
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      setRawFileContent(text);
      switch (layoutType) {
        case "json":
          parseJsonData(text);
          break;
        case "xml":
          parseXmlData(text);
          break;
        default:
          const inferred = inferDelimiterSettings(text);
          setDelimiter(inferred.delimiter);
          setQuoteChar(inferred.quoteChar);
          setEncoding(inferred.encoding);
          parseCsvData(text, inferred);
          break;
      }
    };
    reader.readAsText(file);
  };

  const handleSettingChange = (
    type: "delimiter" | "quoteChar" | "encoding",
    value: string
  ) => {
    if (type === "delimiter") setDelimiter(value);
    else if (type === "quoteChar") setQuoteChar(value);
    else if (type === "encoding") setEncoding(value);

    // Re-parse if we have CSV content
    if (rawFileContent && fileData && layoutType === "delimiter") {
      parseCsvData(rawFileContent, {
        delimiter: type === "delimiter" ? value : delimiter,
        quoteChar: type === "quoteChar" ? value : quoteChar,
        encoding: type === "encoding" ? value : encoding,
      });
    }
  };

  const handleHeaderChange = (index: number, newHeader: string) => {
    const updated = [...editableHeaders];
    updated[index] = newHeader;
    setEditableHeaders(updated);
  };

  /* -----------------------------
     Parsing Helpers
  ------------------------------*/
  const parseJsonData = (text: string) => {
    const jsonData = JSON.parse(text);
    const isArray = Array.isArray(jsonData);
    const firstRow = isArray ? jsonData[0] : jsonData;
    const headers = Object.keys(firstRow || {});
    setPreviewData(isArray ? jsonData : [jsonData]);
    setOriginalHeaders(headers);
    setEditableHeaders(headers);
    setFileData({ data: jsonData });

    // Basic column metadata
    setColumnMetadata(buildColumnMetadata(headers, isArray ? jsonData : [jsonData]));
  };

  const parseXmlData = (text: string) => {
    const parser = new xml2js.Parser();
    parser.parseString(text, (err, result) => {
      if (err) return;
      const headers = Object.keys(result);
      setPreviewData([result]);
      setOriginalHeaders(headers);
      setEditableHeaders(headers);
      setFileData({ data: result });

      // Basic column metadata
      setColumnMetadata(buildColumnMetadata(headers, [result]));
    });
  };

  const parseCsvData = (
    text: string,
    settings: { delimiter: string; quoteChar: string; encoding: string }
  ) => {
    Papa.parse(text, {
      delimiter: settings.delimiter,
      quoteChar: settings.quoteChar,
      encoding: settings.encoding,
      header: true,
      preview: 10,
      complete: (results) => {
        const headers = results.meta.fields || [];
        setPreviewData(results.data);
        setOriginalHeaders(headers);
        setEditableHeaders(headers);
        setFileData(results);
        setColumnMetadata(buildColumnMetadata(headers, results.data));
      },
    });
  };

  /** Build column metadata from raw data rows */
  const buildColumnMetadata = (headers: string[], rows: any[]): ColumnMetadata[] => {
    if (!rows.length) return [];

    return headers.map((header) => {
      const values = rows
        .map((row) => row[header])
        .filter((val) => val !== undefined && val !== null);
      const uniqueValues = new Set(values);
      const dataType = inferDataType(values);
      const isPrimaryKey = uniqueValues.size === values.length && values.length > 0;
      const maxLength = values.reduce((max, val) => {
        const length = String(val).length;
        return length > max ? length : max;
      }, 0);

      return {
        name: header,
        dataType,
        isPrimaryKey,
        maxLength,
        uniqueValues: uniqueValues.size,
        sampleValues: Array.from(uniqueValues).slice(0, 5) as string[],
        valueDistribution: calculateDistribution(values),
        totalCount: values.length,
      };
    });
  };

  /* -----------------------------
     Import to API Helpers
  ------------------------------*/
  const createDataSource = async (fileName: string) => {
    try {
      const request: CreateDataSourceRequest = {
        data_src_name: dataSourceName || fileName,
        data_src_desc: `Imported from ${fileName}`,
        data_src_tags: {},
        lake_zone_id: 1,
        data_src_key: (dataSourceName || fileName)
          .toLowerCase()
          .replace(/\s+/g, "_"),
        bh_project_id: 1,
        data_src_quality: "100",
        data_src_status_cd: 1,
        connection_config_id: 0,
      };

      const response = await fetch("http://localhost:8011/api/v1/data_source/", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(request),
      });
      if (!response.ok) throw new Error("Failed to create data source");
      return await response.json();
    } catch (error) {
      console.error("Error creating data source:", error);
      throw error;
    }
  };

  const createDataSourceLayout = async (dataSourceId: number, fileName: string) => {
    try {
      const request: CreateDataSourceLayoutRequest = {
        data_src_lyt_name: fileName,
        data_src_lyt_fmt_cd: layoutType === "json" ? 2 : layoutType === "xml" ? 3 : 1,
        data_src_lyt_delimiter_cd:
          layoutType === "delimiter"
            ? delimiter === ","
              ? 1
              : delimiter === ";"
              ? 2
              : 3
            : 1,
        data_src_lyt_cust_delimiter: layoutType === "delimiter" ? delimiter : "",
        data_src_lyt_header: true,
        data_src_lyt_encoding_cd: encoding === "UTF-8" ? 1 : 2,
        data_src_lyt_quote_chars_cd:
          layoutType === "delimiter" ? (quoteChar === '"' ? 1 : 2) : 1,
        data_src_lyt_escape_chars_cd: 1,
        data_src_lyt_pk: true,
        data_src_lyt_type_cd: 1,
        data_src_lyt_is_mandatory: true,
        data_src_file_type: layoutType,
        data_src_id: dataSourceId,
        data_src_lyt_key: `${fileName.toLowerCase().replace(/\s+/g, "_")}_layout`,
      };

      const response = await fetch(
        "http://localhost:8011/api/v1/data_source_layout/",
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(request),
        }
      );
      if (!response.ok) throw new Error("Failed to create data source layout");
      return await response.json();
    } catch (error) {
      console.error("Error creating data source layout:", error);
      throw error;
    }
  };

  const createLayoutFields = async (layoutId: number) => {
    try {
      const layoutFields: LayoutField[] = columnMetadata.map((meta, index) => ({
        lyt_fld_name: meta.name,
        lyt_fld_desc: meta.name,
        lyt_fld_order: index + 1,
        lyt_fld_is_pk: meta.isPrimaryKey,
        lyt_fld_data_type_cd: getDataTypeCode(meta.dataType),
        lyt_fld_tags: {},
        lyt_id: layoutId,
        lyt_fld_key: meta.name.toLowerCase().replace(/\s+/g, "_"),
      }));

      const response = await fetch(
        "http://localhost:8011/api/v1/layout_fields/bulk/",
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(layoutFields),
        }
      );
      if (!response.ok) throw new Error("Failed to create layout fields");
      return await response.json();
    } catch (error) {
      console.error("Error creating layout fields:", error);
      throw error;
    }
  };

  const handleImport = async () => {
    try {
      const token = sessionStorage?.getItem("token");
      if (!token) {
        throw new Error("Please login to import data sources");
      }

      const fileElement = document.getElementById("file-upload") as HTMLInputElement;
      const fileName = fileElement?.files?.[0]?.name || "Unknown";

      // 1) Create data source
      const dataSource = await createDataSource(fileName);

      // 2) Create data source layout
      const layout = await createDataSourceLayout(
        dataSource.data_src_id,
        fileName
      );

      // 3) Create layout fields
      await createLayoutFields(layout.data_src_lyt_id);

      // Close import section & refresh
      setShowImportSection(false);
      dispatch(getdataSourceList({ offset: 0, limit: 1000 }));
    } catch (error: any) {
      console.error("Error during import process:", error);
      if (error.message.includes("token")) {
        alert("Please login again to continue");
        // Optionally navigate("/login");
      } else {
        alert(error.message || "Failed to import data source");
      }
    }
  };

  /* ------------------------------------------------------------------
     Render
  ------------------------------------------------------------------ */
  return (
    <Box
      sx={{
        maxWidth: "100%",
        backgroundColor: "background.default",
        p: 2,
      }}
    >
      {showImportSection ? (
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {/* Import Data Source Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Import Data Source</Typography>
              <IconButton
                onClick={() => {
                  setShowImportSection(false);
                  setPreviewData([]);
                  setFileData(null);
                }}
                sx={{
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* File Upload */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <input
                type="file"
                accept=".csv, .txt, .json, .xml"
                onChange={handleFileUpload}
                style={{ display: "none" }}
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outlined" component="span">
                  Choose File
                </Button>
              </label>
              {fileData && (
                <Typography variant="body2">File loaded successfully</Typography>
              )}
            </Box>

            {/* Parsing and Preview */}
            {fileData && (
              <>
                <TextField
                  label="Data Source Name"
                  value={dataSourceName}
                  onChange={(e) => setDataSourceName(e.target.value)}
                  fullWidth
                  size="small"
                  sx={{ mb: 2 }}
                  helperText="Override the data source name (defaults to file name)"
                />

                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  <Select
                    value={layoutType}
                    onChange={(e) =>
                      setLayoutType(e.target.value as "delimiter" | "json" | "xml")
                    }
                    size="small"
                    sx={{ minWidth: 150 }}
                  >
                    <MenuItem value="delimiter">Delimited File</MenuItem>
                    <MenuItem value="json">JSON</MenuItem>
                    <MenuItem value="xml">XML</MenuItem>
                  </Select>

                  {layoutType === "delimiter" && (
                    <>
                      <Select
                        value={delimiter}
                        onChange={(e) =>
                          handleSettingChange("delimiter", e.target.value)
                        }
                        displayEmpty
                        size="small"
                      >
                        <MenuItem value=",">Comma (,)</MenuItem>
                        <MenuItem value=";">Semicolon (;)</MenuItem>
                        <MenuItem value="\t">Tab</MenuItem>
                      </Select>
                      <Select
                        value={quoteChar}
                        onChange={(e) =>
                          handleSettingChange("quoteChar", e.target.value)
                        }
                        displayEmpty
                        size="small"
                      >
                        <MenuItem value='"'>Double Quote (")</MenuItem>
                        <MenuItem value="'">Single Quote (')</MenuItem>
                      </Select>
                    </>
                  )}

                  <Select
                    value={encoding}
                    onChange={(e) =>
                      handleSettingChange("encoding", e.target.value)
                    }
                    displayEmpty
                    size="small"
                  >
                    <MenuItem value="UTF-8">UTF-8</MenuItem>
                    <MenuItem value="ISO-8859-1">ISO-8859-1</MenuItem>
                  </Select>
                </Box>

                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Preview Data
                </Typography>
                <TableContainer sx={{ maxHeight: 400 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        {editableHeaders.map((header, index) => {
                          const meta = columnMetadata[index];
                          return (
                            <TableCell
                              key={index}
                              sx={{
                                position: "relative",
                                minWidth: "200px",
                                padding: "16px",
                                verticalAlign: "top",
                                "& .MuiInputBase-root": {
                                  margin: 0,
                                },
                              }}
                            >
                              {meta && (
                                <ColumnHeader
                                  header={header}
                                  meta={meta}
                                  onChange={(value) =>
                                    handleHeaderChange(index, value)
                                  }
                                />
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {previewData.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {editableHeaders.map((header, colIndex) => (
                            <TableCell key={`${rowIndex}-${colIndex}`}>
                              {row[originalHeaders[colIndex]]}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                  <Button variant="contained" color="primary" onClick={handleImport}>
                    Import
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Paper>
      ) : (
        <Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Button variant="outlined" color="primary" onClick={handleImportClick}>
              Import Source
            </Button>
          </Box>

          <FlexibleTable
            data={catalogList}
            columns={columns}
            itemsPerPageOptions={[10, 25, 50]}
            defaultItemsPerPage={10}
            tableName="Xplore"
            createNewFn={createNewFn}
            playRowFn={playRowFn}
            playRow={true}
            background="bg-black"
            rowColorFn={(row, index) => (index % 2 === 0 ? "bg-white" : "bg-gray-100")}
          />
        </Box>
      )}

      {/* Drawer for selected data source details */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: "75%",
            minWidth: "900px",
            maxWidth: "1200px",
            boxSizing: "border-box",
            backgroundColor: "background.paper",
            borderLeft: "1px solid",
            borderColor: "divider",
          },
          "& .MuiBackdrop-root": {
            backgroundColor: "rgba(0, 0, 0, 0.2)",
          },
        }}
      >
        <Box sx={{ height: "100%" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {selectedSource?.data_src_name}
            </Typography>
            <IconButton
              onClick={() => setIsDrawerOpen(false)}
              sx={{
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ p: 2, height: "calc(100% - 64px)", overflow: "auto" }}>
            <CatalogSchema selectedSource={selectedSource} />
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}

const DataCatalog: React.FC = () => {
  const { dataSourceList, listLoading, error: apiError } = useAppSelector(
    (state: RootState) => state.catalogApi
  );
  const error = apiError ? { message: apiError } : null;

  return (
    <DataCatalogTable catalogList={dataSourceList} loading={listLoading} error={error} />
  );
};

export default DataCatalog;
