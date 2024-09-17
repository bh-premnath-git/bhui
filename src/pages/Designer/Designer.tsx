import Card from '@mui/material/Card';
import { Button } from "@mui/material";
import { Link } from 'react-router-dom';
// import '../styles/Designer.css'
import "../../Styles/Designer.css";

function Designer() {
    return (
        <>
            <div className='containers w-100 text-start' >
                <div className='relative z-10 flex min-h-0 flex-auto flex-col'>
                    <div className='backgroundImage'></div>
                    <div className='container_1'>
                        <div>
                            <img src='/assets/designer/Group 1321318969.png' className='image' />
                            <Card variant="outlined" className='cards card_1'>
                                <div className="card_header">
                                    <img src="/assets/designer/1.png" width={'40px'} height={'40px'} />
                                    <label className="card_header_text">Onboard Data</label>
                                </div>
                                <div className="card_header_content" >
                                    Select this option to onboard new data to your data lake. You can configure DQ Rules, Tags, Classify and Schedule the jobs to automate the process.
                                </div>
                                <div></div>
                                <Button
                                    variant="contained"
                                    className="card_header_button dark bg-dark fw-bold"
                                    component={Link}
                                    to={`/Designer/Onboard Data`}
                                    sx={{ textTransform: 'none', '&:hover': {
                                        backgroundColor: 'black',
                                        color:'white' // Same color as normal state
                                      },}}
                                //  /onboard
                                >Onboard Data</Button>
                            </Card>
                            <Card variant="outlined" className='cards card_2'>
                                <div className="card_header">
                                    <img src="/assets/designer/2.png" width={'40px'} height={'40px'} />
                                    <label className="card_header_text">Build Data Pipelines</label>
                                </div>
                                <div className="card_header_content" >
                                    Select this option to use visual ETL tool to enrich data. You will have an option to combine multiple datasets and create enriched data sets.
                                </div>
                                <div></div>
                                <Button
                                    variant="contained"
                                    component={Link}
                                    to={`/Designer/Build Data PipeLine`}
                                    className="card_header_button dark bg-dark fw-bold" sx={{ textTransform: 'none', '&:hover': {   
                                        backgroundColor: 'black',
                                        color:'white' // Same color as normal state
                                      },}}>Build Pipelines</Button>
                            </Card>
                            <Card variant="outlined" className="cards card_3" >
                                <div className="card_header">
                                    <img src="/assets/designer/3.png" width={'40px'} height={'40px'} />
                                    <label className="card_header_text">Code Data Pipelines</label>
                                </div>
                                <div className="card_header_content" >
                                    Select this option to use jupyter tool to enrich data. You will have an option to combine multiple datasets and create enriched data sets
                                </div>
                                <div></div>
                                <Button
                                    component={Link}
                                    to={`/Designer/Code-Pipelines`}
                                    variant="contained" className="card_header_button dark bg-dark fw-bold"
                                    sx={{textTransform:'none', '&:hover': {
                                        backgroundColor: 'black',
                                        color:'white' // Same color as normal state
                                      },}}>Code Pipelines</Button>
                            </Card>
                            <Card variant="outlined" className="card_4 cards">
                                <div className="card_header">
                                    <img src="/assets/designer/4.png" width={'40px'} height={'40px'} />
                                    <label className="card_header_text">Publish Data</label>
                                </div>
                                <div className="card_header_content" >
                                    Select this option to  data to customer. You will have an option to fill
                                </div>
                                <div></div>
                                <Button
                                    component={Link}
                                    to={`/Designer/publish Data`}
                                    variant="contained" className="card_header_button dark bg-dark fw-bold"
                                     sx={{textTransform:'none', '&:hover': {
                                        backgroundColor: 'black',
                                        color:'white' // Same color as normal state
                                      },}}>Publish Data</Button>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>

    );
}

export default Designer;