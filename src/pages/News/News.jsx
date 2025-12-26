import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Fab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Stack
} from '@mui/material';
import { Newspaper, Calendar, User, Plus } from 'lucide-react';
import { db, storage } from '../../firebase/firebaseConfig';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../../context/AuthContext';

const News = () => {
    const [news, setNews] = useState([]);
    const { currentUser, canPublishNews } = useAuth();
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', content: '', imageUrl: '', youtubeUrl: '' });
    const [uploading, setUploading] = useState(false);

    // Extract YouTube video ID from various URL formats
    const getYouTubeVideoId = (url) => {
        if (!url) return null;
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : null;
    };

    useEffect(() => {
        const q = query(collection(db, 'news_articles'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNews(newsData);
        });
        return unsubscribe;
    }, []);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const storageRef = ref(storage, `news_articles/${Date.now()}_${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            await new Promise((resolve, reject) => {
                uploadTask.on('state_changed', null, reject, async () => {
                    const url = await getDownloadURL(uploadTask.snapshot.ref);
                    setFormData(prev => ({ ...prev, imageUrl: url }));
                    resolve();
                });
            });
        } catch (error) {
            console.error("Error uploading image: ", error);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.content) return;

        try {
            await addDoc(collection(db, 'news_articles'), {
                ...formData,
                createdAt: serverTimestamp(),
                authorId: currentUser.uid,
                authorName: currentUser.displayName || 'Usuario Anónimo'
            });
            setOpenDialog(false);
            setFormData({ title: '', description: '', content: '', imageUrl: '', youtubeUrl: '' });
        } catch (error) {
            console.error("Error creating article: ", error);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Box sx={{ mb: 6, textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#202124', mb: 2 }}>
                    Noticias y Novedades
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                    Mantente al día con las últimas noticias y actualizaciones del equipo zynapse.
                </Typography>
            </Box>

            {news.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Newspaper size={64} color="#dadce0" style={{ marginBottom: '16px' }} />
                    <Typography color="text.secondary">
                        No hay noticias disponibles aún.
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={4}>
                    {news.map((article) => (
                        <Grid item xs={12} md={6} key={article.id}>
                            <Card
                                elevation={0}
                                sx={{
                                    border: '1px solid #e0e0e0',
                                    borderRadius: 4,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                                    }
                                }}
                            >
                                {article.imageUrl && (
                                    <CardMedia
                                        component="img"
                                        height="240"
                                        image={article.imageUrl}
                                        alt={article.title}
                                        sx={{ objectFit: 'cover' }}
                                    />
                                )}
                                {article.youtubeUrl && getYouTubeVideoId(article.youtubeUrl) && (
                                    <Box sx={{ position: 'relative', paddingTop: '56.25%', width: '100%' }}>
                                        <iframe
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                border: 'none'
                                            }}
                                            src={`https://www.youtube.com/embed/${getYouTubeVideoId(article.youtubeUrl)}`}
                                            title={article.title}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </Box>
                                )}
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                                        {article.title}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                        {article.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                        {article.authorName && (
                                            <Chip
                                                icon={<User size={12} />}
                                                label={article.authorName}
                                                size="small"
                                                variant="outlined"
                                            />
                                        )}
                                        {article.createdAt && (
                                            <Chip
                                                icon={<Calendar size={12} />}
                                                label={article.createdAt.toDate().toLocaleDateString()}
                                                size="small"
                                                variant="outlined"
                                            />
                                        )}
                                    </Box>
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                        {article.content}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* FAB for users with publish permission */}
            {canPublishNews() && (
                <Fab
                    color="primary"
                    aria-label="add"
                    sx={{ position: 'fixed', bottom: 32, right: 32 }}
                    onClick={() => setOpenDialog(true)}
                >
                    <Plus size={24} />
                </Fab>
            )}

            {/* Create Article Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Publicar Noticia</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        <TextField
                            label="Título"
                            fullWidth
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                        <TextField
                            label="Descripción breve"
                            fullWidth
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                        <TextField
                            label="Contenido"
                            fullWidth
                            multiline
                            rows={6}
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        />
                        <TextField
                            label="URL de YouTube (opcional)"
                            fullWidth
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={formData.youtubeUrl}
                            onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                            helperText="Pega el enlace de un video de YouTube para embutirlo en la noticia"
                        />
                        <Box>
                            <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="image-upload"
                                type="file"
                                onChange={handleImageUpload}
                            />
                            <label htmlFor="image-upload">
                                <Button variant="outlined" component="span" disabled={uploading}>
                                    {uploading ? 'Subiendo...' : 'Subir Imagen'}
                                </Button>
                            </label>
                            {formData.imageUrl && (
                                <Box sx={{ mt: 2 }}>
                                    <img src={formData.imageUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />
                                </Box>
                            )}
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={!formData.title || !formData.content}>
                        Publicar
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default News;
