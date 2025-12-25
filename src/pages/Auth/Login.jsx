import React from 'react';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const { loginWithGoogle, currentUser } = useAuth();
    const navigate = useNavigate();

    if (currentUser) {
        navigate('/');
    }

    return (
        <Container maxWidth="xs">
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2, textAlign: 'center' }}>
                    <Typography component="h1" variant="h5" gutterBottom>
                        Iniciar Sesión
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Accede para comentar, calificar y explorar contenido exclusivo.
                    </Typography>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={loginWithGoogle}
                        sx={{ mt: 1, mb: 2, textTransform: 'none', py: 1.5 }}
                    >
                        Continuar con Google
                    </Button>
                </Paper>
            </Box>
        </Container>
    );
};

export default Login;
