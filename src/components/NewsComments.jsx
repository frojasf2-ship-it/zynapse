import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Stack,
    Avatar,
    Divider,
    Collapse,
    IconButton,
    Badge,
    Paper
} from '@mui/material';
import { MessageCircle, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { db } from '../../firebase/firebaseConfig';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

const NewsComments = ({ articleId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [expanded, setExpanded] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const { currentUser } = useAuth();

    useEffect(() => {
        if (!articleId) return;

        const q = query(
            collection(db, 'news_comments'),
            where('articleId', '==', articleId),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const commentsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setComments(commentsData);
        });

        return unsubscribe;
    }, [articleId]);

    const handleSubmitComment = async () => {
        if (!newComment.trim() || !currentUser) return;

        setSubmitting(true);
        try {
            await addDoc(collection(db, 'news_comments'), {
                articleId,
                userId: currentUser.uid,
                userName: currentUser.displayName || 'Usuario Anónimo',
                userPhoto: currentUser.photoURL || '',
                comment: newComment.trim(),
                createdAt: serverTimestamp()
            });
            setNewComment('');
        } catch (error) {
            console.error("Error posting comment: ", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmitComment();
        }
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }} />

            {/* Comments Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MessageCircle size={20} color="#5f6368" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#5f6368' }}>
                        Comentarios
                    </Typography>
                    {comments.length > 0 && (
                        <Badge badgeContent={comments.length} color="primary" />
                    )}
                </Box>
                <IconButton
                    size="small"
                    onClick={() => setExpanded(!expanded)}
                    sx={{ color: '#5f6368' }}
                >
                    {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </IconButton>
            </Box>

            <Collapse in={expanded}>
                <Stack spacing={2}>
                    {/* Comment Input */}
                    {currentUser ? (
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                            <Avatar
                                src={currentUser.photoURL}
                                alt={currentUser.displayName}
                                sx={{ width: 32, height: 32 }}
                            />
                            <Box sx={{ flexGrow: 1 }}>
                                <TextField
                                    fullWidth
                                    multiline
                                    maxRows={4}
                                    placeholder="Escribe un comentario..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    size="small"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2
                                        }
                                    }}
                                />
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        endIcon={<Send size={16} />}
                                        onClick={handleSubmitComment}
                                        disabled={!newComment.trim() || submitting}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        {submitting ? 'Enviando...' : 'Comentar'}
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    ) : (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                bgcolor: '#f8f9fa',
                                border: '1px solid #e0e0e0',
                                borderRadius: 2,
                                textAlign: 'center'
                            }}
                        >
                            <Typography variant="body2" color="text.secondary">
                                Inicia sesión para comentar
                            </Typography>
                        </Paper>
                    )}

                    {/* Comments List */}
                    {comments.length > 0 ? (
                        <Stack spacing={2} sx={{ mt: 2 }}>
                            {comments.map((comment) => (
                                <Box key={comment.id} sx={{ display: 'flex', gap: 1.5 }}>
                                    <Avatar
                                        src={comment.userPhoto}
                                        alt={comment.userName}
                                        sx={{ width: 32, height: 32 }}
                                    />
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                {comment.userName}
                                            </Typography>
                                            {comment.createdAt && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {comment.createdAt.toDate().toLocaleDateString('es-ES', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </Typography>
                                            )}
                                        </Box>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                whiteSpace: 'pre-wrap',
                                                wordBreak: 'break-word',
                                                color: '#3c4043'
                                            }}
                                        >
                                            {comment.comment}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Stack>
                    ) : (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ textAlign: 'center', py: 2 }}
                        >
                            No hay comentarios aún. ¡Sé el primero en comentar!
                        </Typography>
                    )}
                </Stack>
            </Collapse>
        </Box>
    );
};

export default NewsComments;
