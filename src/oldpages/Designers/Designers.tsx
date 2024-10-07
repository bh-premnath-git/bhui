import Card from '@mui/material/Card';
import { Button, Stack } from "@mui/material";
import { Link } from 'react-router-dom';
// import '../styles/Designer.css'
import "/src/Styles/Designer.css";
import AdminCard from '../../common/AdminCard';

function Designers() {
    const adminList = [
        // {
        //     "id": 1, "img": "/assets/designer/1.png", "title": "Onboard Data",
        //     "desc": "Select this option to onboard new data to your data lake. You can configure DQ Rules, Tags, Classify and Schedule the jobs to automate the process",
        //     "buttonText": 'Onboard Data', "link": '/Designer/Onboard Data'
        // },
        {
            "id": 2, "img": "/assets/designer/2.png", "title": "Build Data Pipeline",
            "desc": "Select this option to transform and enrich data via UI driven approach. You will have an option to combine multiple datasets and create enriched data sets",
            "buttonText": 'Build Pipeline', "link": '/Designer/Build Data PipeLine'
        },
        {
            "id": 3, "img": "/assets/designer/5.png", "title": "Manage Flow",
            "desc": "Flows are Pipeline running in Airflow. Flows are scheduled to run using cron expression",
            "buttonText": 'Manage Flow', "link": '/Designer/Manage Flow'
        },
        // {
        //     "id": 4, "img": "/assets/designer/3.png", "title": "code data pipeline",
        //     "desc": "Select this option to use jupyter tool to enrich data. You will have an option to combine multiple datasets and create enriched data sets",
        //     "buttonText": 'Code Pipeline', "link": '/Designer/Code-Pipelines'
        // },
        // {
        //     "id": 5, "img": "/assets/designer/4.png", "title": "publish data",
        //     "desc": "Select this option to publish data to customer. You will have an option to configure the dataset for the customer delivery. Please ensure customer onboarding is completed to publish data",
        //     "buttonText": 'Publish Data', "link": '/Designer/publish Data'
        // },

    ];

    return (
        <>

            <Stack sx={{maxHeight:'100%',position:'relative',overflowY:'hidden'}}>
                <div className="h-screen d-flex justify-content-center my-2 items-center">
                    {adminList.slice(0, 3)?.map((item) => (
                        <AdminCard style={{}}
                            key={item.id}
                            id={item.id}
                            img={item.img}
                            title={item.title}
                            desc={item.desc}
                            buttonText={item.buttonText}
                            link={item.link}
                        />
                    ))}

                </div>
                {/* <div className="d-flex justify-content-center my-2">
                    {adminList.slice(3, 5)?.map((item) => (
                        <AdminCard style={{}}
                            key={item.id}
                            id={item.id}
                            img={item.img}
                            title={item.title}
                            desc={item.desc}
                            buttonText={item.buttonText}
                            link={item.link}
                        />
                    ))}
                </div> */}
                <div style={{position:'absolute',bottom:0,right:0}}>
                    <img src="/assets/designer/Bg design.png" alt="" width={'600px'} />
                </div>
            </Stack>
        </>

    );
}

export default Designers;