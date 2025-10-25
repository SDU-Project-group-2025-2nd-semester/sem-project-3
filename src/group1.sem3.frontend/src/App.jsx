import { Routes, Route } from 'react-router-dom';
import SignInPage from './pages/auth/SignInPage';

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<SignInPage />} />
        </Routes>
    );
}
