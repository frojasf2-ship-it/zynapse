import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Button,
    Paper,
    List,
    ListItem,
    ListItemText,
    Divider,
    Chip,
    Avatar,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    IconButton,
    LinearProgress
} from '@mui/material';
import { MessageSquare, Plus, MessageCircle, Clock, Image as ImageIcon, X, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db, storage } from '../../firebase/firebaseConfig';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';

const ForumList = () => {
    const { currentUser, isAdmin, isModerator } = useAuth();
    const navigate = useNavigate();
    const [threads, setThreads] = useState([]);
    const [open, setOpen] = useState(false);
    const [newThread, setNewThread] = useState({ title: '', content: '' });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const q = query(collection(db, 'threads'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const threadsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setThreads(threadsData);
        });
        return unsubscribe;
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleCreateThread = async () => {
        if (!newThread.title || !newThread.content) return;

        setUploading(true);
        let imageUrl = '';

        try {
            if (imageFile) {
                const storageRef = ref(storage, `forum_images/${Date.now()}_${imageFile.name}`);
                const uploadTask = uploadBytesResumable(storageRef, imageFile);

                await new Promise((resolve, reject) => {
                    uploadTask.on('state_changed',
                        (snapshot) => {
                            const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            setProgress(prog);
                        },
                        (error) => reject(error),
                        async () => {
                            imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve();
                        }
                    );
                });
            }

            await addDoc(collection(db, 'threads'), {
                title: newThread.title,
                content: newThread.content,
                imageUrl: imageUrl,
                authorId: currentUser.uid,
                authorName: currentUser.displayName || 'Usuario Anónimo',
                authorPhoto: currentUser.photoURL || '',
                createdAt: serverTimestamp(),
                commentCount: 0
            });

            setOpen(false);
            setNewThread({ title: '', content: '' });
            setImageFile(null);
            setImagePreview(null);
            setProgress(0);
        } catch (error) {
            console.error("Error creating thread: ", error);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteThread = async (e, threadId) => {
        e.stopPropagation();
        if (window.confirm('¿Estás seguro de que deseas eliminar este tema?')) {
            try {
                await deleteDoc(doc(db, 'threads', threadId));
            } catch (error) {
                console.error("Error deleting thread: ", error);
            }
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#202124', mb: 1 }}>
                    Foro de Discusión
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Comparte ideas, resuelve dudas y colabora con otros arquitectos del código.
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                {currentUser ? (
                    <Button
                        variant="contained"
                        startIcon={<Plus size={20} />}
                        onClick={() => setOpen(true)}
                        sx={{ borderRadius: 8, px: 3, textTransform: 'none', fontWeight: 600 }}
                    >
                        Nuevo Tema
                    </Button>
                ) : (
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/login')}
                        sx={{ borderRadius: 8, px: 3, textTransform: 'none', fontWeight: 600 }}
                    >
                        Inicia sesión para participar
                    </Button>
                )}
            </Box>

            <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 4, overflow: 'hidden' }}>

                <List sx={{ p: 0 }}>
                    {threads.length > 0 ? (
                        threads.map((thread, index) => (
                            <React.Fragment key={thread.id}>
                                <ListItem
                                    alignItems="flex-start"
                                    onClick={() => navigate(`/foro/${thread.id}`)}
                                    sx={{
                                        p: 3,
                                        '&:hover': { bgcolor: '#f8f9fa' },
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s'
                                    }}
                                >
                                    <Avatar
                                        src={thread.authorPhoto}
                                        alt={thread.authorName}
                                        sx={{ mr: 2, mt: 0.5 }}
                                    />
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                                                    {thread.title}
                                                </Typography>
                                                <Chip
                                                    size="small"
                                                    icon={<MessageCircle size={14} />}
                                                    label={thread.commentCount || 0}
                                                    variant="outlined"
                                                    sx={{ ml: 2, fontWeight: 600 }}
                                                />
                                            </Box>
                                        }
                                        secondary={
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                <Typography variant="body2" color="text.primary" sx={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    lineHeight: 1.6
                                                }}>
                                                    {thread.content}
                                                </Typography>

                                                {thread.imageUrl && (
                                                    <Box
                                                        component="img"
                                                        src={thread.imageUrl}
                                                        sx={{
                                                            width: '100%',
                                                            maxHeight: '200px',
                                                            objectFit: 'cover',
                                                            borderRadius: 2,
                                                            mt: 1,
                                                            border: '1px solid #eee'
                                                        }}
                                                    />
                                                )}

                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                                        Por {thread.authorName}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <Clock size={12} color="#5f6368" />
                                                        <Typography variant="caption" color="text.secondary">
                                                            {thread.createdAt?.toDate().toLocaleDateString() || 'Hace un momento'}
                                                        </Typography>
                                                    </Box>
                                                    {(isAdmin || isModerator) && (
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={(e) => handleDeleteThread(e, thread.id)}
                                                            sx={{ ml: 'auto', p: 0.5, '&:hover': { bgcolor: '#ffebee' } }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </IconButton>
                                                    )}
                                                </Box>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                                {index < threads.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        ))
                    ) : (
                        <Box sx={{ p: 8, textAlign: 'center' }}>
                            <MessageSquare size={48} color="#dadce0" style={{ marginBottom: '16px' }} />
                            <Typography color="text.secondary">
                                No hay temas aún. ¡Sé el primero en iniciar una conversación!
                            </Typography>
                        </Box>
                    )}
                </List>
            </Paper>

            {/* DIALOG FOR NEW THREAD */}
            <Dialog open={open} onClose={() => !uploading && setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 700 }}>Iniciar Nueva Conversación</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField
                            label="Título del tema"
                            fullWidth
                            variant="outlined"
                            value={newThread.title}
                            onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                            placeholder="Ej: ¿Cómo optimizar Firestore para una red social?"
                            disabled={uploading}
                        />
                        <TextField
                            label="¿Qué tienes en mente?"
                            fullWidth
                            multiline
                            rows={6}
                            variant="outlined"
                            value={newThread.content}
                            onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                            disabled={uploading}
                        />

                        <Box>
                            <input accept="image/*" style={{ display: 'none' }} id="raised-button-file" type="file" onChange={handleImageChange} disabled={uploading} />
                            <label htmlFor="raised-button-file">
                                <Button variant="outlined" component="span" startIcon={<ImageIcon size={20} />} sx={{ textTransform: 'none', borderRadius: 4 }}>
                                    Adjuntar Imagen
                                </Button>
                            </label>

                            {imagePreview && (
                                <Box sx={{ mt: 2, position: 'relative', width: 'fit-content' }}>
                                    <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />
                                    <IconButton size="small" onClick={removeImage} sx={{ position: 'absolute', top: -10, right: -10, bgcolor: 'white', boxShadow: 1 }}>
                                        <X size={16} />
                                    </IconButton>
                                </Box>
                            )}
                        </Box>

                        {uploading && (
                            <Box sx={{ width: '100%' }}>
                                <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                                    Subiendo contenido... {Math.round(progress)}%
                                </Typography>
                                <LinearProgress variant="determinate" value={progress} />
                            </Box>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpen(false)} sx={{ textTransform: 'none', color: 'text.secondary' }} disabled={uploading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleCreateThread} variant="contained" disabled={!newThread.title || !newThread.content || uploading} sx={{ borderRadius: 8, px: 4, textTransform: 'none', fontWeight: 600 }}>
                        Publicar Hilo
                    </Button>
                </DialogActions>
            </Dialog>
        </Container >
    );
};

export default ForumList;
