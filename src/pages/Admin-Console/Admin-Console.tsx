import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import '../../styles/Admin-Console.css';
import { useState } from 'react';


function Userlanding() {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <>
              <div className="container">
              <div className='backgroundImage'></div>

                <div style={{ padding: "10px", marginTop: "0px", }}>
                    <Card elevation={1} sx={{ maxWidth: 300 }} square>
                        <div className="text-center m-auto mt-3" style={{ background: "#eeeeee", padding: "10px", marginTop: "40px", borderRadius: '12pc', width: '70px', height: '70px' }}>
                            <img width={40}
                                src="/assets/userlanding/person.png"
                                alt="logo"
                                className="text-center m-auto"
                            />
                        </div>
                        <CardContent style={{ textAlign: 'center' }}>
                            <Typography gutterBottom variant="h6" component="div" style={{ width: '210px', height: '70px', margin: 'auto', padding: '4px', fontWeight: 'bold' }}>
                                Manage Data Platform Users
                            </Typography><br></br>
                            <Typography variant="body2" color="text.secondary" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
                                Select this option to manage internal users of the platform.
                                <br></br>
                            </Typography>
                        </CardContent>
                        <CardActions style={{ justifyContent: 'center' }}>
                            <div className="w-full inline-flex text-center justify-center content-center p-10">
                                    <button
                                        className={`btn user`}
                                        onMouseEnter={() => setIsHovered(true)}
                                        onMouseLeave={() => setIsHovered(false)} 
                                    >
                                        <Link to="/Admin Console/Manage Data Platform Users"
                                            style={{  color: 'inherit' }}
                                        >
                                            Manage Users
                                        </Link>
                                    </button>
                            </div>
                        </CardActions>
                    </Card>
                </div>

                <div style={{ padding: "10px", marginTop: "0px", }}>
                    <Card elevation={1} sx={{ maxWidth: 300 }} square>
                        <div className="text-center m-auto mt-3" style={{ background: "#eeeeee", padding: "10px", marginTop: "40px", borderRadius: '12pc', width: '70px', height: '70px' }}>
                            <img width={40}
                                src="/assets/userlanding/manage.png"
                                alt="logo"
                                className="text-center m-auto"
                            />
                        </div>
                        <CardContent style={{ textAlign: 'center' }}>
                            <Typography gutterBottom variant="h6" component="div" style={{ width: '180px', height: '70px', margin: 'auto', padding: '4px', fontWeight: 'bold' }}>
                                Manage Customer
                            </Typography><br></br>
                            <Typography variant="body2" color="text.secondary" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
                                Select this option to manage consumers
                                <br></br>
                            </Typography>
                        </CardContent>

                        <CardActions style={{ justifyContent: 'center' }}>

                            <div className="w-full inline-flex text-center justify-center content-center p-10">

                                <button
                                    className={`btn user`}
                                    onMouseEnter={() => setIsHovered(true)}
                                    onMouseLeave={() => setIsHovered(false)}
                                >
                                    <Link to="/Admin Console/Manage Customer"
                                        style={{ color: 'inherit' }}
                                    >
                                        Manage Customer
                                    </Link>
                                </button>
                            </div>
                        </CardActions>
                    </Card>
                </div>
                <div style={{ padding: "10px", marginTop: "0px", }}>
                    <Card elevation={1} sx={{ Width: 300 }} square>
                        <div className="text-center m-auto mt-3" style={{ background: "#eeeeee", padding: "10px", marginTop: "40px", borderRadius: '12pc', width: '70px', height: '70px' }}>
                            <img width={40}
                                src="/assets/userlanding/manage.png"
                                alt="logo"
                                className="text-center m-auto"
                            />
                        </div>
                        <CardContent style={{ textAlign: 'center' }}>
                            <Typography gutterBottom variant="h6" component="div" style={{ width: '180px', height: '70px', margin: 'auto', padding: '4px', fontWeight: 'bold' }}>
                                Manage<br /> Project
                            </Typography><br></br>
                            <Typography variant="body2" color="text.secondary" sx={{ px: 5 }}>
                                Select this option to manage<br /> Projects
                                <br></br>
                            </Typography>
                        </CardContent>

                        <CardActions style={{ justifyContent: 'center' }}>

                            <div className="w-full inline-flex text-center justify-center content-center p-10">
                                <button
                                    className={`btn user`}
                                    onMouseEnter={() => setIsHovered(true)}
                                    onMouseLeave={() => setIsHovered(false)}
                                >
                                    <Link to="/All Projects"
                                        style={{ color: 'inherit' }}
                                    >
                                        Manage Project
                                    </Link>
                                </button>
                            </div>
                        </CardActions>
                    </Card>
                </div>
            </div>

        </>
    );
}

export default Userlanding;