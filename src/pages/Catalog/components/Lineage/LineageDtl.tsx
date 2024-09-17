import { Avatar, Chip, Grid, Stack, Typography } from "@mui/material";
import { useState } from "react";

export default function LineageDtl() {
    const [tags, setTag] = useState([{ "tagKey": 'Department', "tagValue": 'Tech' },
    { "tagKey": 'Region', "tagValue": 'USA' }]);
    const lineageDtlList = [
        {
            'id': 1, 'title': 'Accounts', 'desc': 'All The Accounts In The Personal Loan Line Of Business', 'ownerList': [
                { 'ownerId': '1', 'ownerRole': 'Data Owner', 'ownerProfile': '/assets/avatars/profile1.jpg', 'ownerName': 'Jhon Doe' },
                { 'ownerId': '2', 'ownerRole': 'Technical Owner', 'ownerProfile': '/assets/avatars/profile2.jpg', 'ownerName': 'Jammie Doe' }
            ]
        },
        {
            'id': 2, 'title': 'Long_tail_customer', 'desc': 'All The Accounts In The Personal Loan Line Of Business', 'ownerList': [
                { 'ownerId': '1', 'ownerRole': 'Data Owner', 'ownerProfile': '/assets/avatars/profile1.jpg', 'ownerName': 'Jhon Doe' }
            ]
        }
    ]
    const handleTagDelete = (i:any) => {
        console.log(i)
        const updatedTags = tags.filter((_, index) => index !== i);

        setTag(updatedTags)
        // tags.splice(index,1);		
    };
    return (
        <>
            {lineageDtlList.map(lineage => (
                <div key={lineage?.id} >
                    <Grid container spacing={2} sx={{ borderRadius: '4px', border: '1px solid lightgrey', }}>
                        <Grid item xs={6}>
                            <Typography variant='body2' sx={{ p: '4px', fontWeight: 'bold', fontSize: '16px' }}>{lineage?.title}</Typography>
                            <Typography variant='subtitle1' sx={{ p: '4px', color: 'grey', fontSize: '16px' }}>
                                {lineage?.desc}</Typography>

                            <Stack>
                                <Typography variant='subtitle1' sx={{ p: '4px', fontWeight: 'bold', fontSize: '14px', mt: '8px' }}>Owners</Typography>
                                <Stack direction={'row'}>
                                    {lineage.ownerList.map(owner => (
                                        <Stack sx={{ m: '4px' }} key={owner?.ownerId}>
                                            <Typography variant='subtitle1' sx={{ p: '4px', fontSize: '14px', mt: '8px' }}>{owner.ownerRole}</Typography>
                                            <Stack direction={'row'} sx={{ backgroundColor: '#e3f8f0', borderRadius: '2pc', p: '6px', my: '8px' }} >
                                                <Avatar
                                                    alt="User"
                                                    src={owner.ownerProfile}
                                                    sx={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: '50%',
                                                    }}
                                                />
                                                <Typography variant='subtitle1' sx={{ p: '4px', fontSize: '15px', mt: '6px', width: '140px', fontWeight: 'semibold' }}>
                                                    {owner.ownerName}</Typography>
                                            </Stack>
                                        </Stack>
                                    ))}
                                    <Stack>

                                    </Stack>
                                </Stack>
                            </Stack>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant='body2' sx={{ p: '4px', fontWeight: 'bold', fontSize: '14px' }}>Tags</Typography>
                            {tags.map((tag, index) => (
                                <Chip label={`${tag.tagKey} >> ${tag.tagValue}`} variant="outlined" style={{ fontSize: '12px', borderRadius: '5px', background: '#eeeeee', marginLeft: `${index == 0 ? '' : '16px'}` }}
                                    onDelete={() => handleTagDelete(index)} />
                            ))}
                        </Grid>
                    </Grid>
                    <br></br>
                </div>
            ))}
        </>
    )
}