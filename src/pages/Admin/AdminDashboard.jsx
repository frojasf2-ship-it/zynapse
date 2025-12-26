import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Select,
    MenuItem,
    Chip,
    Avatar,
    IconButton,
    TextField,
    Card,
    CardContent,
    Grid,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db, storage } from '../../firebase/firebaseConfig';
import {
    collection,
    query,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
    orderBy,
    addDoc,
    serverTimestamp,
    setDoc,
    getDoc
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import {
    Shield,
    Users,
    Database,
    Trash2,
    MessageSquare,
    TrendingUp,
    Eye,
    FileText,
    Plus,
    Newspaper,
    FlaskConical,
    Smartphone,
    Mail,
    Phone,
    MapPin,
    Save
} from 'lucide-react';

const AdminDashboard = () => {
    const { userProfile, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [users, setUsers] = useState([]);
    const [threads, setThreads] = useState([]);
    const [comments, setComments] = useState([]);
    const [researchArticles, setResearchArticles] = useState([]);
    const [newsArticles, setNewsArticles] = useState([]);
    const [apps, setApps] = useState([]);
    const [stats, setStats] = useState({ visits: 0, users: 0, threads: 0, comments: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [currentCollection, setCurrentCollection] = useState('');
    const [formData, setFormData] = useState({ title: '', content: '', description: '', imageUrl: '' });
    const [uploading, setUploading] = useState(false);
    const [contactInfo, setContactInfo] = useState({ email: '', phone: '', address: '' });
    const [contactSaving, setContactSaving] = useState(false);
    const [messages, setMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [messageDialogOpen, setMessageDialogOpen] = useState(false);

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
            return;
        }

        const unsubscribers = [];

        // Users
        const usersQuery = query(collection(db, 'users'));
        unsubscribers.push(onSnapshot(usersQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(data);
            setStats(prev => ({ ...prev, users: data.length }));
        }));

        // Threads
        const threadsQuery = query(collection(db, 'threads'), orderBy('createdAt', 'desc'));
        unsubscribers.push(onSnapshot(threadsQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setThreads(data);
            setStats(prev => ({ ...prev, threads: data.length }));
        }));

        // Comments
        const commentsQuery = query(collection(db, 'comments'), orderBy('createdAt', 'desc'));
        unsubscribers.push(onSnapshot(commentsQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setComments(data);
            setStats(prev => ({ ...prev, comments: data.length }));
        }));

        // Research Articles
        const researchQuery = query(collection(db, 'research_articles'), orderBy('createdAt', 'desc'));
        unsubscribers.push(onSnapshot(researchQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setResearchArticles(data);
        }));

        // News Articles
        const newsQuery = query(collection(db, 'news_articles'), orderBy('createdAt', 'desc'));
        unsubscribers.push(onSnapshot(newsQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNewsArticles(data);
        }));

        // Development Apps
        const appsQuery = query(collection(db, 'development_apps'), orderBy('createdAt', 'desc'));
        unsubscribers.push(onSnapshot(appsQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setApps(data);
        }));

        // Messages
        const messagesQuery = query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc'));
        unsubscribers.push(onSnapshot(messagesQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(data);
        }));

        // Stats
        const statsDoc = doc(db, 'stats', 'global');

        return () => unsubscribers.forEach(unsub => unsub());
    }, [isAdmin, navigate]);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateDoc(doc(db, 'users', userId), { role: newRole });
        } catch (error) {
            console.error("Error updating role: ", error);
        }
    };

    const handlePermissionToggle = async (userId, permissionKey, newValue) => {
        try {
            await updateDoc(doc(db, 'users', userId), {
                [`permissions.${permissionKey}`]: newValue
            });
        } catch (error) {
            console.error("Error updating permission: ", error);
        }
    };

    const handleDeleteThread = async (threadId) => {
        if (window.confirm('¿Estás seguro de eliminar este thread?')) {
            try {
                await deleteDoc(doc(db, 'threads', threadId));
            } catch (error) {
                console.error("Error deleting thread: ", error);
            }
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (window.confirm('¿Estás seguro de eliminar este comentario?')) {
            try {
                await deleteDoc(doc(db, 'comments', commentId));
            } catch (error) {
                console.error("Error deleting comment: ", error);
            }
        }
    };

    const handleDeleteItem = async (collectionName, itemId) => {
        if (window.confirm('¿Estás seguro de eliminar este elemento?')) {
            try {
                await deleteDoc(doc(db, collectionName, itemId));
            } catch (error) {
                console.error("Error deleting item: ", error);
            }
        }
    };

    const handleOpenDialog = (collection) => {
        setCurrentCollection(collection);
        setFormData({ title: '', content: '', description: '', imageUrl: '' });
        setOpenDialog(true);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const storageRef = ref(storage, `${currentCollection}/${Date.now()}_${file.name}`);
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
        try {
            await addDoc(collection(db, currentCollection), {
                ...formData,
                createdAt: serverTimestamp(),
                authorId: userProfile.email,
                authorName: userProfile.displayName
            });
            setOpenDialog(false);
            setFormData({ title: '', content: '', description: '', imageUrl: '' });
        } catch (error) {
            console.error("Error creating document: ", error);
        }
    };

    const handleSaveContactInfo = async () => {
        setContactSaving(true);
        try {
            await setDoc(doc(db, 'settings', 'contact'), contactInfo);
            alert('Información de contacto guardada exitosamente');
        } catch (error) {
            console.error("Error saving contact info: ", error);
            alert('Error al guardar la información');
        } finally {
            setContactSaving(false);
        }
    };

    const filteredThreads = threads.filter(thread =>
        thread.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        thread.content?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredComments = comments.filter(comment =>
        comment.content?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#202124', mb: 1 }}>
                    Panel de Administración
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Gestiona los usuarios, contenidos y roles de la plataforma zynapse.
                </Typography>
            </Box>

            <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 4, overflow: 'hidden' }}>
                <Tabs
                    value={tabValue}
                    onChange={(e, v) => setTabValue(v)}
                    sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab icon={<Users size={18} />} iconPosition="start" label="Usuarios" />
                    <Tab icon={<MessageSquare size={18} />} iconPosition="start" label="Foro" />
                    <Tab icon={<Database size={18} />} iconPosition="start" label="Estadísticas" />
                    <Tab icon={<FlaskConical size={18} />} iconPosition="start" label="Investigación" />
                    <Tab icon={<Newspaper size={18} />} iconPosition="start" label="Noticias" />
                    <Tab icon={<Smartphone size={18} />} iconPosition="start" label="Desarrollo" />
                    <Tab icon={<Mail size={18} />} iconPosition="start" label="Contacto" />
                    <Tab icon={<MessageSquare size={18} />} iconPosition="start" label="Mensajes" />
                </Tabs>

                <Box sx={{ p: 4 }}>
                    {tabValue === 0 && (
                        <Box>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Gestión de Miembros</Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Usuario</TableCell>
                                            <TableCell>Email</TableCell>
                                            <TableCell>Rol</TableCell>
                                            <TableCell>Cambiar Rol</TableCell>
                                            <TableCell align="center">Investigación</TableCell>
                                            <TableCell align="center">Noticias</TableCell>
                                            <TableCell align="center">Desarrollo</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Avatar src={user.photoURL} alt={user.displayName}>
                                                            {user.displayName?.charAt(0)}
                                                        </Avatar>
                                                        <Typography>{user.displayName || 'Sin nombre'}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={user.role || 'subscriber'}
                                                        color={user.role === 'admin' ? 'error' : user.role === 'moderator' ? 'warning' : 'default'}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={user.role || 'subscriber'}
                                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                        size="small"
                                                    >
                                                        <MenuItem value="subscriber">Subscriber</MenuItem>
                                                        <MenuItem value="moderator">Moderator</MenuItem>
                                                        <MenuItem value="admin">Admin</MenuItem>
                                                    </Select>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        icon={<FlaskConical size={14} />}
                                                        label={user.permissions?.canPublishResearch || user.role === 'admin' ? 'Sí' : 'No'}
                                                        color={user.permissions?.canPublishResearch || user.role === 'admin' ? 'success' : 'default'}
                                                        size="small"
                                                        onClick={() => handlePermissionToggle(user.id, 'canPublishResearch', !(user.permissions?.canPublishResearch))}
                                                        sx={{ cursor: user.role !== 'admin' ? 'pointer' : 'default' }}
                                                        disabled={user.role === 'admin'}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        icon={<Newspaper size={14} />}
                                                        label={user.permissions?.canPublishNews || user.role === 'admin' ? 'Sí' : 'No'}
                                                        color={user.permissions?.canPublishNews || user.role === 'admin' ? 'success' : 'default'}
                                                        size="small"
                                                        onClick={() => handlePermissionToggle(user.id, 'canPublishNews', !(user.permissions?.canPublishNews))}
                                                        sx={{ cursor: user.role !== 'admin' ? 'pointer' : 'default' }}
                                                        disabled={user.role === 'admin'}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        icon={<Smartphone size={14} />}
                                                        label={user.permissions?.canPublishDevelopment || user.role === 'admin' ? 'Sí' : 'No'}
                                                        color={user.permissions?.canPublishDevelopment || user.role === 'admin' ? 'success' : 'default'}
                                                        size="small"
                                                        onClick={() => handlePermissionToggle(user.id, 'canPublishDevelopment', !(user.permissions?.canPublishDevelopment))}
                                                        sx={{ cursor: user.role !== 'admin' ? 'pointer' : 'default' }}
                                                        disabled={user.role === 'admin'}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}

                    {/* TAB 1: FORUM */}
                    {tabValue === 1 && (
                        <Box>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Moderación de Foro</Typography>
                            <TextField
                                fullWidth
                                placeholder="Buscar threads o comentarios..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                sx={{ mb: 3 }}
                            />

                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Threads</Typography>
                            <TableContainer sx={{ mb: 4 }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Título</TableCell>
                                            <TableCell>Autor</TableCell>
                                            <TableCell>Comentarios</TableCell>
                                            <TableCell>Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredThreads.map((thread) => (
                                            <TableRow key={thread.id}>
                                                <TableCell>{thread.title}</TableCell>
                                                <TableCell>{thread.authorName}</TableCell>
                                                <TableCell>{thread.commentCount || 0}</TableCell>
                                                <TableCell>
                                                    <IconButton onClick={() => handleDeleteThread(thread.id)} color="error">
                                                        <Trash2 size={18} />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Comentarios</Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Contenido</TableCell>
                                            <TableCell>Autor</TableCell>
                                            <TableCell>Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredComments.map((comment) => (
                                            <TableRow key={comment.id}>
                                                <TableCell>{comment.content?.substring(0, 100)}...</TableCell>
                                                <TableCell>{comment.authorName}</TableCell>
                                                <TableCell>
                                                    <IconButton onClick={() => handleDeleteComment(comment.id)} color="error">
                                                        <Trash2 size={18} />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}

                    {/* TAB 2: STATS */}
                    {tabValue === 2 && (
                        <Box>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Estadísticas de la Plataforma</Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Eye color="#1976d2" size={32} />
                                                <Box>
                                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.visits}</Typography>
                                                    <Typography color="text.secondary">Visitas Totales</Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Users color="#2e7d32" size={32} />
                                                <Box>
                                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.users}</Typography>
                                                    <Typography color="text.secondary">Usuarios</Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <MessageSquare color="#ed6c02" size={32} />
                                                <Box>
                                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.threads}</Typography>
                                                    <Typography color="text.secondary">Threads</Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <FileText color="#9c27b0" size={32} />
                                                <Box>
                                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.comments}</Typography>
                                                    <Typography color="text.secondary">Comentarios</Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {/* TAB 3: RESEARCH */}
                    {tabValue === 3 && (
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>Artículos de Investigación</Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<Plus size={18} />}
                                    onClick={() => handleOpenDialog('research_articles')}
                                >
                                    Nuevo Artículo
                                </Button>
                            </Box>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Título</TableCell>
                                            <TableCell>Autor</TableCell>
                                            <TableCell>Fecha</TableCell>
                                            <TableCell>Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {researchArticles.map((article) => (
                                            <TableRow key={article.id}>
                                                <TableCell>{article.title}</TableCell>
                                                <TableCell>{article.authorName}</TableCell>
                                                <TableCell>{article.createdAt?.toDate().toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <IconButton onClick={() => handleDeleteItem('research_articles', article.id)} color="error">
                                                        <Trash2 size={18} />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}

                    {/* TAB 4: NEWS */}
                    {tabValue === 4 && (
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>Noticias</Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<Plus size={18} />}
                                    onClick={() => handleOpenDialog('news_articles')}
                                >
                                    Nueva Noticia
                                </Button>
                            </Box>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Título</TableCell>
                                            <TableCell>Autor</TableCell>
                                            <TableCell>Fecha</TableCell>
                                            <TableCell>Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {newsArticles.map((article) => (
                                            <TableRow key={article.id}>
                                                <TableCell>{article.title}</TableCell>
                                                <TableCell>{article.authorName}</TableCell>
                                                <TableCell>{article.createdAt?.toDate().toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <IconButton onClick={() => handleDeleteItem('news_articles', article.id)} color="error">
                                                        <Trash2 size={18} />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}

                    {/* TAB 5: DEVELOPMENT */}
                    {tabValue === 5 && (
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>Aplicaciones de Desarrollo</Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<Plus size={18} />}
                                    onClick={() => handleOpenDialog('development_apps')}
                                >
                                    Nueva App
                                </Button>
                            </Box>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Título</TableCell>
                                            <TableCell>Autor</TableCell>
                                            <TableCell>Fecha</TableCell>
                                            <TableCell>Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {apps.map((app) => (
                                            <TableRow key={app.id}>
                                                <TableCell>{app.title}</TableCell>
                                                <TableCell>{app.authorName}</TableCell>
                                                <TableCell>{app.createdAt?.toDate().toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <IconButton onClick={() => handleDeleteItem('development_apps', app.id)} color="error">
                                                        <Trash2 size={18} />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}

                    {/* TAB 6: CONTACT INFO */}
                    {tabValue === 6 && (
                        <Box>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Información de Contacto</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                                Esta información se mostrará en la página de contacto pública.
                            </Typography>

                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Card elevation={0} sx={{ border: '1px solid #e0e0e0', p: 2 }}>
                                        <CardContent>
                                            <Stack spacing={3}>
                                                <Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                        <Mail size={20} color="#1976d2" />
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                            Email de Contacto
                                                        </Typography>
                                                    </Box>
                                                    <TextField
                                                        fullWidth
                                                        type="email"
                                                        placeholder="contacto@ejemplo.com"
                                                        value={contactInfo.email || ''}
                                                        onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                                                    />
                                                </Box>

                                                <Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                        <Phone size={20} color="#2e7d32" />
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                            Teléfono
                                                        </Typography>
                                                    </Box>
                                                    <TextField
                                                        fullWidth
                                                        placeholder="+54 11 1234-5678"
                                                        value={contactInfo.phone || ''}
                                                        onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                                                    />
                                                </Box>

                                                <Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                        <MapPin size={20} color="#ed6c02" />
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                            Dirección
                                                        </Typography>
                                                    </Box>
                                                    <TextField
                                                        fullWidth
                                                        multiline
                                                        rows={3}
                                                        placeholder="Calle, Ciudad, País"
                                                        value={contactInfo.address || ''}
                                                        onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                                                    />
                                                </Box>

                                                <Button
                                                    variant="contained"
                                                    startIcon={<Save size={18} />}
                                                    onClick={handleSaveContactInfo}
                                                    disabled={contactSaving}
                                                    sx={{ mt: 2 }}
                                                >
                                                    {contactSaving ? 'Guardando...' : 'Guardar Cambios'}
                                                </Button>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Card elevation={0} sx={{ border: '1px solid #e3f2fd', bgcolor: '#f5f5f5', p: 2 }}>
                                        <CardContent>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                                Vista Previa
                                            </Typography>
                                            <Stack spacing={2}>
                                                {contactInfo.email && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Mail size={18} color="#1976d2" />
                                                        <Typography variant="body2">{contactInfo.email}</Typography>
                                                    </Box>
                                                )}
                                                {contactInfo.phone && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Phone size={18} color="#2e7d32" />
                                                        <Typography variant="body2">{contactInfo.phone}</Typography>
                                                    </Box>
                                                )}
                                                {contactInfo.address && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <MapPin size={18} color="#ed6c02" />
                                                        <Typography variant="body2">{contactInfo.address}</Typography>
                                                    </Box>
                                                )}
                                                {!contactInfo.email && !contactInfo.phone && !contactInfo.address && (
                                                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                        No hay información de contacto configurada
                                                    </Typography>
                                                )}
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {tabValue === 7 && (
                        <Box>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Mensajes de Contacto</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                                Mensajes recibidos desde el formulario de contacto público.
                            </Typography>

                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Nombre</TableCell>
                                            <TableCell>Email</TableCell>
                                            <TableCell>Fecha</TableCell>
                                            <TableCell>Estado</TableCell>
                                            <TableCell align="right">Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {messages.map((msg) => (
                                            <TableRow key={msg.id}>
                                                <TableCell>{msg.name}</TableCell>
                                                <TableCell>{msg.email}</TableCell>
                                                <TableCell>
                                                    {msg.createdAt?.toDate().toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={msg.status === 'new' ? 'Nuevo' : msg.status === 'read' ? 'Leído' : 'Archivado'}
                                                        color={msg.status === 'new' ? 'primary' : msg.status === 'read' ? 'default' : 'secondary'}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Button
                                                        size="small"
                                                        onClick={() => {
                                                            setSelectedMessage(msg);
                                                            setMessageDialogOpen(true);
                                                            if (msg.status === 'new') {
                                                                updateDoc(doc(db, 'contact_messages', msg.id), { status: 'read' });
                                                            }
                                                        }}
                                                    >
                                                        Ver
                                                    </Button>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => {
                                                            if (window.confirm('¿Eliminar este mensaje?')) {
                                                                deleteDoc(doc(db, 'contact_messages', msg.id));
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {messages.length === 0 && (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No hay mensajes aún
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    )}
                </Box>
            </Paper>

            {/* Dialog for Creating Content */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Crear Nuevo Contenido</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Título"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="Descripción"
                            multiline
                            rows={2}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="Contenido"
                            multiline
                            rows={4}
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        />
                        <Box>
                            <Button variant="outlined" component="label" disabled={uploading}>
                                {uploading ? 'Subiendo...' : 'Subir Imagen'}
                                <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                            </Button>
                            {formData.imageUrl && (
                                <Box sx={{ mt: 2 }}>
                                    <img src={formData.imageUrl} alt="Preview" style={{ maxWidth: '100%', borderRadius: 8 }} />
                                </Box>
                            )}
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained">Crear</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog for Viewing Messages */}
            <Dialog open={messageDialogOpen} onClose={() => setMessageDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Mensaje de Contacto</DialogTitle>
                <DialogContent>
                    {selectedMessage && (
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Nombre:</Typography>
                                <Typography variant="body1">{selectedMessage.name}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Email:</Typography>
                                <Typography variant="body1">{selectedMessage.email}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Fecha:</Typography>
                                <Typography variant="body1">
                                    {selectedMessage.createdAt?.toDate().toLocaleString()}
                                </Typography>
                            </Box>
                            <Divider />
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Mensaje:</Typography>
                                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {selectedMessage.message}
                                </Typography>
                            </Box>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setMessageDialogOpen(false)}>Cerrar</Button>
                    {selectedMessage && selectedMessage.status !== 'archived' && (
                        <Button
                            onClick={() => {
                                updateDoc(doc(db, 'contact_messages', selectedMessage.id), { status: 'archived' });
                                setMessageDialogOpen(false);
                            }}
                            variant="outlined"
                        >
                            Archivar
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminDashboard;
