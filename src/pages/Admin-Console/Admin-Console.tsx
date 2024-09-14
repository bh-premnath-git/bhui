import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import '../../styles/Admin-Console.css';
import { useState } from 'react';

function Userlanding() {
    const [isHovered, setIsHovered] = useState<number | null>(null); // Change to track the hovered card by ID

    const adminList = [
        {
            "id": 1, "img": "/assets/userlanding/person.png", "title": "Manage Data Platform Users",
            "desc": "Select this option to manage internal users of the platform.", "buttonText": 'Manage Users', "link": '/Admin Console/Manage Data Platform Users'
        },
        {
            "id": 2, "img": "/assets/userlanding/manage.png", "title": "Manage Customer",
            "desc": "Select this option to manage consumers", "buttonText": 'Manage Customer', "link": '/Admin Console/Manage Customer'
        },
        {
            "id": 3, "img": "/assets/userlanding/person.png", "title": "Manage  Projects ",
            "desc": "Select this option to manage Projects", "buttonText": 'Manage Project', "link": '/All Projects'
        },
        {
            "id": 4, "img": "/assets/userlanding/manage.png", "title": "Manage Environment",
            "desc": "Select this option to manage environment", "buttonText": 'Manage Environment', "link": '/All Environment'
        },
    ];

    return (
        <div className="container">
            <div className='backgroundImage'></div>

            {adminList?.map((item: any) => (
                <div style={{ padding: "10px", marginTop: "0px" }} key={item?.id}>
                    <Card elevation={0} sx={{ maxWidth: 300,minHeight:310,borderColor:'#e9e9e2' }} className='shadow-sm'>
                        <div className="text-center m-auto mt-3" style={{ background: "#eeeeee", padding: "10px", marginTop: "40px", borderRadius: '12pc', width: '70px', height: '70px' }}>
                            <img width={40}
                                src={item?.img}
                                alt="logo"
                                className="text-center m-auto"
                            />
                        </div>
                        <CardContent style={{ textAlign: 'center' }}>
                            <Typography gutterBottom variant="h6" component="div" 
                            style={{ width: '160px', height: '70px', margin: 'auto', padding: '4px', fontWeight: 'bold' }}>
                                {item?.title}
                            </Typography>
                            <br />
                            <Typography variant="body2" color="text.secondary" 
                            style={{ paddingLeft: '8px', paddingRight: '8px',width: '230px' }}>
                                {item?.desc}
                                <br />
                            </Typography>
                        </CardContent>
                        <CardActions style={{ justifyContent: 'center' }}>
                            <div className="w-full inline-flex text-center justify-center content-center p-10">
                                <Link className='rounded'
                                    to={item?.link}
                                    style={{
                                        textDecoration: isHovered === item?.id ? 'none' : 'underline',
                                        background: isHovered === item?.id ? 'black' : 'transparent',
                                        color: isHovered === item?.id ? 'white' : 'black',
                                        padding:'12px'

                                    }}
                                    onMouseEnter={() => setIsHovered(item?.id)}
                                    onMouseLeave={() => setIsHovered(null)}
                                >
                                    {item?.buttonText}
                                </Link>
                            </div>

                        </CardActions>
                        <br></br>
                    </Card>
                </div>
            ))}
        </div>
    );
}

export default Userlanding;
