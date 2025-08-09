import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Card, CardContent, CardActions, Button, Typography, Box, IconButton, Avatar } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

function JobCard({ job, isFavorited, onToggleFavorite, isAuthenticated }) {
    const handleFavoriteClick = (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            alert('Vui lòng đăng nhập để sử dụng chức năng này.');
            return;
        }
        onToggleFavorite(job.id);
    };

    return (
        <Card sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6,
            }
        }}>
            <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                    <Avatar variant="rounded" src={job.employer?.logo}>
                        {job.employer?.company_name?.charAt(0)}
                    </Avatar>
                    <Box>
                        <Typography gutterBottom variant="h6" component="h2" noWrap>
                            {job.title}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                            {job.employer?.company_name || 'Tên công ty'}
                        </Typography>
                    </Box>
                </Box>
                <Typography variant="body2" sx={{ mt: 1 }}>
                    📍 {job.city?.name || 'N/A'}
                </Typography>
                <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                    💰 {new Intl.NumberFormat('vi-VN').format(job.min_salary)} - {new Intl.NumberFormat('vi-VN').format(job.max_salary)} {job.currency}
                </Typography>
            </CardContent>
            <CardActions>
                <Button size="small" component={RouterLink} to={`/jobs/${job.id}`}>
                    Xem chi tiết
                </Button>
                <IconButton onClick={handleFavoriteClick} sx={{ marginLeft: 'auto' }} aria-label="add to favorites">
                    {isFavorited ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                </IconButton>
            </CardActions>
        </Card>
    );
}

export default JobCard;