import { RootState } from '@/store'
import { useAppSelector } from '@/hooks/uaeRedux'

const UserEdit = () => {
    const user = useAppSelector((state: RootState) => state.users.selectedUser);
    return (
        <div>UserEdit</div>
    )
}

export default UserEdit