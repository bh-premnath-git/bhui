export const flowNodeValidator = (node: any) => {
    const errors: string[] = [];

    // Check connections
    const hasNoPrevious = !node.previous || node.previous.length === 0;
    const hasNoNext = !node.next || node.next.length === 0;

    if (hasNoPrevious && hasNoNext) {
        errors.push("Need downstream connection");
    }

    // Check selected data
    const selectedData = node?.selected?.nodeData?.data?.selectedData;
    const requiredFields = node?.selected?.nodeData?.data?.requiredFields || [];
    const nodeForm = node?.selected?.nodeForm || {};
    if (selectedData == null) {
        errors.push("Type is not selected");
    }

    if (selectedData) {
        for (const field of requiredFields) {
            if (!(field in nodeForm) || nodeForm[field] === "" || nodeForm[field] == null) {
                errors.push(`Missing required field: ${field}`);
            }
        }
    }

    if (errors.length > 0) {
        return [false, errors];
    }

    return [true, []];
};
