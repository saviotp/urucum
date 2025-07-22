/*
    Para fazer esse sistema de autenticação, vi esse vídeo:
    https://www.youtube.com/watch?v=WpIDez53SK4
*/

import React, { createContext, useEffect, useState, useContext } from 'react';

import { auth } from '../../Firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContexto = createContext();

export function usarAuth() {
    return useContext(AuthContexto);
}

export default function AuthProvider({ children }) {
    const [usuarioAtual, setUsuarioAtual] = useState(null);
    const [usuarioLogado, setUsuarioLogado] = useState(false);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        const deslogar = onAuthStateChanged(auth, inicializarUsuario);
        return deslogar;
    }, []); // Esse daqui estava no slide; quando há os brackets vazios, ele executa apenas uma vez

    async function inicializarUsuario(usuario) {
        if (usuario) {
            setUsuarioAtual({ ...usuario });
            setUsuarioLogado(true);
        } else {
            setUsuarioAtual(null);
            setUsuarioLogado(false);
        }
        setCarregando(false);
    }

    const valor = {
        usuarioAtual,
        usuarioLogado,
        carregando
    };

    return (
        <AuthContexto.Provider value={valor}>
            {!carregando && children}
        </AuthContexto.Provider>
    )
}