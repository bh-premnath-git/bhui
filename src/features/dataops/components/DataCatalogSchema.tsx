import { DataTable } from '@/components/bh-table/data-table';
import { createColumns, descriptionCellRefs, tagCellRefs } from '@/features/data-catalog/config/layoutCloumns.config';
import { useLayoutFields } from '@/features/data-catalog/hooks/uselayoutFileds';
import About from './About';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { toast } from 'sonner';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { RootState } from "@/store/"
import { useAppSelector } from '@/hooks/useRedux';
import { apiService } from '@/lib/api/api-service';
import { AGENT_REMOTE_URL, CATALOG_REMOTE_API_URL } from '@/config/platformenv';
import { LayoutField, LayoutFieldTags, DataSource } from '@/types/data-catalog/dataCatalog';

export function DataCatalogSchema({ dataSourceId, selectedSource }: { dataSourceId: number, selectedSource: DataSource }) {
  const { dataSourceTypes } = useAppSelector(
    (state: RootState) => state.global
  );
  const { layoutFields, isLoading, isFetching, isError } = useLayoutFields({
    shouldFetch: true,
    dataSourceId: dataSourceId
  });

  const datatypes = dataSourceTypes?.codes_dtl || [];
  const [layoutData, setLayoutData] = useState<LayoutField[]>([]);

  // Add these state variables for pagination
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Calculate total count and current page data
  const totalCount = layoutData?.length || 0;
  const startIndex = pageIndex * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);
  const currentPageData = layoutData.slice(startIndex, endIndex);

  // Add these handlers for pagination
  const handlePageChange = (page: number) => {
    setPageIndex(page - 1);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0); // Reset to first page when changing page size
  };

  useMemo(() => {
    if (layoutFields && layoutFields.layout_fields) {
      setLayoutData(layoutFields.layout_fields);
    }
  }, [layoutFields]);

  const descriptionApiBody = useMemo(() => {
    if (!layoutFields) return null;

    return {
      operation_type: 'column_description',
      thread_id: 'desc_123',
      params: {
        source_name: layoutFields.data_src_lyt_name,
        columns: []
      }
    };
  }, [layoutFields]);

  const fieldIdToColumnMap = useMemo(() => {
    const map = new Map<string, { fieldId: string | number, columnName: string, dataType: any }>();

    if (!layoutData.length || !datatypes.length) return map;

    layoutData.forEach(field => {
      const dataType = datatypes.find(dt => dt.id === field.lyt_fld_data_type_cd);
      map.set(field.lyt_fld_name, {
        fieldId: field.lyt_fld_id,
        columnName: field.lyt_fld_name,
        dataType
      });
    });

    return map;
  }, [layoutData, datatypes]);

  useEffect(() => {
    for (const [fieldId, cellData] of tagCellRefs.entries()) {
      if (cellData.ref.current) {
        const addTagHandler = (key: string, value: string) => {
          handleAddTag(Number(fieldId), key, value);
        };

        const removeTagHandler = (key: string) => {
          handleRemoveTag(Number(fieldId), key);
        };

        const originalAddTag = cellData.ref.current.addTag;
        const originalRemoveTag = cellData.ref.current.removeTag;

        cellData.ref.current.addTag = (key: string, value: string) => {
          originalAddTag(key, value);
          addTagHandler(key, value);
        };

        cellData.ref.current.removeTag = (key: string) => {
          originalRemoveTag(key);
          removeTagHandler(key);
        };
      }
    }

    for (const [fieldId, cellData] of descriptionCellRefs.entries()) {
      if (cellData.ref.current) {
        const originalUpdateDescription = cellData.ref.current.updateDescription;

        cellData.ref.current.updateDescription = async (description: string) => {
          await originalUpdateDescription(description);
          handleUpdateDescription(Number(fieldId), description);
        };
      }
    }
  }, [layoutData]);

  const generateAllDescriptions = async () => {
    if (!layoutFields) {
      toast.error("Layout data not available");
      return;
    }

    toast.info("Generating descriptions for all fields...");

    const body = { ...descriptionApiBody };

    if (!body) return;

    body.params.columns = [];

    for (const [fieldId, cellData] of descriptionCellRefs.entries()) {
      if (cellData.ref.current) {
        try {
          cellData.ref.current.setLoading(true);

          const column = {
            id: fieldId,
            name: cellData.rowData.lyt_fld_name,
            dataType: datatypes.find((dt) => dt.id === cellData.rowData.lyt_fld_data_type_cd)
          }

          body.params.columns.push(column);
        } catch (error) {
          console.error(`Error preparing field ${fieldId}:`, error);
        }
      }
    }

    try {

      const response: any = await apiService.post({
        baseUrl: AGENT_REMOTE_URL,
        method: 'POST',
        url: '/generic/',
        data: body,
        usePrefix: true,
        metadata: {
          errorMessage: `Failed to generate description for fields`
        }
      });

      const parsedResponse = JSON.parse(response.result as string);

      if (parsedResponse && parsedResponse.descriptions && Array.isArray(parsedResponse.descriptions)) {
        let successCount = 0;

        for (const desc of parsedResponse.descriptions) {
          const columnName = desc.column_name;
          const description = desc.description;

          const fieldInfo = fieldIdToColumnMap.get(columnName);

          if (fieldInfo && descriptionCellRefs.has(fieldInfo.fieldId)) {
            const cellData = descriptionCellRefs.get(fieldInfo.fieldId);
            if (cellData && cellData.ref.current) {
              await cellData.ref.current.updateDescription(description);
              cellData.ref.current.setLoading(false);
              successCount++;
            }
          } else {
            console.warn(`Could not find field ID for column name: ${columnName}`);
          }
        }

        toast.success(`Successfully generated ${successCount} descriptions`);
      } else {
        toast.error("No descriptions found in the API response");
        for (const cellData of descriptionCellRefs.values()) {
          if (cellData.ref.current) {
            cellData.ref.current.setLoading(false);
          }
        }
      }
    } catch (error) {
      console.error("Error generating descriptions:", error);
      toast.error("Error generating descriptions");
      for (const cellData of descriptionCellRefs.values()) {
        if (cellData.ref.current) {
          cellData.ref.current.setLoading(false);
        }
      }
    }
  };

  const saveDescriptions = useCallback(async () => {
    // Make sure we have a valid layout ID before proceeding
    if (!layoutFields?.data_src_lyt_id) {
      toast.error('Cannot save descriptions: Layout ID not available');
      return;
    }

    const descriptions: Array<{ lyt_fld_id: string | number; lyt_fld_desc: string }> = [];

    descriptionCellRefs.forEach((cellData, fieldId) => {
      if (cellData.ref.current) {
        descriptions.push({
          lyt_fld_id: fieldId,
          lyt_fld_desc: cellData.ref.current.getValue() || ''
        });
      }
    });

    if (layoutFields?.data_src_lyt_id) {
      await apiService.patch({
        baseUrl: CATALOG_REMOTE_API_URL,
        url: `/layout_fields/descriptions/${layoutFields?.data_src_lyt_id}`,
        data: { descriptions: descriptions },
        usePrefix: true,
        method: 'PATCH',
        metadata: {
          errorMessage: 'Failed to update flow definition'
        }
      })
    }
    toast.success('Description updated successfully');
  }, [layoutFields?.data_src_lyt_id]);

  const handleAddTag = useCallback((fieldId: number, key: string, value: string) => {
    const newTags: LayoutFieldTags = {
      tagList: { key, value }
    };

    setLayoutData(prevData =>
      prevData.map(field =>
        field.lyt_fld_id === fieldId
          ? { ...field, lyt_fld_tags: newTags }
          : field
      )
    );

    toast.success(`Added tag ${key}: ${value}`);
  }, []);

  const handleRemoveTag = useCallback((fieldId: number, key: string) => {
    const emptyTags: LayoutFieldTags = {
      tagList: { key: '', value: '' }
    };

    setLayoutData(prevData =>
      prevData.map(field =>
        field.lyt_fld_id === fieldId
          ? { ...field, lyt_fld_tags: emptyTags }
          : field
      )
    );

    toast.success(`Removed tag ${key}`);
  }, []);

  const handleUpdateDescription = useCallback((fieldId: number, description: string) => {
    // Update the layoutData state
    setLayoutData(prevData =>
      prevData.map(field =>
        field.lyt_fld_id === fieldId
          ? { ...field, lyt_fld_desc: description }
          : field
      )
    );

    toast.success(`Updated description for field ${fieldId}`);
  }, []);

  const columns = useMemo(() =>
    createColumns(generateAllDescriptions, saveDescriptions),
    [generateAllDescriptions, saveDescriptions]
  );

  // Prepare columns data for About component
  const columnsForAbout = useMemo(() => {
    if (!layoutData.length || !datatypes.length) return [];

    return layoutData.map(field => {
      const dataType = datatypes.find(dt => dt.id === field.lyt_fld_data_type_cd);
      return {
        id: field.lyt_fld_id,
        name: field.lyt_fld_name,
        description: field.lyt_fld_desc,
        dataType
      };
    });
  }, [layoutData, datatypes]);

  if (isLoading || isFetching) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium">Schema Details</h3>
        <div className="mt-4">
          <LoadingState className='w-30 h-30' />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium">Schema Details</h3>
        <div className="mt-4">
          <ErrorState message="Failed to load schema details. Please try again later." />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium">Schema Details</h3>
      <div className="mt-4 flex gap-6">
        <div className="flex-1">
          {layoutData.length > 0 ? (
            <DataTable
              columns={columns}
              data={currentPageData}
              topVariant="simple"
              pagination={true}
              pageIndex={pageIndex}
              pageSize={pageSize}
              pageCount={Math.ceil(totalCount / pageSize)}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          ) : (
            <div className="p-8 text-center text-gray-500">
              No schema details available for this data source.
            </div>
          )}
        </div>
        <div className="w-[300px]">
          <About
            selectedSource={selectedSource}
            initialData={{
              description: selectedSource?.data_src_desc
            }}
            columns={columnsForAbout}
          />
        </div>
      </div>
    </div>
  );
}
