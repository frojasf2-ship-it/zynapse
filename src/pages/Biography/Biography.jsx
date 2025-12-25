import React from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    Avatar,
    Stack,
    Chip
} from '@mui/material';
import {
    Target,
    Eye,
    Heart,
    Users,
    Lightbulb,
    Rocket,
    Shield,
    Zap
} from 'lucide-react';

const Biography = () => {
    const values = [
        {
            icon: <Lightbulb size={32} />,
            title: 'Innovación',
            description: 'Buscamos constantemente nuevas formas de resolver problemas y mejorar la experiencia del usuario.',
            color: '#ffd54f'
        },
        {
            icon: <Users size={32} />,
            title: 'Colaboración',
            description: 'Creemos en el poder de la comunidad y el trabajo en equipo para alcanzar grandes objetivos.',
            color: '#4fc3f7'
        },
        {
            icon: <Shield size={32} />,
            title: 'Calidad',
            description: 'Nos comprometemos a entregar productos de la más alta calidad con atención al detalle.',
            color: '#81c784'
        },
        {
            icon: <Zap size={32} />,
            title: 'Eficiencia',
            description: 'Optimizamos cada proceso para ofrecer soluciones rápidas y efectivas.',
            color: '#ff8a65'
        }
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            {/* Hero Section */}
            <Box sx={{ mb: 8, textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#202124', mb: 2 }}>
                    Sobre <Box component="span" sx={{ color: '#1976d2' }}>zynapse</Box>
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto', lineHeight: 1.8 }}>
                    Somos una comunidad de desarrolladores, investigadores y creadores apasionados por la tecnología
                    y la innovación. Nuestra misión es construir herramientas que marquen la diferencia.
                </Typography>
            </Box>

            {/* Mission & Vision */}
            <Box sx={{ maxWidth: 900, mx: 'auto', mb: 8 }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Card
                            elevation={0}
                            sx={{
                                border: '2px solid #e3f2fd',
                                borderRadius: 4,
                                height: '100%',
                                bgcolor: '#fafafa',
                                transition: 'transform 0.3s, box-shadow 0.3s',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: '0 12px 24px rgba(25, 118, 210, 0.15)'
                                }
                            }}
                        >
                            <CardContent sx={{ p: 4, textAlign: 'center' }}>
                                <Box
                                    sx={{
                                        width: 64,
                                        height: 64,
                                        borderRadius: '50%',
                                        bgcolor: '#e3f2fd',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mx: 'auto',
                                        mb: 2
                                    }}
                                >
                                    <Target size={32} color="#1976d2" />
                                </Box>
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                                    Nuestra Misión
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                                    Desarrollar soluciones tecnológicas innovadoras que empoderen a individuos y organizaciones,
                                    facilitando la colaboración, el aprendizaje continuo y el crecimiento en la era digital.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card
                            elevation={0}
                            sx={{
                                border: '2px solid #f3e5f5',
                                borderRadius: 4,
                                height: '100%',
                                bgcolor: '#fafafa',
                                transition: 'transform 0.3s, box-shadow 0.3s',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: '0 12px 24px rgba(156, 39, 176, 0.15)'
                                }
                            }}
                        >
                            <CardContent sx={{ p: 4, textAlign: 'center' }}>
                                <Box
                                    sx={{
                                        width: 64,
                                        height: 64,
                                        borderRadius: '50%',
                                        bgcolor: '#f3e5f5',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mx: 'auto',
                                        mb: 2
                                    }}
                                >
                                    <Eye size={32} color="#9c27b0" />
                                </Box>
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                                    Nuestra Visión
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                                    Ser una plataforma de referencia global donde la comunidad tecnológica se reúne para
                                    compartir conocimiento, crear proyectos innovadores y construir el futuro digital juntos.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            {/* Values Section */}
            <Box sx={{ mb: 6, textAlign: 'center', maxWidth: 1000, mx: 'auto' }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#202124', mb: 2 }}>
                    Nuestros Valores
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 5 }}>
                    Los principios que guían cada decisión y proyecto que emprendemos
                </Typography>

                <Grid container spacing={3} justifyContent="center">
                    {values.map((value, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Card
                                elevation={0}
                                sx={{
                                    border: '1px solid #e0e0e0',
                                    borderRadius: 3,
                                    height: '100%',
                                    transition: 'all 0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                        borderColor: value.color
                                    }
                                }}
                            >
                                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                                    <Box
                                        sx={{
                                            width: 64,
                                            height: 64,
                                            borderRadius: '50%',
                                            bgcolor: `${value.color}20`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mx: 'auto',
                                            mb: 2
                                        }}
                                    >
                                        <Box sx={{ color: value.color }}>
                                            {value.icon}
                                        </Box>
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                        {value.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                        {value.description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* What We Do Section */}
            <Box sx={{ mt: 8, textAlign: 'center', maxWidth: 900, mx: 'auto' }}>
                <Card
                    elevation={0}
                    sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 4,
                        p: 6,
                        color: 'white'
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                        <Box
                            sx={{
                                width: 72,
                                height: 72,
                                borderRadius: '50%',
                                bgcolor: 'rgba(255,255,255,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Rocket size={36} />
                        </Box>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
                        ¿Qué Hacemos?
                    </Typography>
                    <Typography variant="h6" sx={{ maxWidth: 800, mx: 'auto', lineHeight: 1.8, opacity: 0.95 }}>
                        Creamos espacios de colaboración, desarrollamos herramientas innovadoras y compartimos
                        conocimiento para impulsar el crecimiento de la comunidad tecnológica. Desde investigación
                        técnica hasta aplicaciones prácticas, cada proyecto está diseñado para generar impacto real.
                    </Typography>
                    <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
                        <Chip
                            icon={<Heart size={16} />}
                            label="Código Abierto"
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                fontWeight: 600,
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                            }}
                        />
                        <Chip
                            icon={<Users size={16} />}
                            label="Comunidad"
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                fontWeight: 600,
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                            }}
                        />
                        <Chip
                            icon={<Lightbulb size={16} />}
                            label="Innovación"
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                fontWeight: 600,
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                            }}
                        />
                    </Stack>
                </Card>
            </Box>
        </Container>
    );
};

export default Biography;
