// src/components/HeroBanner.jsx
import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const HeroBanner = ({ children }) => {
    return (
        <Box
            sx={{
                width: '100%',
                minHeight: { xs: '40vh', md: '55vh' },
                backgroundImage: ` url(/images/hero-background.jpg)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                textAlign: 'center',
                position: 'relative',
                py: { xs: 4, md: 0 },
            }}
        >
            <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="h2" component="h1" sx={{ fontWeight: 900, mb: 2, fontFamily: 'Montserrat, Roboto, Arial', letterSpacing: 1, fontSize: { xs: 28, md: 44 } }}>
                    Khám phá Cơ hội, Kiến tạo Tương lai
                </Typography>
                <Typography variant="h5" component="p" sx={{ mb: 4, fontWeight: 500, fontFamily: 'Montserrat, Roboto, Arial', fontSize: { xs: 16, md: 24 } }}>
                    Nền tảng tuyển dụng hàng đầu dành cho bạn.
                </Typography>
                {children}
            </Container>
        </Box>
    );
};

export default HeroBanner;