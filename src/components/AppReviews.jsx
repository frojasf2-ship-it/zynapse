import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Rating,
    TextField,
    Box,
    Typography,
    Stack,
    Avatar,
    Divider,
    IconButton
} from '@mui/material';
import { Trash2 } from 'lucide-react';
import { db } from '../firebase/firebaseConfig';
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    getDocs
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const AppReviews = ({ appId, open, onClose }) => {
    const { user, userProfile, isAdmin } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [userReview, setUserReview] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!appId || !open) return;

        const reviewsQuery = query(
            collection(db, 'app_reviews'),
            where('appId', '==', appId),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(reviewsQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setReviews(data);

            if (user) {
                const myReview = data.find(r => r.userId === user.uid);
                setUserReview(myReview || null);
                if (myReview) {
                    setRating(myReview.rating);
                    setComment(myReview.comment || '');
                }
            }
        });

        return () => unsubscribe();
    }, [appId, user, open]);

    const updateAppRating = async (appId) => {
        try {
            const reviewsQuery = query(
                collection(db, 'app_reviews'),
                where('appId', '==', appId)
            );
            const snapshot = await getDocs(reviewsQuery);
            const allReviews = snapshot.docs.map(doc => doc.data());

            const averageRating = allReviews.length > 0
                ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
                : 0;

            await updateDoc(doc(db, 'development_apps', appId), {
                averageRating: Number(averageRating.toFixed(1)),
                reviewCount: allReviews.length
            });
        } catch (error) {
            console.error('Error updating app rating:', error);
        }
    };

    const handleSubmit = async () => {
        if (!user || rating === 0) return;

        setSubmitting(true);
        try {
            if (userReview) {
                await updateDoc(doc(db, 'app_reviews', userReview.id), {
                    rating,
                    comment,
                    updatedAt: serverTimestamp()
                });
            } else {
                await addDoc(collection(db, 'app_reviews'), {
                    appId,
                    userId: user.uid,
                    userName: userProfile?.displayName || 'Usuario',
                    userPhoto: userProfile?.photoURL || '',
                    rating,
                    comment,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
            }

            await updateAppRating(appId);
            setRating(0);
            setComment('');
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Error al enviar la calificación');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('¿Eliminar esta calificación?')) return;

        try {
            await deleteDoc(doc(db, 'app_reviews', reviewId));
            await updateAppRating(appId);
        } catch (error) {
            console.error('Error deleting review:', error);
        }
    };

    const averageRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Calificaciones y Comentarios</Typography>
                    <Box sx={{ textAlign: 'right' }}>
                        <Rating value={averageRating} precision={0.1} readOnly />
                        <Typography variant="body2" color="text.secondary">
                            {averageRating.toFixed(1)} ({reviews.length})
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={3}>
                    {user && (
                        <Box sx={{ bgcolor: '#f5f5f5', p: 3, borderRadius: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                                {userReview ? 'Editar mi calificación' : 'Calificar esta aplicación'}
                            </Typography>
                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        Tu calificación:
                                    </Typography>
                                    <Rating
                                        value={rating}
                                        onChange={(e, newValue) => setRating(newValue)}
                                        size="large"
                                    />
                                </Box>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    placeholder="Escribe tu comentario (opcional)"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleSubmit}
                                    disabled={rating === 0 || submitting}
                                >
                                    {submitting ? 'Enviando...' : userReview ? 'Actualizar' : 'Enviar Calificación'}
                                </Button>
                            </Stack>
                        </Box>
                    )}

                    {!user && (
                        <Box sx={{ textAlign: 'center', py: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Inicia sesión para calificar esta aplicación
                            </Typography>
                        </Box>
                    )}

                    <Divider />

                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                            Todas las calificaciones
                        </Typography>
                        <Stack spacing={2}>
                            {reviews.map((review) => (
                                <Box key={review.id} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                            <Avatar src={review.userPhoto} alt={review.userName}>
                                                {review.userName?.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                    {review.userName}
                                                </Typography>
                                                <Rating value={review.rating} size="small" readOnly />
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                {review.createdAt?.toDate().toLocaleDateString()}
                                            </Typography>
                                            {(isAdmin || review.userId === user?.uid) && (
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteReview(review.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </IconButton>
                                            )}
                                        </Box>
                                    </Box>
                                    {review.comment && (
                                        <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                                            {review.comment}
                                        </Typography>
                                    )}
                                </Box>
                            ))}
                            {reviews.length === 0 && (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No hay calificaciones aún. ¡Sé el primero en calificar!
                                    </Typography>
                                </Box>
                            )}
                        </Stack>
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cerrar</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AppReviews;
