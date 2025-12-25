import React from 'react';
import {
    Container,
    Typography,
    Box,
    Button,
    Grid,
    Card,
    CardContent,
    Stack
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    BookOpen,
    Newspaper,
    Code
} from 'lucide-react';

const Home = () => {
    const features = [
        {
            title: 'Investigación Técnica',
            desc: 'Explora nuestros últimos hallazgos en tecnología y software.',
            icon: <BookOpen size={32} color="#1976d2" />,
            link: '/investigacion'
        },
        {
            title: 'Noticias y Novedades',
            desc: 'Mantente al día con las noticias más relevantes del sector.',
            icon: <Newspaper size={32} color="#1976d2" />,
            link: '/noticias'
        },
        {
            title: 'Desarrollo de Apps',
            desc: 'Software innovador diseñado para resolver problemas reales.',
            icon: <Code size={32} color="#1976d2" />,
            link: '/desarrollo'
        }
    ];

    return (
        <Box>
            {/* HERO SECTION */}
            <Box
                sx={{
                    bgcolor: '#f8f9fa',
                    pt: 12,
                    pb: 10,
                    borderBottom: '1px solid #e0e0e0',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <Container maxWidth="md">
                    <Stack spacing={4} alignItems="center" textAlign="center">
                        <Typography
                            variant="h2"
                            component="h1"
                            sx={{
                                fontWeight: 800,
                                color: '#202124',
                                letterSpacing: '-0.02em',
                                fontSize: { xs: '2.5rem', md: '3.75rem' }
                            }}
                        >
                            Bienvenido a <Box component="span" sx={{ color: '#1976d2' }}>zynapse</Box>
                        </Typography>
                        <Typography
                            variant="h5"
                            color="text.secondary"
                            sx={{ maxWidth: '600px', lineHeight: 1.6 }}
                        >
                            Una plataforma de comunidad.
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <Button
                                variant="contained"
                                size="large"
                                component={Link}
                                to="/desarrollo"
                                sx={{
                                    borderRadius: '24px',
                                    px: 4,
                                    py: 1.5,
                                    textTransform: 'none',
                                    fontSize: '1.1rem',
                                    boxShadow: 'none'
                                }}
                            >
                                Explorar Apps
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                component={Link}
                                to="/conocenos"
                                sx={{
                                    borderRadius: '24px',
                                    px: 4,
                                    py: 1.5,
                                    textTransform: 'none',
                                    fontSize: '1.1rem',
                                    borderColor: '#dadce0',
                                    color: '#3c4043'
                                }}
                            >
                                Conócenos
                            </Button>
                        </Stack>
                    </Stack>
                </Container>
            </Box>

            {/* FEATURES SECTION */}
            <Container maxWidth="lg" sx={{ py: 10 }}>
                <Grid container spacing={4}>
                    {features.map((feature, index) => (
                        <Grid item xs={12} md={4} key={index}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderRadius: 4,
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
                                    }
                                }}
                            >
                                <CardContent sx={{ p: 4, flexGrow: 1 }}>
                                    <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                                    <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                                        {feature.title}
                                    </Typography>
                                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                                        {feature.desc}
                                    </Typography>
                                    <Button
                                        component={Link}
                                        to={feature.link}
                                        endIcon={<ArrowRight size={18} />}
                                        sx={{ textTransform: 'none', fontWeight: 600, p: 0 }}
                                    >
                                        Ver más
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* CALL TO ACTION */}
            <Box sx={{ bgcolor: '#1976d2', color: 'white', py: 8 }}>
                <Container maxWidth="md" sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                        ¿Listo para llevar tu proyecto al siguiente nivel?
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                        Únete a nuestra comunidad de suscriptores para recibir contenido exclusivo.
                    </Typography>
                    <Button
                        variant="contained"
                        sx={{
                            bgcolor: 'white',
                            color: '#1976d2',
                            borderRadius: '24px',
                            px: 6,
                            py: 2,
                            fontWeight: 700,
                            textTransform: 'none',
                            '&:hover': {
                                bgcolor: '#f1f3f4'
                            }
                        }}
                    >
                        Registrarse Gratis
                    </Button>
                </Container>
            </Box>
        </Box>
    );
};

export default Home;
