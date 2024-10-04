import React from 'react';
import './CreateCluster.css';
import { Stack } from '@mui/material';

const CreateCluster = ({close}) => {
    const trackList = [
        { id: 1, time: "12:14:27", status: 'Attaching' },
        { id: 2, time: "12:15:30", status: 'Setting Up' },
        { id: 3, time: "12:16:35", status: 'Trying to find a cluster' },
        { id: 4, time: "12:17:40", status: 'Starting cluster with 1 worker' },
        { id: 5, time: "12:18:45", status: 'Endpoint url:https://react-icons.github.io/react-icons/search/#q=searc' },
        { id: 6, time: "12:19:50", status: 'Find Insurance for new nodes, acquiring more instance if necessary' },
        { id: 7, time: "12:20:55", status: 'Setting Up' },
        { id: 8, time: "12:21:45", status: 'Trying to find a cluster' },
    ]
    return (
        <>
            <section>
                <ul className="list">
                    {trackList.map((item, index) => (<li className="list-item">
                        <Stack onClick={close} key={index} direction={'row'} sx={{ pb: 2 }} spacing={2} >
                            <Stack>{item?.time}</Stack>
                            <Stack>{item.status}</Stack>
                        </Stack>
                    </li>))}

                </ul>

            </section>
        </>
    );
};

export default CreateCluster;