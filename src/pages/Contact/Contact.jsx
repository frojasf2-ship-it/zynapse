import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    TextField,
    Button,
    Stack
} from '@mui/material';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { db } from '../../firebase/firebaseConfig';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const Contact = () => {
    const [contactInfo, setContactInfo] = useState({
        email: '',
        phone: '',
        address: ''
    });
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    useEffect(() => {
        const fetchContactInfo = async () => {
            try {
                const docRef = doc(db, 'settings', 'contact');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setContactInfo(docSnap.data());
                }
            } catch (error) {
                console.error('Error fetching contact info:', error);
            }
        };

        fetchContactInfo();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Guardar mensaje en Firestore
            await addDoc(collection(db, 'contact_messages'), {
                name: formData.name,
                email: formData.email,
                message: formData.message,
                status: 'new',
                createdAt: serverTimestamp()
            });

            alert('✅ Mensaje enviado exitosamente. Te contactaremos pronto.');
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            console.error('Error sending message:', error);
            alert('❌ Error al enviar el mensaje. Por favor intenta de nuevo.');
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Box sx={{ mb: 6, textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#202124', mb: 2 }}>
                    Contáctanos
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                    ¿Tienes alguna pregunta? Estamos aquí para ayudarte.
                </Typography>
            </Box>

            <Box sx={{ maxWidth: 900, mx: 'auto' }}>
                <Grid container spacing={4} justifyContent="center">
                    {/* Contact Information */}
                    {(contactInfo.email || contactInfo.phone || contactInfo.address) && (
                        <Grid item xs={12}>
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
                                Información de Contacto
                            </Typography>

                            <Stack spacing={3} sx={{ maxWidth: 600, mx: 'auto' }}>
                                {contactInfo.email && (
                                    <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3 }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Box
                                                    sx={{
                                                        width: 48,
                                                        height: 48,
                                                        borderRadius: '50%',
                                                        bgcolor: '#e3f2fd',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <Mail size={24} color="#1976d2" />
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Email
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                        {contactInfo.email}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                )}

                                {contactInfo.phone && (
                                    <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3 }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Box
                                                    sx={{
                                                        width: 48,
                                                        height: 48,
                                                        borderRadius: '50%',
                                                        bgcolor: '#e8f5e9',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <Phone size={24} color="#2e7d32" />
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Teléfono
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                        {contactInfo.phone}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                )}

                                {contactInfo.address && (
                                    <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3 }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Box
                                                    sx={{
                                                        width: 48,
                                                        height: 48,
                                                        borderRadius: '50%',
                                                        bgcolor: '#fff3e0',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <MapPin size={24} color="#ed6c02" />
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Dirección
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                        {contactInfo.address}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                )}
                            </Stack>
                        </Grid>
                    )}

                    {/* Contact Form */}
                    <Grid item xs={12}>
                        <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 4, p: 2, maxWidth: 600, mx: 'auto' }}>
                            <CardContent>
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
                                    Envíanos un Mensaje
                                </Typography>

                                <form onSubmit={handleSubmit}>
                                    <Stack spacing={3}>
                                        <TextField
                                            fullWidth
                                            label="Nombre"
                                            variant="outlined"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />

                                        <TextField
                                            fullWidth
                                            label="Email"
                                            type="email"
                                            variant="outlined"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />

                                        <TextField
                                            fullWidth
                                            label="Mensaje"
                                            multiline
                                            rows={6}
                                            variant="outlined"
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            required
                                        />

                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            endIcon={<Send size={20} />}
                                            sx={{
                                                borderRadius: 3,
                                                py: 1.5,
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                fontSize: '1rem'
                                            }}
                                        >
                                            Enviar Mensaje
                                        </Button>
                                    </Stack>
                                </form>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default Contact;
