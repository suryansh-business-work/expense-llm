import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  Box, 
  Paper,
  Typography,
  IconButton,
  Breadcrumbs,
  Link,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  Tooltip,
  Divider,
  Snackbar,
  Alert,
  Chip,
  ListItemIcon,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import {
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  InsertDriveFile as FileIcon,
  ArrowBack as BackIcon,
  CreateNewFolder as NewFolderIcon,
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ContentCopy as CopyIcon,
  DriveFileMove as MoveIcon,
  CloudDownload as DownloadIcon,
  CloudUpload as UploadIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  Description as DescriptionIcon,
  Code as CodeIcon,
  Image as ImageIcon,
  Videocam as VideoIcon,
  AudioFile as AudioIcon,
  Archive as ArchiveIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import Fade from '@mui/material/Fade';
import * as api from '../../services/api';
import { useParams } from 'react-router-dom';

// File type icons mapping
const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  // Common file types
  switch (extension) {
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
    case 'py':
    case 'java':
    case 'c':
    case 'cpp':
    case 'go':
    case 'php':
    case 'rb':
    case 'sh':
      return <CodeIcon />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
    case 'webp':
      return <ImageIcon />;
    case 'mp4':
    case 'mov':
    case 'avi':
    case 'webm':
      return <VideoIcon />;
    case 'mp3':
    case 'wav':
    case 'ogg':
    case 'flac':
      return <AudioIcon />;
    case 'zip':
    case 'tar':
    case 'gz':
    case 'rar':
      return <ArchiveIcon />;
    case 'pdf':
    case 'doc':
    case 'docx':
    case 'txt':
    case 'md':
      return <DescriptionIcon />;
    default:
      return <FileIcon />;
  }
};

// Format bytes to human-readable form
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileExplorer = () => {
  const { containerId } = useParams<{ containerId: any }>();
  const [currentPath, setCurrentPath] = useState('/');
  const [files, setFiles] = useState<api.FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  const [selectedFile, setSelectedFile] = useState<api.FileInfo | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);
  
  const [editorOpen, setEditorOpen] = useState(false);
  const [fileContent, setFileContent] = useState('');
  const [editingFile, setEditingFile] = useState<api.FileInfo | null>(null);
  
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Load files for the current path
  useEffect(() => {
    loadFiles();
  }, [currentPath, containerId]);
  
  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const fileList = await api.listFiles(containerId, currentPath);
      
      // Sort directories first, then files
      const sortedFiles = fileList.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
      
      setFiles(sortedFiles);
    } catch (err) {
      setError(`Error loading files: ${err instanceof Error ? err.message : String(err)}`);
      showNotification('error', `Failed to load files: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileClick = async (file: api.FileInfo) => {
    if (file.isDirectory) {
      // Navigate into directory with animation
      setCurrentPath(file.path);
    } else {
      // Open file editor for text files
      try {
        setEditorOpen(true);
        setEditingFile(file);
        setLoading(true);
        const content = await api.getFileContent(containerId, file.path);
        setFileContent(content);
      } catch (err) {
        setError(`Error opening file: ${err instanceof Error ? err.message : String(err)}`);
        showNotification('error', `Failed to open file: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleSaveFile = async () => {
    if (!editingFile) return;
    
    try {
      setLoading(true);
      await api.writeFileContent(containerId, editingFile.path, fileContent);
      setEditorOpen(false);
      setEditingFile(null);
      loadFiles(); // Refresh file list
      showNotification('success', 'File saved successfully!');
    } catch (err) {
      setError(`Error saving file: ${err instanceof Error ? err.message : String(err)}`);
      showNotification('error', `Failed to save file: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleNavigateUp = () => {
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
    setCurrentPath(parentPath);
  };
  
  const handleNewFolder = async () => {
    if (!newFolderName) return;
    
    try {
      const folderPath = `${currentPath}/${newFolderName}`.replace(/\/\//g, '/');
      await api.createDirectory(containerId, folderPath);
      setNewFolderDialogOpen(false);
      setNewFolderName('');
      loadFiles(); // Refresh file list
      showNotification('success', 'Folder created successfully!');
    } catch (err) {
      setError(`Error creating folder: ${err instanceof Error ? err.message : String(err)}`);
      showNotification('error', `Failed to create folder: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  const handleDeleteFile = async () => {
    if (!selectedFile) return;
    
    try {
      await api.deleteFileOrDirectory(
        containerId, 
        selectedFile.path, 
        selectedFile.isDirectory
      );
      setContextMenu(null);
      setSelectedFile(null);
      loadFiles(); // Refresh file list
      showNotification('success', `${selectedFile.isDirectory ? 'Directory' : 'File'} deleted successfully!`);
    } catch (err) {
      setError(`Error deleting file: ${err instanceof Error ? err.message : String(err)}`);
      showNotification('error', `Failed to delete: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  const handleDownloadFile = () => {
    if (!selectedFile || selectedFile.isDirectory) return;
    
    // Open file download URL in a new tab
    const downloadUrl = api.getFileDownloadUrl(containerId, selectedFile.path);
    window.open(downloadUrl, '_blank');
    setContextMenu(null);
    setSelectedFile(null);
  };
  
  // File upload handling with react-dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      
      setIsUploading(true);
      setUploadProgress(0);
      
      // Upload each file sequentially
      try {
        for (let i = 0; i < acceptedFiles.length; i++) {
          const file = acceptedFiles[i];
          const progress = Math.round((i / acceptedFiles.length) * 100);
          setUploadProgress(progress);
          
          await api.uploadFile(containerId, file, currentPath);
        }
        
        setUploadProgress(100);
        loadFiles(); // Refresh file list
        showNotification('success', 'Files uploaded successfully!');
      } catch (err) {
        setError(`Error uploading files: ${err instanceof Error ? err.message : String(err)}`);
        showNotification('error', `Failed to upload files: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsUploading(false);
      }
    }
  });
  
  // Show notifications
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
  };
  
  const closeNotification = () => {
    setNotification(null);
  };
  
  // Path breadcrumbs rendering helper
  const renderBreadcrumbs = () => {
    const pathParts = currentPath.split('/').filter(Boolean);
    
    return (
      <Breadcrumbs 
        aria-label="breadcrumb" 
        sx={{ 
          py: 1, 
          px: 2, 
          borderRadius: 1, 
          bgcolor: 'background.paper', 
          boxShadow: 1,
          '& .MuiBreadcrumbs-separator': {
            mx: 0.5
          }
        }}
      >
        <Link
          component={motion.button}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          color="primary"
          sx={{ display: 'flex', alignItems: 'center', border: 'none', background: 'none', cursor: 'pointer' }}
          onClick={() => setCurrentPath('/')}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          root
        </Link>
        
        {pathParts.map((part, index) => {
          const path = '/' + pathParts.slice(0, index + 1).join('/');
          return (
            <Link
              key={path}
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              color="inherit"
              sx={{ border: 'none', background: 'none', cursor: 'pointer' }}
              onClick={() => setCurrentPath(path)}
            >
              {part}
            </Link>
          );
        })}
      </Breadcrumbs>
    );
  };
  
  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'background.default',
      borderRadius: 1,
      overflow: 'hidden',
    }}>
      {/* Top action bar */}
      <Box 
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        sx={{ 
          p: 2,
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <Tooltip title="Go up">
            <IconButton 
              component={motion.button}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNavigateUp} 
              disabled={currentPath === '/'}
              sx={{ mr: 1 }}
            >
              <BackIcon />
            </IconButton>
          </Tooltip>
          {renderBreadcrumbs()}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton 
              component={motion.button}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={loadFiles}
              color="primary"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Upload files">
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <IconButton 
                component={motion.button}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                color="primary"
              >
                <UploadIcon />
              </IconButton>
            </div>
          </Tooltip>
          
          <Tooltip title="New folder">
            <IconButton 
              component={motion.button}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setNewFolderDialogOpen(true)}
              color="primary"
            >
              <NewFolderIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Upload progress */}
      {isUploading && (
        <Box sx={{ width: '100%', position: 'relative' }}>
          <LinearProgress 
            variant="determinate" 
            value={uploadProgress} 
            sx={{ height: 6 }} 
          />
          <Typography 
            variant="caption" 
            sx={{ 
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'text.secondary'
            }}
          >
            {`${Math.round(uploadProgress)}%`}
          </Typography>
        </Box>
      )}
      
      {/* Drop zone overlay when dragging */}
      {isDragActive && (
        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0, 0, 0, 0.6)',
            color: 'white',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}
        >
          <UploadIcon sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5">Drop files here to upload</Typography>
        </Box>
      )}
      
      {/* Main content area */}
      <TableContainer 
        component={Paper} 
        elevation={0}
        sx={{ 
          flexGrow: 1, 
          borderRadius: 0,
          overflow: 'auto',
          position: 'relative',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
          },
        }}
      >
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell width="50%">Name</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Permissions</TableCell>
                  <TableCell>Modified</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Skeleton variant="circular" width={24} height={24} sx={{ mr: 2 }} />
                        <Skeleton variant="text" width={150} />
                      </Box>
                    </TableCell>
                    <TableCell><Skeleton variant="text" width={80} /></TableCell>
                    <TableCell><Skeleton variant="text" width={100} /></TableCell>
                    <TableCell><Skeleton variant="text" width={120} /></TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Skeleton variant="circular" width={30} height={30} sx={{ ml: 1 }} />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </motion.div>
        )}
        
        {!loading && error && (
          <Box 
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{ 
              p: 4, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center'
            }}
          >
            <Alert 
              severity="error" 
              sx={{ mb: 2, width: '100%', maxWidth: 500 }}
            >
              {error}
            </Alert>
            <Button 
              startIcon={<RefreshIcon />} 
              variant="contained" 
              onClick={loadFiles}
            >
              Try Again
            </Button>
          </Box>
        )}
        
        {!loading && !error && files.length === 0 && (
          <Box 
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{ 
              p: 4, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'text.secondary'
            }}
          >
            <FolderOpenIcon sx={{ fontSize: 60, opacity: 0.3, mb: 2 }} />
            <Typography variant="h6" gutterBottom>Empty Directory</Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              This directory has no files or folders
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                component={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                variant="contained" 
                startIcon={<NewFolderIcon />}
                onClick={() => setNewFolderDialogOpen(true)}
              >
                New Folder
              </Button>
              <div {...getRootProps()} style={{ display: 'inline-block' }}>
                <Button
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  component={motion.button}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <input {...getInputProps()} />
                  Upload Files
                </Button>
              </div>
            </Box>
          </Box>
        )}
        
        {!loading && !error && files.length > 0 && (
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell width="50%">Name</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Permissions</TableCell>
                <TableCell>Modified</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <AnimatePresence>
                {files.map((file) => (
                  <TableRow
                    component={motion.tr}
                    key={file.path}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    hover
                    onClick={() => handleFileClick(file)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {file.isDirectory ? (
                          <FolderIcon color="primary" sx={{ mr: 1 }} />
                        ) : (
                          <Box sx={{ mr: 1 }}>
                            {getFileIcon(file.name)}
                          </Box>
                        )}
                        <Typography variant="body2" noWrap>
                          {file.name}
                        </Typography>
                        {file.name.endsWith('.sh') && (
                          <Chip 
                            size="small" 
                            label="Executable" 
                            color="success" 
                            variant="outlined" 
                            sx={{ ml: 1, height: 20 }} 
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {file.isDirectory ? '--' : formatBytes(file.size)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={file.permissions}>
                        <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'monospace' }}>
                          {file.permissions}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {new Date(file.modified).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(file);
                          setContextMenu({ x: e.clientX, y: e.clientY });
                        }}
                      >
                        <MoreIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        )}
      </TableContainer>
      
      {/* Context menu */}
      <Menu
        open={contextMenu !== null}
        onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.y, left: contextMenu.x }
            : undefined
        }
        // TransitionComponent={motion.div}
        TransitionComponent={Fade}
      >
        {selectedFile && !selectedFile.isDirectory && (
          <MenuItem onClick={() => {
            setContextMenu(null);
            handleFileClick(selectedFile);
          }}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="body2">Edit</Typography>
          </MenuItem>
        )}
        
        {selectedFile && !selectedFile.isDirectory && (
          <MenuItem onClick={handleDownloadFile}>
            <ListItemIcon>
              <DownloadIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="body2">Download</Typography>
          </MenuItem>
        )}
        
        <MenuItem onClick={handleDeleteFile}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <Typography variant="body2" color="error">Delete</Typography>
        </MenuItem>
      </Menu>
      
      {/* File editor dialog */}
      <Dialog 
        open={editorOpen} 
        onClose={() => setEditorOpen(false)}
        fullWidth
        maxWidth="md"
        TransitionComponent={Fade}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {getFileIcon(editingFile?.name || '')}
            <Typography sx={{ ml: 1 }}>{editingFile?.name}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TextField
              multiline
              fullWidth
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              minRows={20}
              maxRows={30}
              variant="outlined"
              InputProps={{
                style: { 
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                  }
                }
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEditorOpen(false)}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveFile}
            variant="contained" 
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* New folder dialog */}
      <Dialog 
        open={newFolderDialogOpen} 
        onClose={() => setNewFolderDialogOpen(false)}
        TransitionComponent={Fade}
      >
        <DialogTitle>
          Create New Folder
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            variant="outlined"
            InputProps={{
              startAdornment: <FolderIcon sx={{ mr: 1, color: 'primary.main' }} />
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewFolderDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleNewFolder} 
            variant="contained" 
            color="primary"
            disabled={!newFolderName.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notifications */}
      {notification && (
        <Snackbar
          open={notification !== null}
          autoHideDuration={5000}
          onClose={closeNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          TransitionComponent={Fade}
        >
          <Alert 
            onClose={closeNotification} 
            severity={notification.type}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default FileExplorer;