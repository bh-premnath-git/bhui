import { Grid } from "@mui/material";
import DashboardHeader from "./DashboardHeadrer";
import DataPlatformSummery from "./DataPlatformSummery";
import IngestionStatus from "./IngestionStatus";
import PublishStatus from "./PublishStatus";

export default function DashBoard() {
    return (
        <>
            <div>
                <DashboardHeader />
                <Grid container spacing={2}>
                    <Grid item xs={12} md={7}>
                        <DataPlatformSummery />
                    </Grid>
                    <Grid item xs={12} md={5} sx={{ mt: 1 }}>
                        <IngestionStatus />
                        <PublishStatus />
                    </Grid>
                </Grid>
            </div>
        </>
    );
}