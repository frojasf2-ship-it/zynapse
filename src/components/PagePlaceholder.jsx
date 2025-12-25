import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const PagePlaceholder = ({ title }) => {
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
                <Typography variant="h4" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="body1">
                    Esta sección está en desarrollo. Pronto verás contenido aquí con estilo Material Design.
                </Typography>
            </Box>
        </Container>
    );
};

export default PagePlaceholder;
