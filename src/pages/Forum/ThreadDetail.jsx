import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Avatar,
    Divider,
    TextField,
    Button,
    List,
    ListItem,
    Breadcrumbs,
    IconButton,
    LinearProgress
} from '@mui/material';
import {
    ArrowLeft,
    Send,
    Clock,
    ChevronRight,
    Image as ImageIcon,
    X,
    Trash2
} from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db, storage } from '../../firebase/firebaseConfig';
import {
    doc,
    getDoc,
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    updateDoc,
    increment,
    deleteDoc
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../../context/AuthContext';

const ThreadDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser, isAdmin, isModerator } = useAuth();

    const [thread, setThread] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const fetchThread = async () => {
            const docRef = doc(db, 'threads', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setThread({ id: docSnap.id, ...docSnap.data() });
            } else {
                navigate('/foro');
            }
            setLoading(false);
        };

        fetchThread();

        const q = query(
            collection(db, 'comments'),
            where('threadId', '==', id),
            orderBy('createdAt', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const commentsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setComments(commentsData);
        });

        return unsubscribe;
    }, [id, navigate]);

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

    const handlePostComment = async () => {
        if (!newComment.trim() && !imageFile) return;

        setUploading(true);
        let imageUrl = '';

        try {
            if (imageFile) {
                const storageRef = ref(storage, `comment_images/${Date.now()}_${imageFile.name}`);
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

            await addDoc(collection(db, 'comments'), {
                threadId: id,
                content: newComment,
                imageUrl: imageUrl,
                authorId: currentUser.uid,
                authorName: currentUser.displayName || 'Usuario Anónimo',
                authorPhoto: currentUser.photoURL || '',
                createdAt: serverTimestamp()
            });

            await updateDoc(doc(db, 'threads', id), {
                commentCount: increment(1)
            });

            setNewComment('');
            setImageFile(null);
            setImagePreview(null);
            setProgress(0);
        } catch (error) {
            console.error("Error posting comment: ", error);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este comentario?')) {
            try {
                await deleteDoc(doc(db, 'comments', commentId));
                await updateDoc(doc(db, 'threads', id), {
                    commentCount: increment(-1)
                });
            } catch (error) {
                console.error("Error deleting comment: ", error);
            }
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Button
                component={Link}
                to="/foro"
                startIcon={<ArrowLeft size={18} />}
                sx={{ mb: 3, textTransform: 'none' }}
            >
                Volver al foro
            </Button>

            {/* THREAD MAIN POST */}
            <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 4, border: '1px solid #e0e0e0' }}>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar src={thread?.authorPhoto} alt={thread?.authorName} sx={{ width: 48, height: 48, mr: 2 }} />
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>{thread?.authorName}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Clock size={14} color="#5f6368" />
                                <Typography variant="caption" color="text.secondary">
                                    {thread?.createdAt?.toDate().toLocaleString() || 'Recientemente'}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                    {(isAdmin || isModerator) && (
                        <IconButton color="error" size="small" onClick={() => navigate('/foro')}>
                            {/* Deletion logic is handled in List but for detail we can just return back or implement same logic */}
                            <Trash2 size={20} />
                        </IconButton>
                    )}
                </Box>

                <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, color: '#202124' }}>
                    {thread?.title}
                </Typography>

                <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#3c4043', whiteSpace: 'pre-wrap', mb: 3 }}>
                    {thread?.content}
                </Typography>

                {
                    thread?.imageUrl && (
                        <Box component="img" src={thread.imageUrl} sx={{ width: '100%', borderRadius: 3, border: '1px solid #eee' }} />
                    )
                }
            </Paper >

            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, px: 2 }}>
                Respuestas ({comments.length})
            </Typography>

            {/* COMMENTS LIST */}
            <List sx={{ mb: 4 }}>
                {comments.map((comment) => (
                    <Paper key={comment.id} elevation={0} sx={{ p: 3, mb: 2, borderRadius: 3, border: '1px solid #f1f3f4', bgcolor: '#f8f9fa' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar src={comment.authorPhoto} sx={{ width: 32, height: 32, mr: 1.5 }} />
                                <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{comment.authorName}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {comment.createdAt?.toDate().toLocaleString() || 'Hace un momento'}
                                    </Typography>
                                </Box>
                            </Box>
                            {(isAdmin || isModerator) && (
                                <IconButton size="small" color="error" onClick={() => handleDeleteComment(comment.id)}>
                                    <Trash2 size={16} />
                                </IconButton>
                            )}
                        </Box>
                        <Typography variant="body2" sx={{ color: '#3c4043', lineHeight: 1.6, mb: comment.imageUrl ? 2 : 0 }}>
                            {comment.content}
                        </Typography>
                        {comment.imageUrl && (
                            <Box component="img" src={comment.imageUrl} sx={{ maxWidth: '100%', maxHeight: '400px', borderRadius: 2, border: '1px solid #eee' }} />
                        )}
                    </Paper>
                ))}
            </List>

            {/* ADD COMMENT */}
            {
                currentUser ? (
                    <Paper elevation={1} sx={{ p: 3, borderRadius: 4, position: 'sticky', bottom: 20 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Avatar src={currentUser.photoURL} />
                            <Box sx={{ flexGrow: 1 }}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    placeholder="Escribe tu respuesta..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    sx={{ mb: 2 }}
                                    disabled={uploading}
                                />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <input accept="image/*" style={{ display: 'none' }} id="comment-image" type="file" onChange={handleImageChange} disabled={uploading} />
                                        <label htmlFor="comment-image">
                                            <Button variant="outlined" component="span" startIcon={<ImageIcon size={18} />} sx={{ textTransform: 'none', borderRadius: 4 }}>
                                                Imagen
                                            </Button>
                                        </label>
                                    </Box>
                                    <Button variant="contained" endIcon={<Send size={18} />} onClick={handlePostComment} disabled={(!newComment.trim() && !imageFile) || uploading} sx={{ borderRadius: 6, px: 4, textTransform: 'none', fontWeight: 600 }}>
                                        Responder
                                    </Button>
                                </Box>

                                {imagePreview && (
                                    <Box sx={{ mt: 2, position: 'relative', width: 'fit-content' }}>
                                        <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px' }} />
                                        <IconButton size="small" onClick={removeImage} sx={{ position: 'absolute', top: -10, right: -10, bgcolor: 'white', boxShadow: 1 }}>
                                            <X size={14} />
                                        </IconButton>
                                    </Box>
                                )}

                                {uploading && (
                                    <Box sx={{ mt: 2 }}>
                                        <LinearProgress variant="determinate" value={progress} />
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Paper>
                ) : (
                    <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f1f3f4', borderRadius: 4 }}>
                        <Typography color="text.secondary">Inicia sesión para participar en la conversación.</Typography>
                        <Button component={Link} to="/login" variant="outlined" sx={{ mt: 2, borderRadius: 5, textTransform: 'none' }}>Ingresar ahora</Button>
                    </Paper>
                )
            }
        </Container >
    );
};

export default ThreadDetail;
