import { useState } from "react";
import SourcesTable from "./SourcesTable";

function Sources(props:any) {
	return (
		<>
		<SourcesTable data={props} codesDtl={props.codesDtl}  handleNext={props.handleNext} sourceItem={props.sourceItem} />
		</>
		
	);
}

export default Sources;