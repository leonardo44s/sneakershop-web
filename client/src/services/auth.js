import { apiPost } from './api.js';

const STORAGE_KEY = 'sneakershop_auth';

export function getAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAdmin() {
  return getAuth()?.user?.rol === 'admin';
}

export async function login(correo, contrasena) {
  const data = await apiPost('/auth/login', { correo, contrasena });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data.user;
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY);
}