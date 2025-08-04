import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import PasswordTester from './components/PasswordTester';

export default function App() {
    const isAuthenticated = !!localStorage.getItem('adminToken');

    return (
        <BrowserRouter>
        <Routes>
        <Route
        path="/admin"
        element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/admin/login" />}
        />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="*" element={<Navigate to="/admin/login" />} />

        <Route path="/" element={<PasswordTester />} />
        <Route path="/admin" element={
            localStorage.getItem('adminToken') ? <AdminDashboard /> : <Navigate to="/admin/login" />
        }/>
        <Route path="/admin/login" element={<AdminLogin />} />
        </Routes>
        </BrowserRouter>
    );
}
