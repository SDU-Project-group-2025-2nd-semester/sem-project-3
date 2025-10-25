import { Routes, Route } from 'react-router-dom';
import SignInPage from './pages/auth/SignInPage';
import SignUpPage from './pages/auth/SignUpPage';

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<SignInPage />} />
            <Route path="/signuppage" element={<SignUpPage />} />
        </Routes>
    );
}
