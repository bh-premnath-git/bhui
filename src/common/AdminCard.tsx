import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';

interface AdminCardProps {
    id: number;
    img: string;
    title: string;
    desc: string;
    buttonText: string;
    link: string;
    style?:any;
}

const AdminCard: React.FC<AdminCardProps> = ({ id, img, title, desc, buttonText, link,style }) => {
    const [isHovered, setIsHovered] = useState<boolean>(false);

    return (
        <div style={{ padding: "10px", marginTop: "0px"}} className='mx-4' key={id}>
            <Card elevation={0}  className='shadow-sm' style={{height:'39vh',width:'100%'}}>
                <div className="text-center m-auto mt-3" style={{ padding: "10px", marginTop: "40px", borderRadius: '12pc', width: '70px', height: '70px' }}>
                    <img width={60}
                        src={img}
                        alt="logo"
                        className="text-center m-auto"
                    />
                </div>
                <CardContent style={{ textAlign: 'center' }}>
                    <Typography gutterBottom variant="h6" component="div"
                        style={{ width: '160px', height: '70px', margin: 'auto', padding: '4px', fontWeight: 'bold' }}>
                        {title}
                    </Typography>
                    <br />
                    <Typography variant="body2" color="text.secondary"
                        style={{ paddingLeft: '8px', paddingRight: '8px', width: '230px' }}>
                        {desc}
                        <br />
                    </Typography>
                </CardContent>
                <CardActions style={{ justifyContent: 'center' }}>
                    <div className="w-full inline-flex text-center justify-center content-center p-10">
                        <Link className='rounded'
                            to={link}
                            style={{
                                textDecoration: isHovered ? 'none' : 'underline',
                                background: isHovered ? 'black' : 'transparent',
                                color: isHovered ? 'white' : 'black',
                                padding: '12px'
                            }}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            {buttonText}
                        </Link>
                    </div>
                </CardActions>
                <br />
            </Card>
        </div>
    );
};

export default AdminCard;
