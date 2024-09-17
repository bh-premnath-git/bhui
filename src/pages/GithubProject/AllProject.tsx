import React, { useEffect } from 'react';
import ManageProjectHeader from './ManageProjectHeader';
import ProTableData from './ProTableData';
import { useDispatch, useSelector } from 'react-redux';
import { getGitProject } from '../../Redux/ProjectSlice';
import { RootState } from '../../Redux/store';

export default function AllProject() {
    const dispatch = useDispatch();
    const { param, gitProjectList } = useSelector((state: RootState) => state.projectApi);

    useEffect(() => {
        // if (gitProjectList.length === 0) {
            dispatch(getGitProject(param));
        // }
        console.log(gitProjectList)
    }, [dispatch]);

    return (
        <div className="m-auto px-4">
            <ManageProjectHeader />
            <br />
            <ProTableData />
        </div>
    );
}
