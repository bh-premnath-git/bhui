import { useLayoutEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ element }: { element: JSX.Element }) => {
    const [token, setToken] = useState<string | null>(null);

    useLayoutEffect(() => {
        const storedToken = sessionStorage.getItem("token");
        setToken(storedToken);
    }, []);

    return token ? <Navigate to="/dashboard" replace /> : element;
};
export default ProtectedRoute